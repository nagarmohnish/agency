"use client";

// Route entry for /engine: token gate + demo handling, then the redesigned
// cockpit (v3). Sign-in is the split Login screen. In demo (local dev / Pages)
// the cockpit shows straight away; `?login=1` previews the sign-in screen.

import { useEffect, useState } from "react";
import { DEMO } from "./demo";
import EngineV5 from "./v5";
import EngineAurora from "./v3aurora";
import Login from "./Login";
import { getSupabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import type { CockpitData } from "@/lib/engine/cockpit-data";

const TOKEN_KEY = "roi_engine_token";
const hasLoginParam = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("login");
const go = (path: string) => { if (typeof window !== "undefined") window.location.assign(path); };
// engine.roilabs.in (or NEXT_PUBLIC_ENGINE_AUTH=supabase) → real Supabase accounts + locked teaser.
const engineAuthMode = () => process.env.NEXT_PUBLIC_ENGINE_AUTH === "supabase" || (typeof window !== "undefined" && window.location.hostname.startsWith("engine."));

export default function Shell({ variant = "atlas", cockpit = null }: { variant?: "atlas" | "aurora"; cockpit?: CockpitData | null } = {}) {
  const Cockpit = variant === "aurora" ? EngineAurora : (props: { onSignOut?: () => void; locked?: boolean }) => <EngineV5 {...props} cockpit={cockpit} />;
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const [user, setUser] = useState<string | null>(null); // persisted demo user (localStorage)
  const [supa, setSupa] = useState(false);                // real Supabase-auth mode (engine.* host)
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (engineAuthMode()) {
      setSupa(true);
      let sb;
      try { sb = getSupabase(); } catch { sb = null; }
      if (sb) {
        sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
        const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => sub.subscription.unsubscribe();
      }
      setReady(true);
      return;
    }
    try { setToken(sessionStorage.getItem(TOKEN_KEY)); } catch { /* ignore */ }
    try { setUser(localStorage.getItem("roi_user")); } catch { /* ignore */ }
    setPreview(hasLoginParam());
    setReady(true);
  }, []);

  const submitToken = async (t: string) => {
    const res = await fetch("/api/engine/status", { headers: { Authorization: `Bearer ${t}` } });
    if (res.status === 401 || res.status === 503) { const j = await res.json().catch(() => ({})); throw new Error((j as { error?: string }).error || "Invalid token"); }
    try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
    setToken(t); setPreview(false);
  };
  const signOut = () => { try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } setToken(null); };
  const demoSignOut = () => { try { localStorage.removeItem("roi_user"); } catch { /* ignore */ } go("/engine?login=1"); };
  const supaSignOut = async () => { try { await getSupabase().auth.signOut(); } catch { /* ignore */ } setSession(null); };

  // Until the client effect resolves the URL/token, show a neutral splash so the
  // cockpit never flashes before the sign-in screen (fixes the login-button flash).
  if (!ready) return <div style={{ height: "100vh", background: "#0E1422" }} />;
  // Supabase mode (engine.roilabs.in): real accounts; post-login shows the locked teaser.
  if (supa) {
    if (!session) return <Login supabaseAuth onEnter={() => { /* auth listener enters */ }} />;
    return <Cockpit locked onSignOut={supaSignOut} />;
  }
  // Demo mode: cockpit straight away; `?login=1` previews the sign-in screen.
  if (DEMO) {
    if (preview || !user) return <Login demo onEnter={() => go("/engine")} />;
    return <Cockpit onSignOut={demoSignOut} />;
  }
  // Live mode: gate on the admin token via the Login screen.
  if (!token) return <Login onSubmitToken={submitToken} onEnter={() => {}} />;
  return <Cockpit onSignOut={signOut} />;
}
