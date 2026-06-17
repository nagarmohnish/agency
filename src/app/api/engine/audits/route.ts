// GET /api/engine/audits?accountId= — the latest opportunity map (Scout's
// submit_audit output). Read-only. Powers the Audit screen.

import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/engine/auth";
import { db, getAccount, getDefaultAccount } from "@/lib/engine/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authorize(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const id = new URL(req.url).searchParams.get("accountId");
    const account = id ? await getAccount(id) : await getDefaultAccount();
    const { data, error } = await db()
      .from("engine_audit_runs")
      .select("*")
      .eq("account_id", account.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return NextResponse.json({ accountId: account.id, audit: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
