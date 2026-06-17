// Multi-tenant routing (D27 phase 1) — Next 16 "proxy" (was "middleware").
// A request to <slug>.roilabs.in is rewritten to the internal /_tenant/<slug>
// route tree, which gates by membership and renders that company's cockpit. The
// apex (roilabs.in / www) and reserved hosts serve the marketing site + funnel
// normally. /api/* is never rewritten (same-origin calls).
//
// The slug is NOT a trust boundary — it only selects which tenant to *attempt*;
// /_tenant gates every access through resolveTenant(slug, email).

import { NextRequest, NextResponse } from "next/server";

const APEX = "roilabs.in";
const RESERVED = new Set(["www", "app", "engine", "api", "vercel", "cdn", "static"]);

function tenantSlug(host: string): string | null {
  const h = host.split(":")[0].toLowerCase();
  let sub = "";
  if (h.endsWith(`.${APEX}`)) sub = h.slice(0, h.length - APEX.length - 1);
  else if (h.endsWith(".localhost")) sub = h.slice(0, h.length - ".localhost".length); // local dev: astrotime.localhost
  if (!sub || sub.includes(".") || RESERVED.has(sub)) return null;
  return sub;
}

export function proxy(req: NextRequest) {
  const slug = tenantSlug(req.headers.get("host") ?? "");
  if (!slug) return NextResponse.next();
  const url = req.nextUrl.clone();
  const path = req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname;
  url.pathname = `/_tenant/${slug}${path}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except API routes (same-origin), Next internals, and static files.
  matcher: ["/((?!api/|_next/|favicon.ico|.*\\.[^/]+$).*)"],
};
