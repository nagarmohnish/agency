"use client";

// ROI Engine sign-in — split layout (auth left, animated cockpit preview right),
// in the spirit of modern product login screens. Demo/preview just enters the
// cockpit; real (non-demo) auth still flows through the admin-token gate.

import { useState, type ReactNode } from "react";

export default function Login({ onEnter, onSubmitToken, demo }: { onEnter: () => void; onSubmitToken?: (t: string) => Promise<void>; demo?: boolean }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<"oauth" | "token">("oauth");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  const toToken = (msg: string) => { setNote(msg); setErr(""); setMode("token"); };
  const oauth = () => { if (demo) return onEnter(); toToken("SSO isn’t wired yet — sign in with your admin token."); };
  const emailContinue = (e: React.FormEvent) => { e.preventDefault(); if (demo) return onEnter(); toToken("Operator access is token-gated for now — paste your admin token."); };
  const tokenContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demo || !onSubmitToken) return onEnter();
    const t = token.trim(); if (!t) return;
    setBusy(true); setErr("");
    try { await onSubmitToken(t); } catch (ex) { setErr(ex instanceof Error ? ex.message : "Invalid token"); } finally { setBusy(false); }
  };

  const field: React.CSSProperties = { width: "100%", padding: "13px 14px", borderRadius: "11px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", color: "#fff", font: "500 14px 'Hanken Grotesk'", outline: "none" };
  const btnLight: React.CSSProperties = { width: "100%", padding: "13px 14px", borderRadius: "11px", border: "none", cursor: "pointer", background: "#F3F2EE", color: "#15131F", font: "600 14px 'Hanken Grotesk'", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#14121E", color: "#fff", fontFamily: "'Hanken Grotesk',system-ui,sans-serif", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}>
      <style>{LOGIN_CSS}</style>

      {/* LEFT — auth */}
      <div style={{ flex: "1 1 46%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px clamp(28px,5vw,72px)", minWidth: 0, maxWidth: "640px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginBottom: "auto", paddingTop: "8px" }}>
          <span style={{ font: "800 20px/1 'Space Grotesk'", letterSpacing: "-.01em", color: "#FACC15" }}>ROI</span>
          <span style={{ font: "600 20px/1 'Space Grotesk'", letterSpacing: "-.01em", color: "#fff" }}>Engine</span>
        </div>

        <div style={{ margin: "auto 0" }}>
          <h1 style={{ margin: "0 0 12px", font: "600 clamp(34px,4vw,46px)/1.08 'Space Grotesk'", letterSpacing: "-.02em", color: "#fff" }}>Paid media,<br /><span style={{ color: "#FACC15" }}>measured in revenue.</span></h1>
          <p style={{ margin: "0 0 30px", font: "500 15px/1.6 'Hanken Grotesk'", color: "#A6A2C2", maxWidth: "400px" }}>Sign in to the ROI Engine cockpit — the governed, revenue-tied view of your Google, Meta &amp; Shopify spend.</p>

          <div style={{ maxWidth: "380px" }}>
            {mode === "oauth" ? (
              <>
                <button onClick={oauth} style={btnLight}>
                  <GoogleG /> Continue with Google
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
                  <span style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.1)" }} /><span style={{ font: "600 11px 'JetBrains Mono'", color: "#6F6B8C", letterSpacing: ".1em" }}>OR</span><span style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.1)" }} />
                </div>
                <form onSubmit={emailContinue} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                  <input type="email" placeholder="Enter your work email" value={email} onChange={(e) => setEmail(e.target.value)} style={field} />
                  <button type="submit" style={{ ...btnLight, background: "#4F46E5", color: "#fff" }}>Continue with email</button>
                </form>
              </>
            ) : (
              <form onSubmit={tokenContinue} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                <input type="password" placeholder="Admin access token" value={token} onChange={(e) => setToken(e.target.value)} autoFocus style={field} />
                <button type="submit" disabled={busy} style={{ ...btnLight, background: "#4F46E5", color: "#fff", opacity: busy ? 0.7 : 1 }}>{busy ? "Checking…" : "Enter the cockpit"}</button>
                <button type="button" onClick={() => { setMode("oauth"); setErr(""); setNote(""); }} style={{ background: "none", border: "none", color: "#8C89B4", font: "500 12.5px 'Hanken Grotesk'", cursor: "pointer", textAlign: "left", padding: "2px" }}>← Back to sign-in options</button>
              </form>
            )}
            {err && <div style={{ marginTop: "12px", font: "500 12.5px 'Hanken Grotesk'", color: "#F08A8A" }}>{err}</div>}
            {note && !err && <div style={{ marginTop: "12px", font: "500 12.5px 'Hanken Grotesk'", color: "#A6A2C2" }}>{note}</div>}
            {mode === "oauth" && <button onClick={() => toToken("")} style={{ marginTop: "18px", background: "none", border: "none", color: "#8C89B4", font: "500 12.5px 'Hanken Grotesk'", cursor: "pointer", padding: "2px" }}>Operator? Sign in with an admin token →</button>}
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "24px", font: "500 11.5px 'Hanken Grotesk'", color: "#56527A" }}>ROI Labs · Paid media, measured in revenue. Scaled by AI.</div>
      </div>

      {/* RIGHT — animated cockpit preview */}
      <div style={{ flex: "1 1 54%", padding: "26px 26px 26px 0", minWidth: 0 }}>
        <CockpitPreview />
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.9 2.4 30.5 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.7 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M47 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.9c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.9 38 47 32 47 24.5z" /><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z" /></svg>
  );
}

