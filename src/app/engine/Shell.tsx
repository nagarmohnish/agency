"use client";

// Route entry for /engine: token gate + demo handling, then the redesigned
// cockpit (v3). Sign-in is the split Login screen. In demo (local dev / Pages)
// the cockpit shows straight away; `?login=1` previews the sign-in screen.

import { useEffect, useState } from "react";
import { DEMO } from "./demo";
import EngineV3 from "./v3";
import EngineAurora from "./v3aurora";
import Login from "./Login";

const TOKEN_KEY = "roi_engine_token";
const hasLoginParam = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("login");
const go = (path: string) => { if (typeof window !== "undefined") window.location.assign(path); };

export default function Shell({ variant = "atlas" }: { variant?: "atlas" | "aurora" } = {}) {
  const Cockpit = variant === "aurora" ? EngineAurora : EngineV3;
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    try { setToken(sessionStorage.getItem(TOKEN_KEY)); } catch { /* ignore */ }
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

  // Demo mode: cockpit straight away; `?login=1` previews the sign-in screen.
  if (DEMO) {
    if (preview) return <Login demo onEnter={() => go("/engine")} />;
    return <Cockpit />;
  }
  // Live mode: gate on the admin token via the Login screen.
  if (!ready) return <div style={{ height: "100vh", background: "#14121E" }} />;
  if (!token) return <Login onSubmitToken={submitToken} onEnter={() => {}} />;
  return <Cockpit onSignOut={signOut} />;
}
