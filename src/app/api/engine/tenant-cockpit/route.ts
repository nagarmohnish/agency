// GET /api/engine/tenant-cockpit?slug= — the client dashboard's data feed.
// Membership-gated exactly like tenant-access: the bearer (Supabase JWT or admin
// token) must resolve to a member of <slug>, and we only ever assemble THAT
// account's data. No ?accountId param → no IDOR; the slug is the trust boundary
// and resolveTenant enforces membership server-side. Honest data only (D29).

import { NextRequest, NextResponse } from "next/server";
import { principal } from "@/lib/engine/auth";
import { resolveTenant, adminResolveTenant } from "@/lib/engine/tenancy";
import { getTenantCockpit } from "@/lib/engine/tenant-cockpit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") ?? "").trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  const p = await principal(req);
  if (!p) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const t = p.kind === "admin" ? await adminResolveTenant(slug) : await resolveTenant(slug, p.email);
  // unknown slug AND not-a-member are indistinguishable → no enumeration / IDOR
  if (!t) return NextResponse.json({ error: "no access" }, { status: 403 });

  try {
    const cockpit = await getTenantCockpit(t.account.id);
    return NextResponse.json({ role: t.role, cockpit });
  } catch (e) {
    // Log the real error server-side; never hand DB/infra detail to a client.
    console.error("tenant-cockpit failed", e);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
