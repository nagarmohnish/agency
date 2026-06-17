// GET /api/engine/breakdowns?accountId=&days=30 — the "primary metrics" feed:
// traffic source (network), gender, and age, with spend + CAC. Pulled live and
// rolled up server-side both account-wide and per campaign. Read-only.

import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/engine/auth";
import { getAccount, getDefaultAccount } from "@/lib/engine/db";
import { configuredPlatforms, connectorFor } from "@/lib/engine/connectors";
import type { BreakdownRow, Platform } from "@/lib/engine/types";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

interface Seg {
  label: string;
  impressions: number;
  clicks: number;
  spendCents: number;
  conversions: number;
  conversionValueCents: number;
  cacCents: number | null; // spend / conversions
  ctr: number | null;
}

// Sort age labels naturally; everything else by spend (done later).
const AGE_ORDER = ["18–24", "25–34", "35–44", "45–54", "55–64", "65+", "Unknown"];

function rollup(rows: BreakdownRow[]): Seg[] {
  const m = new Map<string, Seg>();
  for (const r of rows) {
    const s =
      m.get(r.label) ??
      { label: r.label, impressions: 0, clicks: 0, spendCents: 0, conversions: 0, conversionValueCents: 0, cacCents: null, ctr: null };
    s.impressions += r.impressions;
    s.clicks += r.clicks;
    s.spendCents += r.spendCents;
    s.conversions += r.conversions;
    s.conversionValueCents += r.conversionValueCents;
    m.set(r.label, s);
  }
  return [...m.values()].map((s) => ({
    ...s,
    cacCents: s.conversions > 0 ? Math.round(s.spendCents / s.conversions) : null,
    ctr: s.impressions > 0 ? s.clicks / s.impressions : null,
  }));
}

const bySpend = (a: Seg, b: Seg) => b.spendCents - a.spendCents;
const byAge = (a: Seg, b: Seg) => AGE_ORDER.indexOf(a.label) - AGE_ORDER.indexOf(b.label);

export async function GET(req: NextRequest) {
  const auth = await authorize(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("accountId");
    const days = Math.min(30, Math.max(7, Number(url.searchParams.get("days")) || 30));
    const account = id ? await getAccount(id) : await getDefaultAccount();

    const platforms: Record<string, unknown> = {};

    await Promise.all(
      configuredPlatforms(account).map(async (p: Platform) => {
        try {
          const rows = await connectorFor(account, p).getBreakdowns(days);
          const dim = (d: BreakdownRow["dimension"]) => rows.filter((r) => r.dimension === d);

          // Account-level rollups.
          const network = rollup(dim("network")).sort(bySpend);
          const gender = rollup(dim("gender")).sort(bySpend);
          const age = rollup(dim("age")).sort(byAge);

          // Campaign-level (asks #2): per campaign, its gender + age split.
          // Keep the top campaigns by spend that actually have demo data.
          const spendByCampaign = new Map<string, { name: string; spendCents: number }>();
          for (const r of rows) {
            const c = spendByCampaign.get(r.campaignId) ?? { name: r.campaignName, spendCents: 0 };
            if (r.dimension === "gender") c.spendCents += r.spendCents; // avoid triple-counting
            spendByCampaign.set(r.campaignId, c);
          }
          const campaigns = [...spendByCampaign.entries()]
            .map(([cid, v]) => ({
              id: cid,
              name: v.name,
              spendCents: v.spendCents,
              gender: rollup(dim("gender").filter((r) => r.campaignId === cid)).sort(bySpend),
              age: rollup(dim("age").filter((r) => r.campaignId === cid)).sort(byAge),
            }))
            .filter((c) => c.gender.length > 0 || c.age.length > 0)
            .sort((a, b) => b.spendCents - a.spendCents)
            .slice(0, 12);

          platforms[p] = { network, gender, age, campaigns };
        } catch (e) {
          platforms[p] = { error: e instanceof Error ? e.message : String(e), network: [], gender: [], age: [], campaigns: [] };
        }
      })
    );

    return NextResponse.json({ accountId: account.id, currency: account.default_currency, days, platforms });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
