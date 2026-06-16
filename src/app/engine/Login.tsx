"use client";

// ROI Engine sign-in — centered single-card layout on the landing-page header
// charcoal (#1A1712 family) with ROI Labs gold accents. The ROI Labs logo +
// "Engine" sit above one card with Continue-with-Google, an email/password form,
// and a sign-in / create-account toggle. Demo/preview just enters the cockpit;
// real (non-demo) auth still routes through the admin-token gate ("Operator?").

import { useState } from "react";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const GOLD = "#FACC15";   // ROI Labs brand yellow — primary action
const INK = "#1A1712";    // landing-header ink — gold-button text
const FD = "'Poppins', system-ui, sans-serif";

const lnk: React.CSSProperties = { color: "#E9C75A", textDecoration: "underline", textUnderlineOffset: "2px" };
const card: React.CSSProperties = { width: "min(440px, 100%)", background: "#1e1a12", border: "1px solid #33301f", borderRadius: 22, padding: "clamp(26px,4vw,38px)", boxShadow: "0 30px 80px rgba(0,0,0,.5)" };
const field: React.CSSProperties = { width: "100%", padding: "15px 16px 15px 46px", borderRadius: 13, background: "#19150d", border: "1px solid #34301f", color: "#fff", font: `500 14.5px ${FD}`, outline: "none" };
const primary = (disabled: boolean): React.CSSProperties => ({ width: "100%", padding: 15, borderRadius: 13, border: "none", cursor: disabled ? "not-allowed" : "pointer", background: disabled ? "#3a3526" : GOLD, color: disabled ? "rgba(255,255,255,.4)" : INK, font: `700 15px ${FD}`, transition: "filter .15s" });

