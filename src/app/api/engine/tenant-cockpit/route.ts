// GET /api/engine/tenant-cockpit?slug= — the tenant dashboard's data feed.
// Membership-gated like tenant-access: the bearer (Supabase JWT or admin token)
// must resolve to a member of <slug>, and we only ever assemble THAT account's
// data (no ?accountId → no IDOR; the slug is the trust boundary). Returns the
// FULL cockpit (real Shopify/Google where connected + the engine's modeled
// assumptions, each flagged) plus the per-tenant brand.

import { NextRequest, NextResponse } from "next/server";
import { principal } from "@/lib/engine/auth";
import { resolveTenant, adminResolveTenant, listMembers } from "@/lib/engine/tenancy";
import { getCockpitData } from "@/lib/engine/cockpit-data";

export const dynamic = "force-dynamic";
export const maxDuration = 90; // real Shopify/Google fetches can take a while

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") ?? "").trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  const p = await principal(req);
  if (!p) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const t = p.kind === "admin" ? await adminResolveTenant(slug) : await resolveTenant(slug, p.email);
  // unknown slug AND not-a-member are indistinguishable → no enumeration / IDOR
  if (!t) return NextResponse.json({ error: "no access" }, { status: 403 });

  try {
    const [cockpit, members] = await Promise.all([
      getCockpitData(t.account.id).catch(() => null),
      listMembers(t.account.id),
    ]);
    const brand = {
      name: t.account.name,
      mono: (t.account.name || "?").trim().charAt(0).toUpperCase(),
      logoSrc: `/logos/${slug}.png`, // falls back to the initial if the file 404s
      shopifySlug: slug,
    };
    return NextResponse.json({ role: t.role, cockpit, brand, members });
  } catch (e) {
    console.error("tenant-cockpit failed", e);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
