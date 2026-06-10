// GET /api/engine/campaigns?accountId=&days=30 — live campaigns + revenue KPIs
// per platform, pulled fresh from the connectors. Read-only. Powers the
// Campaigns screen. "Measured in revenue, not ROAS" — so we surface both, plus
// CAC, computed from real conversion value.

import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/engine/auth";
import { getAccount, getDefaultAccount } from "@/lib/engine/db";
import { configuredPlatforms, connectorFor } from "@/lib/engine/connectors";
import type { CampaignSummary, MetricRow, Platform } from "@/lib/engine/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Kpis {
  impressions: number;
  clicks: number;
  spendCents: number;
  conversions: number;
  revenueCents: number; // conversion value
  roas: number | null; // revenue / spend
  cacCents: number | null; // spend / conversions
  ctr: number | null; // clicks / impressions
}

function rollup(rows: MetricRow[]): Kpis {
  const t = rows.reduce(
    (a, r) => {
      a.impressions += r.impressions;
      a.clicks += r.clicks;
      a.spendCents += r.spendCents;
      a.conversions += r.conversions;
      a.revenueCents += r.conversionValueCents;
      return a;
    },
    { impressions: 0, clicks: 0, spendCents: 0, conversions: 0, revenueCents: 0 }
  );
  return {
    ...t,
    roas: t.spendCents > 0 ? t.revenueCents / t.spendCents : null,
    cacCents: t.conversions > 0 ? Math.round(t.spendCents / t.conversions) : null,
    ctr: t.impressions > 0 ? t.clicks / t.impressions : null,
  };
}

export async function GET(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("accountId");
    const days = Math.min(30, Math.max(7, Number(url.searchParams.get("days")) || 30));
    const account = id ? await getAccount(id) : await getDefaultAccount();

    const platforms = configuredPlatforms(account);
    const perPlatform: Record<string, { campaigns: CampaignSummary[]; kpis: Kpis; error?: string }> = {};
    const allRows: MetricRow[] = [];

    await Promise.all(
      platforms.map(async (p: Platform) => {
        try {
          const conn = connectorFor(account, p);
          const [campaigns, metrics] = await Promise.all([conn.listCampaigns(), conn.getMetrics(days)]);
          allRows.push(...metrics);
          perPlatform[p] = { campaigns, kpis: rollup(metrics) };
        } catch (e) {
          perPlatform[p] = {
            campaigns: [],
            kpis: rollup([]),
            error: e instanceof Error ? e.message : String(e),
          };
        }
      })
    );

    // Daily time-series across all platforms — feeds the trend chart.
    const dailyMap = new Map<string, { spendCents: number; conversions: number; revenueCents: number }>();
    for (const r of allRows) {
      const d = dailyMap.get(r.date) ?? { spendCents: 0, conversions: 0, revenueCents: 0 };
      d.spendCents += r.spendCents;
      d.conversions += r.conversions;
      d.revenueCents += r.conversionValueCents;
      dailyMap.set(r.date, d);
    }
    const daily = [...dailyMap.entries()]
      .filter(([date]) => date)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      accountId: account.id,
      currency: account.default_currency,
      days,
      combined: rollup(allRows),
      daily,
      platforms: perPlatform,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