export default function Login({ onEnter, onSubmitToken, demo }: { onEnter: () => void; onSubmitToken?: (t: string) => Promise<void>; demo?: boolean }) {
  const [view, setView] = useState<"signin" | "signup" | "token">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  const signup = view === "signup";
  const toToken = (msg: string) => { setNote(msg); setErr(""); setView("token"); };
  // Persist the signed-in user so the session survives reloads (demo auth).
  const storeUser = (via: string) => {
    try {
      const mail = email.trim();
      localStorage.setItem("roi_user", JSON.stringify({
        name: name.trim() || (mail ? mail.split("@")[0] : "Member"),
        email: mail, via, at: Date.now(),
      }));
    } catch { /* ignore */ }
  };
  const google = () => { if (demo) { storeUser("google"); return onEnter(); } toToken("SSO isn’t wired yet — sign in with your admin token."); };
  const emailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signup && !agree) { setErr("Please accept the Terms to continue."); return; }
    if (demo) { storeUser("email"); return onEnter(); }
    toToken("Operator access is token-gated for now — paste your admin token.");
  };
  const tokenContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demo || !onSubmitToken) return onEnter();
    const t = token.trim(); if (!t) return;
    setBusy(true); setErr("");
    try { await onSubmitToken(t); } catch (ex) { setErr(ex instanceof Error ? ex.message : "Invalid token"); } finally { setBusy(false); }
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: "100vh", width: "100%", background: "radial-gradient(130% 120% at 50% -10%, #241e14 0%, #141009 62%)", color: "#fff", fontFamily: FD, WebkitFontSmoothing: "antialiased", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
      <style>{LOGIN_CSS}</style>

      {/* animated gold-glow backdrop */}
      <div className="lg-bg" aria-hidden="true">
        <span className="lg-sheen" />
        <span className="lg-orb o1" />
        <span className="lg-orb o2" />
        <span className="lg-orb o3" />
        <span className="lg-grid" />
      </div>

      <div className="lg-stage">
      {/* ROI Labs logo (gold) + Engine — matches the landing header */}
      <div className="lg-rise" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 13, marginBottom: 30 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${BP}/roi-logo-dark.png`} alt="ROI Labs" style={{ height: 38, width: "auto", display: "block" }} />
        <span style={{ width: 1, height: 24, background: "rgba(255,255,255,.22)" }} />
        <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.2px", color: "#fff" }}>Engine</span>
      </div>

      {view === "token" ? (
        <form onSubmit={tokenContinue} className="lg-rise" style={{ ...card, position: "relative", zIndex: 1 }}>
          <h1 style={{ margin: "0 0 8px", textAlign: "center", fontFamily: FD, fontSize: 26, fontWeight: 700, letterSpacing: "-.5px" }}>Operator sign-in</h1>
          <p style={{ margin: "0 0 24px", textAlign: "center", fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,.5)" }}>{note || "Paste your admin access token to enter the cockpit."}</p>
          <Labeled label="Admin token">
            <IconWrap><IconLock /></IconWrap>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} autoFocus placeholder="Admin access token" style={field} />
          </Labeled>
          <button type="submit" disabled={busy} style={{ ...primary(false), marginTop: 4, opacity: busy ? 0.7 : 1 }}>{busy ? "Checking…" : "Enter the cockpit"}</button>
          {err && <div style={{ marginTop: 12, textAlign: "center", font: `500 12.5px ${FD}`, color: "#F08A8A" }}>{err}</div>}
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <button type="button" onClick={() => { setView("signin"); setErr(""); setNote(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,.45)", font: `500 12.5px ${FD}`, cursor: "pointer" }}>← Back to sign-in</button>
          </div>
        </form>
      ) : (
        <form onSubmit={emailSubmit} className="lg-rise" style={{ ...card, position: "relative", zIndex: 1 }}>
          <h1 style={{ margin: "0 0 8px", textAlign: "center", fontFamily: FD, fontSize: 29, fontWeight: 700, letterSpacing: "-.6px" }}>{signup ? "Create your account" : "Welcome"}</h1>
          <p style={{ margin: "0 0 26px", textAlign: "center", fontSize: 14.5, color: "rgba(255,255,255,.5)" }}>{signup ? "Start scaling paid media with AI" : "Sign in to your ROI Engine cockpit"}</p>

          <button type="button" onClick={google} style={{ width: "100%", padding: 14, borderRadius: 13, border: "none", cursor: "pointer", background: "#f4f4f1", color: "#1b2440", font: `600 14.5px ${FD}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 11 }}><GoogleG /> Continue with Google</button>

          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.1)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", whiteSpace: "nowrap" }}>or continue with email</span>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.1)" }} />
          </div>

          {signup && (
            <Labeled label="Full Name">
              <IconWrap><IconUser /></IconWrap>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={field} />
            </Labeled>
          )}
          <Labeled label="Email">
            <IconWrap><IconMail /></IconWrap>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={field} />
          </Labeled>
          <Labeled label="Password">
            <IconWrap><IconLock /></IconWrap>
            <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={signup ? "Min. 6 characters" : "Your password"} style={{ ...field, paddingRight: 46 }} />
            <button type="button" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password visibility" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.45)", padding: 6, display: "flex" }}><IconEye off={showPw} /></button>
          </Labeled>

          {signup && (
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "2px 0 18px", cursor: "pointer", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,.6)" }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 16, height: 16, marginTop: 1, accentColor: GOLD, cursor: "pointer", flexShrink: 0 }} />
              <span>I agree to the <a style={lnk}>Terms of Service</a> and <a style={lnk}>Privacy Policy</a></span>
            </label>
          )}

          <button type="submit" disabled={signup && !agree} style={{ ...primary(signup && !agree), marginTop: signup ? 0 : 20 }}>{signup ? "Create Account" : "Sign in"}</button>

          {err && <div style={{ marginTop: 12, textAlign: "center", font: `500 12.5px ${FD}`, color: "#F08A8A" }}>{err}</div>}

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13.5, color: "rgba(255,255,255,.5)" }}>
            {signup ? "Already have an account? " : "New to ROI Engine? "}
            <button type="button" onClick={() => { setView(signup ? "signin" : "signup"); setErr(""); }} style={{ background: "none", border: "none", color: GOLD, font: `600 13.5px ${FD}`, cursor: "pointer", padding: 0 }}>{signup ? "Sign in" : "Create an account"}</button>
          </div>
          <div style={{ marginTop: 11, textAlign: "center" }}>
            <button type="button" onClick={() => toToken("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", font: `500 12.5px ${FD}`, cursor: "pointer" }}>Operator? Sign in with an admin token →</button>
          </div>
        </form>
      )}

      <p style={{ position: "relative", zIndex: 1, marginTop: 26, maxWidth: 380, textAlign: "center", fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,.3)" }}>By continuing, you agree to ROI Labs’ Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 7, color: "rgba(255,255,255,.82)" }}>{label}</div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}
function IconWrap({ children }: { children: React.ReactNode }) {
  return <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.4)", display: "flex", pointerEvents: "none" }}>{children}</span>;
}

