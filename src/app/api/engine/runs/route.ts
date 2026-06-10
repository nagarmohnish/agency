// GET /api/engine/runs?accountId=&limit= — the transparency feed. Each run is
// grouped with the actions it produced (fetches + mutations) and its audit
// output, so the UI can show "what we fetched → what we analyzed → what we
// concluded" plus token cost. Read-only.

import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/engine/auth";
import { db, getAccount, getDefaultAccount } from "@/lib/engine/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("accountId");
    const limit = Math.min(25, Math.max(1, Number(url.searchParams.get("limit")) || 10));
    const account = id ? await getAccount(id) : await getDefaultAccount();

    const { data: runs, error: runsErr } = await db()
      .from("engine_runs")
      .select("*")
      .eq("account_id", account.id)
      .order("started_at", { ascending: false })
      .limit(limit);
    if (runsErr) throw new Error(runsErr.message);

    const ids = (runs ?? []).map((r) => r.id);
    // Pull all actions + audits for these runs in two queries, then group.
    const [{ data: actions }, { data: audits }] = await Promise.all([
      db().from("engine_actions").select("*").in("run_id", ids).order("created_at", { ascending: true }),
      db().from("engine_audit_runs").select("*").in("run_id", ids),
    ]);

    const byRun = (rid: string) => (actions ?? []).filter((a) => a.run_id === rid);
    const auditFor = (rid: string) => (audits ?? []).find((a) => a.run_id === rid) ?? null;

    const out = (runs ?? []).map((r) => {
      const acts = byRun(r.id);
      return {
        ...r,
        fetches: acts.filter((a) => a.kind === "read_campaigns" || a.kind === "read_metrics"),
        mutations: acts.filter((a) => a.kind !== "read_campaigns" && a.kind !== "read_metrics" && a.kind !== "submit_audit"),
        audit: auditFor(r.id),
      };
    });

    return NextResponse.json({ accountId: account.id, runs: out });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
