"use client";

// Route entry for /engine: token gate + demo handling, then the redesigned
// cockpit (v3). Sign-in is the split Login screen. In demo (local dev / Pages)
// the cockpit shows straight away; `?login=1` previews the sign-in screen.

import { useEffect, useState } from "react";
import { DEMO } from "./demo";
import EngineV5 from "./v5";
import EngineAurora from "./v3aurora";
import Login from "./Login";
import type { CockpitData } from "@/lib/engine/cockpit-data";

const TOKEN_KEY = "roi_engine_token";
const hasLoginParam = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("login");
const go = (path: string) => { if (typeof window !== "undefined") window.location.assign(path); };

export default function Shell({ variant = "atlas", cockpit = null }: { variant?: "atlas" | "aurora"; cockpit?: CockpitData | null } = {}) {
  const Cockpit = variant === "aurora" ? EngineAurora : (props: { onSignOut?: () => void }) => <EngineV5 {...props} cockpit={cockpit} />;
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const [user, setUser] = useState<string | null>(null); // persisted demo user (localStorage)

  useEffect(() => {
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

  // Until the client effect resolves the URL/token, show a neutral splash so the
  // cockpit never flashes before the sign-in screen (fixes the login-button flash).
  if (!ready) return <div style={{ height: "100vh", background: "#0E1422" }} />;
  // Demo mode: cockpit straight away; `?login=1` previews the sign-in screen.
  if (DEMO) {
    if (preview || !user) return <Login demo onEnter={() => go("/engine")} />;
    return <Cockpit onSignOut={demoSignOut} />;
  }
  // Live mode: gate on the admin token via the Login screen.
  if (!token) return <Login onSubmitToken={submitToken} onEnter={() => {}} />;
  return <Cockpit onSignOut={signOut} />;
}
