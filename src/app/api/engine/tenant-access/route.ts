// Does the bearer (Supabase access token or admin token) have access to <slug>?
// The tenant cockpit calls this to gate itself. Membership is checked server-side
// with the service-role db() — the browser never sees the membership table.

import { NextRequest, NextResponse } from "next/server";
import { principal } from "@/lib/engine/auth";
import { resolveTenant, adminResolveTenant } from "@/lib/engine/tenancy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") ?? "").trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  const p = await principal(req);
  if (!p) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const t = p.kind === "admin" ? await adminResolveTenant(slug) : await resolveTenant(slug, p.email);
  // unknown slug AND not-a-member are indistinguishable → no enumeration / IDOR
  if (!t) return NextResponse.json({ error: "no access" }, { status: 403 });

  return NextResponse.json({ slug, name: t.account.name, role: t.role });
}
