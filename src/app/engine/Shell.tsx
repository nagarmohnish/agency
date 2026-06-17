"use client";

// Route entry for /engine. Three modes:
//   • internal static demo  (NEXT_PUBLIC_ENGINE_DEMO=1, no auth flag): no login,
//     cockpit straight away (`?login=1` previews the sign-in screen).
//   • real-auth (everything else — roilabs.in/engine and engine.roilabs.in):
//     Supabase login (Google / email) + an admin-token fallback. After sign-in
//     we probe the engine: an allowlisted OPERATOR (ENGINE_OPERATOR_EMAILS on
//     that deployment) gets the full cockpit; everyone else gets the locked
//     "book a demo" teaser. The admin token also unlocks the full cockpit.

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
// engine.roilabs.in (or NEXT_PUBLIC_ENGINE_AUTH=supabase) forces Supabase auth.
const supabaseAuthHost = () => process.env.NEXT_PUBLIC_ENGINE_AUTH === "supabase" || (typeof window !== "undefined" && window.location.hostname.startsWith("engine."));
// The internal static demo is DEMO=1 WITHOUT the auth flag/host — no login there.
const demoOnly = () => DEMO && !supabaseAuthHost();

export default function Shell({ variant = "atlas", cockpit = null }: { variant?: "atlas" | "aurora"; cockpit?: CockpitData | null } = {}) {
  // Real source data only ever reaches an authenticated operator. The locked
  // teaser gets null → the cockpit's safe modeled estimates, so real numbers are
  // never shipped to a non-operator (they'd otherwise sit in the page payload).
  const renderCockpit = (locked: boolean, onSignOut: () => void) =>
    variant === "aurora"
      ? <EngineAurora onSignOut={onSignOut} /> // aurora variant has no teaser/locked state
      : <EngineV5 locked={locked} onSignOut={onSignOut} cockpit={locked ? null : cockpit} />;
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);       // demo: `?login=1`
  const [user, setUser] = useState<string | null>(null); // demo: persisted user
  const [token, setToken] = useState<string | null>(null); // operator bearer (admin token OR a validated SSO access token)
  const [supaReady, setSupaReady] = useState(false);   // Supabase client available (env present)
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (demoOnly()) {
      try { setUser(localStorage.getItem("roi_user")); } catch { /* ignore */ }
      setPreview(hasLoginParam());
      setReady(true);
      return;
    }
    // Real-auth mode: restore any operator token, then wire up Supabase auth.
    try { setToken(sessionStorage.getItem(TOKEN_KEY)); } catch { /* ignore */ }
    let sb;
    try { sb = getSupabase(); } catch { sb = null; }
    setSupaReady(!!sb);
    if (!sb) { setReady(true); return; }
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // When a Supabase session appears (or its access token refreshes), probe the
  // engine with it: allowlisted operators get a working bearer → full cockpit;
  // everyone else falls through to the locked teaser.
  useEffect(() => {
    if (demoOnly()) return;
    const at = session?.access_token;
    if (!at) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/engine/status", { headers: { Authorization: `Bearer ${at}` } });
        if (cancelled) return;
        if (res.ok) {
          try { sessionStorage.setItem(TOKEN_KEY, at); } catch { /* ignore */ }
          setToken(at);
        } else {
          // Not an operator (or this deployment has no allowlist) → drop a stale
          // SSO token so we render the teaser, but keep a manual admin token.
          setToken((cur) => {
            if (cur && cur === at) { try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } return null; }
            return cur;
          });
        }
      } catch { /* network hiccup — stay as-is */ }
    })();
    return () => { cancelled = true; };
  }, [session?.access_token]);

  const submitToken = async (t: string) => {
    const res = await fetch("/api/engine/status", { headers: { Authorization: `Bearer ${t}` } });
    if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error((j as { error?: string }).error || "Invalid token"); }
    try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
    setToken(t);
  };
  const signOut = async () => {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setToken(null);
    try { if (session) await getSupabase().auth.signOut(); } catch { /* ignore */ }
    setSession(null);
  };
  const demoSignOut = () => { try { localStorage.removeItem("roi_user"); } catch { /* ignore */ } go("/engine?login=1"); };

  // Until the client effect resolves, show a neutral splash so the cockpit never
  // flashes before the sign-in screen (fixes the login-button flash).
  if (!ready) return <div style={{ height: "100vh", background: "#0E1422" }} />;

  // Internal static demo: cockpit straight away; `?login=1` previews sign-in.
  if (demoOnly()) {
    if (preview || !user) return <Login demo onEnter={() => go("/engine")} />;
    return renderCockpit(false, demoSignOut);
  }

  // Real-auth mode.
  if (token) return renderCockpit(false, signOut);                     // operator: full access
  if (session) return renderCockpit(true, signOut);                    // signed in, not an operator → teaser
  return <Login supabaseAuth={supaReady} onSubmitToken={submitToken} onEnter={() => { /* auth listener handles entry */ }} />;
}
