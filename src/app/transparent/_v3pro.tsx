// VARIANT 3 — POLISHED. Radial reasoning core, refined for a premium/pro feel:
// focused gold halo (not a whole-screen wash), a thin elegant rotating ring,
// beams that emanate cleanly from each chip/card inner edge, restrained accents,
// calmer motion. Pure CSS/SVG animation (works with JS off). Keyframes prefixed `vp`.

const GOLD = "#FACC15";
const SERIF = "var(--font-serif), 'Instrument Serif', Georgia, serif";
const SANS = "var(--font-manrope), var(--font-sora), system-ui, sans-serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const ic = (path: React.ReactNode) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);
const ICONS = {
  product: ic(<><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></>),
  personas: ic(<><circle cx="9" cy="9" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 7.5a3 3 0 0 1 0 5.8" /><path d="M16.5 14.2A5.5 5.5 0 0 1 20.5 19.5" /></>),
  reviews: ic(<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />),
  perf: ic(<path d="M3 16l5-5 4 3 6-7" />),
};

// ── geometry (coordinate space 1100 × 640) ──────────────────────────────────
const CX = 550, CY = 320, R = 90;
const IN_X_EDGE = 300;   // chips' inner (right) edge — beams start here
const OUT_X_EDGE = 800;  // cards' inner (left) edge — beams end here

const INPUTS = [
  { key: "product", label: "Product", sub: "catalog · margins", icon: ICONS.product, y: 96 },
  { key: "personas", label: "Personas", sub: "who buys & why", icon: ICONS.personas, y: 242 },
  { key: "reviews", label: "Reviews", sub: "voice of customer", icon: ICONS.reviews, y: 398 },
  { key: "perf", label: "Ad performance", sub: "what's working now", icon: ICONS.perf, y: 544 },
];
const OUTPUTS = [
  { label: "Feed", dims: "1080 × 1080", grad: "linear-gradient(150deg,#d8b48a,#b9806a 58%,#7c5160)", caption: "Soft Glow", video: false, y: 112 },
  { label: "Story", dims: "1080 × 1920", grad: "linear-gradient(158deg,#8a78ee,#b063a8 52%,#e3a06d)", caption: "Night Ritual", video: false, y: 320 },
  { label: "Video", dims: "1080 × 1080 · 0:15", grad: "linear-gradient(150deg,#359184,#3a9aa6 55%,#225a68)", caption: "Before / After", video: true, y: 528 },
];

// point on the core circle facing (tx,ty)
function edge(tx: number, ty: number) {
  const a = Math.atan2(ty - CY, tx - CX);
  return { x: CX + Math.cos(a) * (R + 3), y: CY + Math.sin(a) * (R + 3) };
}
// smooth cubic from (sx,sy) → (ex,ey) that leaves/enters horizontally (premium arc)
function curve(sx: number, sy: number, ex: number, ey: number, bow = 84) {
  const dir = ex >= sx ? 1 : -1;
  return `M ${sx} ${sy} C ${sx + bow * dir} ${sy}, ${ex - bow * dir} ${ey}, ${ex} ${ey}`;
}

export default function Variant3Pro() {
  return (
    <section style={{ minHeight: 800, background: "radial-gradient(58% 52% at 50% 44%, rgba(54,40,16,.45), rgba(10,9,11,0) 72%), #09080b", color: "#fff", fontFamily: SANS, padding: "92px 40px 104px", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}>
      <style>{`
        @keyframes vp-rotate { to { transform: rotate(360deg); } }
        @keyframes vp-rotaterev { to { transform: rotate(-360deg); } }
        @keyframes vp-corepulse { 0%,100% { box-shadow: 0 0 60px 2px rgba(250,204,21,.16), inset 0 0 34px rgba(250,204,21,.10); } 50% { box-shadow: 0 0 92px 8px rgba(250,204,21,.26), inset 0 0 44px rgba(250,204,21,.18); } }
        @keyframes vp-halo { 0%,100% { opacity: .55; } 50% { opacity: .9; } }
        @keyframes vp-beamin { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes vp-beamout { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }
        @keyframes vp-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes vp-chipin { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
        @keyframes vp-cardin { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
        @keyframes vp-badge { from { opacity: 0; transform: scale(.82); } to { opacity: 1; transform: none; } }
        @keyframes vp-dot { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
        .vp-rise { animation: vp-rise .85s cubic-bezier(.2,.7,.2,1) both; }
        .vp-chip { animation: vp-chipin .7s cubic-bezier(.2,.7,.2,1) both; }
        .vp-card { animation: vp-cardin .7s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .vp-rise,.vp-chip,.vp-card { animation-duration:.01s !important; } [class].vp-anim, .vp-ring,.vp-core,.vp-halo,.vp-beam { animation: none !important; } }
      `}</style>

      {/* header */}
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <div className="vp-rise" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "3px", color: "rgba(255,255,255,.4)", marginBottom: 22 }}>TRANSPARENT&nbsp;AI</div>
        <h1 className="vp-rise" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 58, lineHeight: 1.05, letterSpacing: "-.4px", margin: 0, animationDelay: ".06s" }}>See why every ad was created</h1>
        <p className="vp-rise" style={{ fontSize: 16.5, lineHeight: 1.68, color: "rgba(255,255,255,.58)", maxWidth: 560, margin: "22px auto 0", animationDelay: ".12s" }}>
          Every signal the ROI Engine reads is routed through one reasoning core — then out comes a finished, approved creative, with the strategy behind it on the record. <span style={{ color: "rgba(255,255,255,.85)" }}>No black box.</span>
        </p>
      </div>

      {/* radial diagram */}
      <div className="vp-rise" style={{ position: "relative", width: 1100, height: 640, maxWidth: "100%", margin: "40px auto 0", animationDelay: ".18s" }}>
        <div style={{ position: "absolute", left: 90, top: 0, fontFamily: MONO, fontSize: 10, letterSpacing: "1.8px", color: "rgba(255,255,255,.38)" }}>SIGNALS&nbsp;IN</div>
        <div style={{ position: "absolute", right: 90, top: 0, fontFamily: MONO, fontSize: 10, letterSpacing: "1.8px", color: "rgba(255,255,255,.38)" }}>CREATIVE&nbsp;OUT</div>

        {/* beams + halo */}
        <svg viewBox="0 0 1100 640" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <filter id="vpglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <radialGradient id="vphalo" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(250,204,21,.42)" /><stop offset="42%" stopColor="rgba(250,204,21,.12)" /><stop offset="100%" stopColor="rgba(250,204,21,0)" /></radialGradient>
            <linearGradient id="vpbeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="rgba(250,204,21,0)" /><stop offset="50%" stopColor={GOLD} /><stop offset="100%" stopColor="rgba(255,240,170,1)" /></linearGradient>
          </defs>
          <circle className="vp-halo vp-anim" cx={CX} cy={CY} r={190} fill="url(#vphalo)" style={{ animation: "vp-halo 5s ease-in-out infinite" }} />

          {INPUTS.map((n, i) => {
            const e = edge(IN_X_EDGE, n.y);
            const d = curve(IN_X_EDGE, n.y, e.x, e.y);
            return (
              <g key={"in" + i}>
                <path d={d} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={1.2} />
                <path className="vp-beam vp-anim" d={d} fill="none" stroke="url(#vpbeam)" strokeWidth={1.8} strokeLinecap="round" pathLength={1} filter="url(#vpglow)" style={{ strokeDasharray: "0.2 1", animation: "vp-beamin 2.8s linear infinite", animationDelay: `${i * 0.45}s` }} />
              </g>
            );
          })}
          {OUTPUTS.map((o, i) => {
            const e = edge(OUT_X_EDGE, o.y);
            const d = curve(e.x, e.y, OUT_X_EDGE, o.y);
            return (
              <g key={"out" + i}>
                <path d={d} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={1.2} />
                <path className="vp-beam vp-anim" d={d} fill="none" stroke="url(#vpbeam)" strokeWidth={1.8} strokeLinecap="round" pathLength={1} filter="url(#vpglow)" style={{ strokeDasharray: "0.2 1", animation: "vp-beamout 2.8s linear infinite", animationDelay: `${1.1 + i * 0.45}s` }} />
              </g>
            );
          })}
        </svg>

        {/* core */}
        <div style={{ position: "absolute", left: CX, top: CY, transform: "translate(-50%,-50%)", width: R * 2 + 70, height: R * 2 + 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* thin rotating ring — mostly faint with one bright arc */}
          <div className="vp-ring vp-anim" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, rgba(250,204,21,0) 0deg, rgba(250,204,21,.04) 90deg, rgba(250,204,21,.55) 160deg, rgba(255,238,170,.95) 182deg, rgba(250,204,21,.4) 205deg, rgba(250,204,21,0) 300deg)", WebkitMask: "radial-gradient(closest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))", mask: "radial-gradient(closest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))", animation: "vp-rotate 12s linear infinite", filter: "drop-shadow(0 0 6px rgba(250,204,21,.45))" }} />
          {/* faint counter-rotating dotted ring */}
          <div className="vp-ring vp-anim" style={{ position: "absolute", inset: 14, borderRadius: "50%", border: "1px dashed rgba(255,255,255,.10)", animation: "vp-rotaterev 26s linear infinite" }} />

          {/* core disc */}
          <div className="vp-core vp-anim" style={{ position: "relative", width: R * 2, height: R * 2, borderRadius: "50%", background: "radial-gradient(circle at 40% 32%, rgba(255,243,196,.20), rgba(24,18,8,.97) 60%, rgba(12,9,5,.99))", border: "1px solid rgba(250,204,21,.42)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "vp-corepulse 4.2s ease-in-out infinite" }}>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "2.6px", color: "rgba(255,255,255,.5)" }}>AI&nbsp;REASONING</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, lineHeight: 1, marginTop: 7, textShadow: "0 0 26px rgba(250,204,21,.4)" }}>Strategy</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, fontFamily: MONO, fontSize: 8.5, letterSpacing: "1.4px", color: "rgba(255,255,255,.55)" }}>
              <span className="vp-anim" style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, boxShadow: `0 0 7px ${GOLD}`, animation: "vp-dot 2.2s ease-in-out infinite" }} />
              SYNTHESIZING
            </span>
          </div>
        </div>

        {/* input chips — right edge sits at IN_X_EDGE so beams emanate from it */}
        {INPUTS.map((n, i) => (
          <div key={n.key} className="vp-chip" style={{ position: "absolute", left: IN_X_EDGE - 212, top: n.y - 29, width: 212, height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 15px", borderRadius: 14, background: "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.025))", border: "1px solid rgba(255,255,255,.10)", boxShadow: "0 16px 40px -24px rgba(0,0,0,.8)", animationDelay: `${0.3 + i * 0.1}s` }}>
            <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(250,204,21,.1)", border: "1px solid rgba(250,204,21,.24)", color: GOLD }}>{n.icon}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 600, letterSpacing: "-.1px" }}>{n.label}</span>
              <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>{n.sub}</span>
            </span>
          </div>
        ))}

        {/* output cards — left edge sits at OUT_X_EDGE */}
        {OUTPUTS.map((o, i) => (
          <div key={o.label} className="vp-card" style={{ position: "absolute", left: OUT_X_EDGE, top: o.y - 59, width: 150, animationDelay: `${1.0 + i * 0.12}s` }}>
            <div style={{ position: "relative", height: 108, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.12)", background: o.grad, boxShadow: "0 22px 50px -26px rgba(0,0,0,.85)" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 28% 16%, rgba(255,255,255,.32), transparent 56%)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 13, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", color: "#fff", fontSize: 16.5, textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{o.caption}</div>
              {o.video && (
                <div style={{ position: "absolute", left: "50%", top: "43%", transform: "translate(-50%,-50%)", width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.65)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                </div>
              )}
              <span style={{ position: "absolute", top: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: MONO, fontSize: 8, letterSpacing: ".4px", color: "#07301d", background: "#3ddc97", padding: "2px 7px", borderRadius: 20, fontWeight: 700, animation: "vp-badge .6s ease-out both", animationDelay: `${1.5 + i * 0.12}s` }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#07301d" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                APPROVED
              </span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 9 }}>{o.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{o.dims}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