function GoogleG() {
  return (
    <svg width="19" height="19" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.9 2.4 30.5 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.7 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M47 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.9c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.9 38 47 32 47 24.5z" /><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z" /></svg>
  );
}
const ic = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function IconUser() { return (<svg {...ic}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>); }
function IconMail() { return (<svg {...ic}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>); }
function IconLock() { return (<svg {...ic}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>); }
function IconEye({ off }: { off?: boolean }) {
  return off
    ? (<svg {...ic}><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61" /><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M2 2l20 20" /></svg>)
    : (<svg {...ic}><path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" /><circle cx="12" cy="12" r="3" /></svg>);
}

const LOGIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
@keyframes lgRise{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
.lg-rise{animation:lgRise .6s cubic-bezier(.2,.7,.2,1) both}
input::placeholder{color:rgba(255,255,255,.32)}
input:focus{border-color:rgba(250,204,21,.55)}
/* default view ≈ 90% of a Chrome desktop view */
.lg-stage{width:min(440px,100%);display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;zoom:.9}

/* animated gold-glow backdrop */
.lg-bg{position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none}
.lg-orb{position:absolute;border-radius:50%;filter:blur(72px);will-change:transform}
.lg-orb.o1{width:540px;height:540px;left:-130px;top:-140px;background:radial-gradient(circle,rgba(250,204,21,.22),transparent 70%);animation:lgOrbA 20s ease-in-out infinite}
.lg-orb.o2{width:480px;height:480px;right:-150px;bottom:-130px;background:radial-gradient(circle,rgba(240,160,40,.18),transparent 70%);animation:lgOrbB 26s ease-in-out infinite}
.lg-orb.o3{width:400px;height:400px;left:34%;top:48%;background:radial-gradient(circle,rgba(250,204,21,.12),transparent 70%);animation:lgOrbC 32s ease-in-out infinite}
@keyframes lgOrbA{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(70px,46px) scale(1.16)}}
@keyframes lgOrbB{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-58px,-44px) scale(1.12)}}
@keyframes lgOrbC{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,-40px) scale(1.22)}}
.lg-sheen{position:absolute;top:50%;left:50%;width:160vmax;height:160vmax;margin:-80vmax 0 0 -80vmax;background:conic-gradient(from 0deg,transparent 0deg,rgba(250,204,21,.05) 40deg,transparent 90deg,transparent 360deg);animation:lgSpin 44s linear infinite}
@keyframes lgSpin{to{transform:rotate(360deg)}}
.lg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(250,204,21,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,.04) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(circle at 50% 42%,#000,transparent 72%);-webkit-mask-image:radial-gradient(circle at 50% 42%,#000,transparent 72%);animation:lgDrift 24s linear infinite}
@keyframes lgDrift{to{background-position:44px 44px,44px 44px}}
@media (prefers-reduced-motion:reduce){.lg-orb,.lg-sheen,.lg-grid,.lg-rise{animation:none!important}}
`;
