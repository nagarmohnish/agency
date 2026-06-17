"use client";

// Per-company dashboard gate (D27 / D31). Flow on <slug>.roilabs.in:
//   no Supabase session   -> the login screen
//   session, is a member  -> the full cockpit (EngineV5) for this tenant, with the
//                            tenant's brand + the signed-in user's identity
//   session, not a member -> a "no access" screen
// One membership-gated request (/api/engine/tenant-cockpit) returns the account's
// cockpit + brand; the browser never sees the membership table or another tenant.

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import Login from "@/app/engine/Login";
import EngineV5, { type CockpitBrand, type CockpitUser } from "@/app/engine/v5";
import type { CockpitData } from "@/lib/engine/cockpit-data";
import type { Member, Role } from "@/app/engine/tickets";
import "@/app/engine/engine.css";

type Payload = { role: string; cockpit: CockpitData | null; brand: CockpitBrand; members: { email: string; role: string }[] };

const SPLASH = { height: "100vh", background: "#0E1422" } as const;
const SHELL_BG = "radial-gradient(130% 120% at 50% -10%, #241e14 0%, #141009 62%)";

const prettyName = (email: string) => {
  const local = (email.split("@")[0] || "user").replace(/[._-]+/g, " ").trim();
  return local.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") || "User";
};
const asRole = (r: string): Role => (r === "admin" || r === "operator" || r === "viewer" ? r : "viewer");

function userFromSession(session: Session, role: string): CockpitUser {
  const md = (session.user.user_metadata ?? {}) as { full_name?: string; name?: string };
  const email = (session.user.email ?? "").toLowerCase();
  return { name: md.full_name || md.name || prettyName(email), email, role: asRole(role) };
}

const PALETTE = ["#4F5BD5", "#e07b6b", "#2bbf7a", "#c08a2e", "#8a92f5", "#6c5ce7"];
const initialsOf = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

// The account roster → v5 Member rows for the team list. We don't store names, so
// they're derived from the email; the signed-in user shows their real name.
function toTeam(roster: { email: string; role: string }[], session: Session, org: string): Member[] {
  const myEmail = (session.user.email ?? "").toLowerCase();
  return roster.map((m, i) => {
    const isMe = m.email.toLowerCase() === myEmail;
    const name = isMe ? userFromSession(session, m.role).name : prettyName(m.email);
    return { id: m.email.toLowerCase(), name, initials: initialsOf(name), color: PALETTE[i % PALETTE.length], org, title: m.email, role: asRole(m.role) };
  });
}

export default function TenantShell({ slug }: { slug: string }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<"checking" | "ok" | "denied" | "error">("checking");
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    const sb = (() => { try { return getSupabase(); } catch { return null; } })();
    if (!sb) { setReady(true); return; }
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setState("checking"); setPayload(null); return; }
    let cancelled = false;
    setState("checking");
    (async () => {
      try {
        const res = await fetch(`/api/engine/tenant-cockpit?slug=${encodeURIComponent(slug)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (cancelled) return;
        if (res.ok) { setPayload(await res.json()); setState("ok"); }
        else if (res.status === 403) setState("denied");
        else setState("error");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => { cancelled = true; };
  }, [session, slug]);

  const signOut = async () => {
    try { await getSupabase().auth.signOut(); } catch { /* ignore */ }
    setSession(null);
    setPayload(null);
    setState("checking");
  };

  if (!ready) return <div style={SPLASH} />;
  if (!session) return <Login supabaseAuth onEnter={() => { /* auth listener enters */ }} />;
  if (state === "checking") return <div style={SPLASH} />;
  if (state === "denied") return <NoAccess onSignOut={signOut} />;
  if (state === "error" || !payload) return <LoadError onSignOut={signOut} />;
  return (
    <EngineV5
      cockpit={payload.cockpit}
      brand={payload.brand}
      user={userFromSession(session, payload.role)}
      members={toTeam(payload.members, session, payload.brand.name)}
      onSignOut={signOut}
    />
  );
}

function Centered({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: SHELL_BG, color: "#fff", fontFamily: "'Poppins', system-ui, sans-serif", padding: 24, textAlign: "center", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.4px" }}>{title}</div>
      <div style={{ fontSize: 14.5, color: "rgba(255,255,255,.6)", maxWidth: 430, lineHeight: 1.6 }}>{body}</div>
      {children}
    </div>
  );
}

function NoAccess({ onSignOut }: { onSignOut: () => void }) {
  return (
    <Centered title="No access to this dashboard" body="This account isn’t on your ROI Labs dashboard yet. If you think that’s a mistake, ask your ROI Labs contact to add your email.">
      <button onClick={onSignOut} style={{ marginTop: 6, background: "none", border: "1px solid rgba(255,255,255,.22)", color: "#fff", borderRadius: 11, padding: "10px 20px", fontSize: 13.5, cursor: "pointer" }}>Sign out</button>
    </Centered>
  );
}

function LoadError({ onSignOut }: { onSignOut: () => void }) {
  return (
    <Centered title="We couldn’t load your dashboard" body="Something went wrong fetching your data. This is on us — please retry in a moment.">
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button onClick={() => location.reload()} style={{ background: "#FACC15", border: "none", color: "#1a1305", borderRadius: 11, padding: "10px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Retry</button>
        <button onClick={onSignOut} style={{ background: "none", border: "1px solid rgba(255,255,255,.22)", color: "#fff", borderRadius: 11, padding: "10px 20px", fontSize: 13.5, cursor: "pointer" }}>Sign out</button>
      </div>
    </Centered>
  );
}
