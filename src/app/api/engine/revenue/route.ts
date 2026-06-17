// GET /api/engine/revenue?accountId=&days=30 — the revenue source of truth.
// Pulls REAL Shopify orders, and (when Meta is connected) the platform-reported
// purchase value for the same window, so we can show the gap between what the
// ad platform claims and what the store actually made. Read-only.

import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/engine/auth";
import { getAccount, getDefaultAccount } from "@/lib/engine/db";
import { getRevenue, shopifyConfiguredFor } from "@/lib/engine/shopify";
import { connectorFor } from "@/lib/engine/connectors";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function GET(req: NextRequest) {
  const auth = await authorize(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("accountId");
    const days = Math.min(90, Math.max(7, Number(url.searchParams.get("days")) || 30));
    const account = id ? await getAccount(id) : await getDefaultAccount();

    if (!(await shopifyConfiguredFor(account.id))) {
      return NextResponse.json({ configured: false, days });
    }

    const shopify = await getRevenue(account.id, days);

    // Reconcile against Meta's platform-reported purchase value (the Shopify
    // store's ads run on Meta), if Meta is connected.
    let metaReported: { revenueCents: number; conversions: number } | null = null;
    if (account.meta_ad_account_id) {
      try {
        const metrics = await connectorFor(account, "meta").getMetrics(days <= 30 ? days : 30);
        metaReported = metrics.reduce(
          (a, m) => ({ revenueCents: a.revenueCents + m.conversionValueCents, conversions: a.conversions + m.conversions }),
          { revenueCents: 0, conversions: 0 }
        );
      } catch {
        metaReported = null; // Meta not readable yet — skip reconciliation
      }
    }

    const discrepancyPct =
      metaReported && shopify.revenueCents > 0
        ? (metaReported.revenueCents - shopify.revenueCents) / shopify.revenueCents
        : null;

    return NextResponse.json({ configured: true, days, shopify, metaReported, discrepancyPct });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