const LOGIN_CSS = `
@keyframes lgRise{0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:translateY(0)}}
@keyframes lgFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes lgDraw{from{stroke-dashoffset:560}to{stroke-dashoffset:0}}
@keyframes lgFade{0%{opacity:0}100%{opacity:1}}
@keyframes lgPulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes lgBar{0%{transform:scaleY(.35)}50%{transform:scaleY(1)}100%{transform:scaleY(.6)}}
@keyframes lgGlow{0%,100%{opacity:.5}50%{opacity:.9}}
.lg-rise{animation:lgRise .7s cubic-bezier(.2,.7,.2,1) both}
.lg-card{animation:lgRise .8s cubic-bezier(.2,.7,.2,1) both, lgFloat 7s ease-in-out 1s infinite}
.lg-bar{transform-origin:bottom;animation:lgBar 3.4s ease-in-out infinite}
.lg-dot{animation:lgPulse 2s ease-in-out infinite}
.lg-line{stroke-dasharray:560;animation:lgDraw 2.1s ease-out .3s both}
.lg-glow{animation:lgGlow 5s ease-in-out infinite}
@media (max-width:920px){.lg-right{display:none!important}}
`;

function MiniSpark({ color = "#4F46E5" }: { color?: string }) {
  return (
    <svg viewBox="0 0 120 30" width="100%" height="26" preserveAspectRatio="none" style={{ display: "block" }}>
      <path d="M2 22 L18 18 L34 20 L50 12 L66 15 L82 8 L98 11 L118 5" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function CockpitPreview() {
  const kpis: [string, string, string][] = [["Store revenue", "₹1.36Cr", "Shopify"], ["MER", "2.64×", "Blended"], ["Orders", "5,640", "Shopify"]];
  return (
    <div className="lg-right" style={{ height: "100%", width: "100%", borderRadius: "22px", background: "radial-gradient(120% 90% at 70% 0%, #221E47 0%, #15123099 55%, #110F22 100%)", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 30px 80px -30px rgba(0,0,0,.6)", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "34px" }}>
      <div className="lg-glow" style={{ position: "absolute", top: "-30%", right: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,.35), transparent 70%)", filter: "blur(20px)" }} />

      {/* the floating "app" card */}
      <div className="lg-card" style={{ width: "min(560px,100%)", background: "#fff", borderRadius: "18px", boxShadow: "0 24px 60px -20px rgba(0,0,0,.5)", overflow: "hidden", position: "relative" }}>
        {/* card header */}
        <div className="lg-rise" style={{ animationDelay: ".05s", display: "flex", alignItems: "center", gap: "9px", padding: "14px 18px", borderBottom: "1px solid #F2F3F6" }}>
          <span style={{ font: "700 13px 'Space Grotesk'", color: "#15171C" }}><span style={{ color: "#C99700" }}>ROI</span> Engine</span>
          <span style={{ font: "600 9px 'JetBrains Mono'", color: "#4F46E5", background: "#EEF0FE", padding: "3px 6px", borderRadius: "5px", textTransform: "uppercase", letterSpacing: ".05em" }}>Overview</span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", font: "500 11px 'Hanken Grotesk'", color: "#9CA0A8" }}><span className="lg-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#16A34A" }} />Live</span>
        </div>

        <div style={{ padding: "18px" }}>
          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "11px" }}>
            {kpis.map(([label, val, src], i) => (
              <div key={label} className="lg-rise" style={{ animationDelay: `${0.15 + i * 0.12}s`, background: "#fff", border: "1px solid #ECEDF1", borderRadius: "12px", padding: "12px 12px 10px", boxShadow: "0 1px 2px rgba(20,22,28,.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}><span style={{ font: "600 10.5px 'Hanken Grotesk'", color: "#6B7280" }}>{label}</span><span style={{ font: "500 8px 'JetBrains Mono'", color: "#B7BAC2", textTransform: "uppercase" }}>{src}</span></div>
                <div style={{ font: "600 20px/1.1 'Space Grotesk'", color: "#15171C", marginTop: "5px", fontVariantNumeric: "tabular-nums" }}>{val}</div>
                <div style={{ marginTop: "7px", height: "26px" }}><MiniSpark color={i === 1 ? "#16A34A" : "#4F46E5"} /></div>
              </div>
            ))}
          </div>

          {/* area chart */}
          <div className="lg-rise" style={{ animationDelay: ".5s", marginTop: "12px", background: "#fff", border: "1px solid #ECEDF1", borderRadius: "12px", padding: "14px 16px", boxShadow: "0 1px 2px rgba(20,22,28,.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ font: "600 11px 'Hanken Grotesk'", color: "#15171C" }}>Revenue vs spend</span><span style={{ font: "500 10px 'JetBrains Mono'", color: "#9CA0A8" }}>Last 90 days</span></div>
            <svg viewBox="0 0 520 120" width="100%" height="92" preserveAspectRatio="none" style={{ display: "block" }}>
              <defs><linearGradient id="lgRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F46E5" stopOpacity={0.16} /><stop offset="100%" stopColor="#4F46E5" stopOpacity={0} /></linearGradient></defs>
              {[24, 54, 84].map((y) => <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="#F1F2F6" strokeWidth={1} />)}
              <path d="M0 84 L58 74 L116 78 L174 58 L232 64 L290 44 L348 50 L406 30 L464 36 L520 20 L520 110 L0 110 Z" fill="url(#lgRev)" className="lg-fade" style={{ animation: "lgFade 1.2s ease 1.6s both" }} />
              <path className="lg-line" d="M0 84 L58 74 L116 78 L174 58 L232 64 L290 44 L348 50 L406 30 L464 36 L520 20" fill="none" stroke="#4F46E5" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              <path d="M0 96 L58 92 L116 94 L174 86 L232 88 L290 80 L348 82 L406 74 L464 78 L520 70" fill="none" stroke="#C7CBD6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="lg-line" style={{ animationDelay: ".55s" }} />
            </svg>
          </div>

          {/* spend-by-type bars + engine strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px", marginTop: "12px" }}>
            <div className="lg-rise" style={{ animationDelay: ".7s", background: "#fff", border: "1px solid #ECEDF1", borderRadius: "12px", padding: "13px 14px", boxShadow: "0 1px 2px rgba(20,22,28,.05)" }}>
              <div style={{ font: "600 11px 'Hanken Grotesk'", color: "#15171C", marginBottom: "10px" }}>Spend by type</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "9px", height: "44px" }}>
                {[["#4F46E5", 1], ["#6366F1", .72], ["#818CF8", .5], ["#A5B4FC", .34]].map(([c, h], i) => (
                  <div key={i} className="lg-bar" style={{ flex: 1, height: `${(h as number) * 100}%`, background: c as string, borderRadius: "5px", animationDelay: `${i * 0.25}s` }} />
                ))}
              </div>
            </div>
            <div className="lg-rise" style={{ animationDelay: ".82s", background: "#15123A", borderRadius: "12px", padding: "13px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "7px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span className="lg-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34D399" }} /><span style={{ font: "600 11.5px 'Space Grotesk'", color: "#fff" }}>Engine running</span></div>
              <div style={{ font: "500 10.5px 'Hanken Grotesk'", color: "#A6A3CC" }}>Run #142 · Launch · Media buying</div>
              <div style={{ font: "500 10px 'JetBrains Mono'", color: "#8C89B4" }}>3 approvals pending · cap ₹6K/day</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
