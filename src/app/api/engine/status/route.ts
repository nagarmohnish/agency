// GET /api/engine/status — health of the engine for an account: connector
// pings, recent actions, and pending-approval count. Read-only.

import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/engine/auth";
import { getAccount, getDefaultAccount } from "@/lib/engine/db";
import { listPendingApprovals, recentActions } from "@/lib/engine/audit-log";
import { verifyConnections } from "@/lib/engine/runner";
import { config, shopifyConfigured } from "@/lib/engine/config";
import { shopifyPing } from "@/lib/engine/shopify";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const id = new URL(req.url).searchParams.get("accountId");
    const account = id ? await getAccount(id) : await getDefaultAccount();
    const [connections, actions, pending] = await Promise.all([
      verifyConnections(account),
      recentActions(account.id, 25),
      listPendingApprovals(account.id),
    ]);
    // Shopify isn't an ad platform (not in verifyConnections) — ping separately.
    if (shopifyConfigured()) connections.shopify = await shopifyPing();
    return NextResponse.json({
      account: {
        id: account.id,
        name: account.name,
        autonomy: account.autonomy_level,
        dailySpendCapCents: account.daily_spend_cap_cents,
      },
      safety: { dryRun: config.safety.dryRun, globalDailyCapCents: config.safety.globalDailySpendCapCents },
      connections,
      pendingApprovals: pending.length,
      recentActions: actions,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
