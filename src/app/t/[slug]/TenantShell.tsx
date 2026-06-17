"use client";

// Per-company dashboard gate (D27 phase 1). Flow on <slug>.roilabs.in:
//   no Supabase session  -> the login screen
//   session, is a member -> the cockpit (membership checked server-side via
//                           /api/engine/tenant-access — the browser never sees
//                           the membership table)
//   session, not a member -> a "no access" screen
// Real per-company data + brand are wired in phase 2; for now the cockpit renders
// its modeled estimates (cockpit=null).

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import Login from "@/app/engine/Login";
import EngineV5 from "@/app/engine/v5";

const SPLASH = { height: "100vh", background: "#0E1422" } as const;

export default function TenantShell({ slug }: { slug: string }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [access, setAccess] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    const sb = (() => { try { return getSupabase(); } catch { return null; } })();
    if (!sb) { setReady(true); return; }
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setAccess("checking"); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/engine/tenant-access?slug=${encodeURIComponent(slug)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!cancelled) setAccess(res.ok ? "ok" : "denied");
      } catch {
        if (!cancelled) setAccess("denied");
      }
    })();
    return () => { cancelled = true; };
  }, [session, slug]);

  const signOut = async () => {
    try { await getSupabase().auth.signOut(); } catch { /* ignore */ }
    setSession(null);
    setAccess("checking");
  };

  if (!ready) return <div style={SPLASH} />;
  if (!session) return <Login supabaseAuth onEnter={() => { /* auth listener enters */ }} />;
  if (access === "checking") return <div style={SPLASH} />;
  if (access === "denied") return <NoAccess onSignOut={signOut} />;
  return <EngineV5 cockpit={null} onSignOut={signOut} />;
}

function NoAccess({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "radial-gradient(130% 120% at 50% -10%, #241e14 0%, #141009 62%)", color: "#fff", fontFamily: "'Poppins', system-ui, sans-serif", padding: 24, textAlign: "center", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.4px" }}>No access to this dashboard</div>
      <div style={{ fontSize: 14.5, color: "rgba(255,255,255,.6)", maxWidth: 430, lineHeight: 1.6 }}>This account isn&apos;t on your ROI Labs dashboard yet. If you think that&apos;s a mistake, ask your ROI Labs contact to add your email.</div>
      <button onClick={onSignOut} style={{ marginTop: 6, background: "none", border: "1px solid rgba(255,255,255,.22)", color: "#fff", borderRadius: 11, padding: "10px 20px", fontSize: 13.5, cursor: "pointer" }}>Sign out</button>
    </div>
  );
}
