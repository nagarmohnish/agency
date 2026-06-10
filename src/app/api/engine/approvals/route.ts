// GET  /api/engine/approvals?accountId=  — list mutations awaiting sign-off.
// POST /api/engine/approvals  { actionId, decision: "approved"|"rejected", approvedBy }
//   — record the human decision; on "approved", execute the mutation now.
// This is the human-in-the-loop half of the governance gate.

import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/engine/auth";
import { getAccount, getDefaultAccount } from "@/lib/engine/db";
import { decideAction, listPendingApprovals } from "@/lib/engine/audit-log";
import { executeApproved } from "@/lib/engine/governance";
import { connectorFor } from "@/lib/engine/connectors";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const id = new URL(req.url).searchParams.get("accountId");
    const account = id ? await getAccount(id) : await getDefaultAccount();
    const pending = await listPendingApprovals(account.id);
    return NextResponse.json({ accountId: account.id, pending });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await req.json();
    const actionId = String(body.actionId ?? "");
    const decision = body.decision === "rejected" ? "rejected" : "approved";
    const approvedBy = String(body.approvedBy ?? "operator");
    if (!actionId) return NextResponse.json({ error: "actionId required" }, { status: 400 });

    const action = await decideAction(actionId, decision, approvedBy);
    if (decision === "rejected") {
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    // Approved → execute now through the same perform path the gate uses.
    const account = await getAccount(action.account_id);
    if (!action.platform) {
      return NextResponse.json({ error: "Action has no platform to execute against." }, { status: 400 });
    }
    const result = await executeApproved(account, action, (req2, opts) =>
      connectorFor(account, action.platform!).mutate(req2, opts)
    );
    return NextResponse.json({ ok: true, outcome: result.outcome, reason: result.reason });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
