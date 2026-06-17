// POST /api/engine/run — kick off a loop step on an account.
// v1 supports the "audit" step (Scout). Body: { accountId?, step? }.
// accountId defaults to the single configured brand. Long-running: this can
// take tens of seconds (multi-turn agent loop) — call it from an ops context,
// not a user request path. Returns the run id + the agent's summary.

import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/engine/auth";
import { getDefaultAccount } from "@/lib/engine/db";
import { runAudit } from "@/lib/engine/runner";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow long agent loops on platforms that honor it

export async function POST(req: NextRequest) {
  const auth = await authorize(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json().catch(() => ({}));
    const step = (body.step as string) || "audit";
    if (step !== "audit") {
      return NextResponse.json(
        { error: `Step "${step}" not implemented yet. v1 supports "audit".` },
        { status: 400 }
      );
    }
    const accountId = (body.accountId as string) || (await getDefaultAccount()).id;
    const { runId, summary } = await runAudit(accountId);
    return NextResponse.json({ ok: true, runId, summary });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
