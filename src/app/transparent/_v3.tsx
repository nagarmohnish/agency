// VARIANT 3 — RADIAL REASONING CORE
// "See why every ad was created" rendered as an engine/brain: a glowing gold
// STRATEGY core with a slowly rotating conic-gradient ring, 4 input chips on the
// left arc feeding curved beams INTO the core, and 3 creative output cards on the
// right arc with beams flowing OUT. Pure CSS/SVG animation (works with JS off).
// Every keyframe + class is prefixed `v3` to avoid collisions when stacked.

const GOLD = "#FACC15";
const SERIF = "var(--font-serif), 'Instrument Serif', Georgia, serif";
const SANS = "var(--font-manrope), var(--font-sora), system-ui, sans-serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const ic = (path: React.ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);
const ICONS = {
  product: ic(<><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></>),
  personas: ic(<><circle cx="9" cy="9" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 7.5a3 3 0 0 1 0 5.8" /><path d="M16.5 14.2A5.5 5.5 0 0 1 20.5 19.5" /></>),
  reviews: ic(<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />),
  perf: ic(<path d="M3 16l5-5 4 3 6-7" />),
};

// ── Canvas geometry (coordinate space 1040 × 620) ───────────────────────────
const CX = 520;          // core center x
const CY = 310;          // core center y
const CORE_R = 96;       // core radius

// LEFT arc — 4 inputs around a quarter-circle (feed IN)
const INPUTS = [
  { key: "product", label: "Product", sub: "catalog · margins", icon: ICONS.product },
  { key: "personas", label: "Personas", sub: "who buys & why", icon: ICONS.personas },
  { key: "reviews", label: "Reviews", sub: "voice of customer", icon: ICONS.reviews },
  { key: "perf", label: "Ad performance", sub: "what's working", icon: ICONS.perf },
];
// chip centers, spread across the left arc (radius ~330 from core)
const IN_POS = [
  { x: 188, y: 96 },
  { x: 120, y: 232 },
  { x: 120, y: 388 },
  { x: 188, y: 524 },
];

// RIGHT arc — 3 creative outputs (flow OUT)
const OUTPUTS = [
  { label: "Feed", dims: "1080 × 1080", grad: "linear-gradient(150deg,#d8b48a,#b87b62 60%,#7a4f5e)", caption: "Soft Glow", video: false },
  { label: "Story", dims: "1080 × 1920", grad: "linear-gradient(160deg,#7c6cf0,#b65fae 55%,#e8a06b)", caption: "Night Ritual", video: false },
  { label: "Video", dims: "1080 × 1080 · 0:15", grad: "linear-gradient(150deg,#2f8f7d,#3aa0a8 55%,#1f5d6b)", caption: "Before / After", video: true },
];
const OUT_POS = [
  { x: 858, y: 104 },
  { x: 920, y: 310 },
  { x: 858, y: 516 },
];

// edge point on the core circle pointing toward (tx,ty)
function edge(tx: number, ty: number) {
  const a = Math.atan2(ty - CY, tx - CX);
  return { x: CX + Math.cos(a) * (CORE_R + 4), y: CY + Math.sin(a) * (CORE_R + 4) };
}

export default function Variant3() {
  return (
    <section
      style={{
        minHeight: 760,
        background: "radial-gradient(120% 110% at 70% 20%, #19130b 0%, #0b0907 55%, #070605 100%)",
        color: "#fff",
        fontFamily: SANS,
        padding: "84px 40px 96px",
        WebkitFontSmoothing: "antialiased",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes v3rotate { to { transform: rotate(360deg); } }
        @keyframes v3rotaterev { to { transform: rotate(-360deg); } }
        @keyframes v3corepulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,.20), 0 0 70px 6px rgba(250,204,21,.22), inset 0 0 40px rgba(250,204,21,.18); }
          50%     { box-shadow: 0 0 0 0 rgba(250,204,21,.34), 0 0 120px 18px rgba(250,204,21,.40), inset 0 0 56px rgba(250,204,21,.30); }
        }
        @keyframes v3glowpulse { 0%,100% { opacity: .5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        @keyframes v3beamin  { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes v3beamout { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }
        @keyframes v3rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes v3chipin { from { opacity: 0; transform: translateX(-14px) scale(.96); } to { opacity: 1; transform: none; } }
        @keyframes v3cardin { from { opacity: 0; transform: translateX(16px) scale(.96); } to { opacity: 1; transform: none; } }
        @keyframes v3badge { 0%,45% { opacity: 0; transform: scale(.7); } 60%,100% { opacity: 1; transform: none; } }
        @keyframes v3float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .v3rise   { animation: v3rise .8s cubic-bezier(.2,.7,.2,1) both; }
        .v3chip   { animation: v3chipin .7s cubic-bezier(.2,.7,.2,1) both; }
        .v3card   { animation: v3cardin .7s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .v3rise, .v3chip, .v3card { animation-duration: .01s !important; }
          .v3ring, .v3glow, .v3core, .v3beam, .v3floaty { animation: none !important; }
        }
      `}</style>

      {/* ── Header copy ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center" }}>
        <div className="v3rise" style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: "2.6px", color: "rgba(255,255,255,.42)", marginBottom: 20 }}>
          TRANSPARENT&nbsp;AI
        </div>
        <h1 className="v3rise" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 60, lineHeight: 1.04, letterSpacing: "-.5px", margin: 0, color: "#fff", animationDelay: ".06s" }}>
          See why every ad was created
        </h1>
        <p className="v3rise" style={{ fontSize: 17, lineHeight: 1.65, color: "rgba(255,255,255,.6)", maxWidth: 600, margin: "22px auto 0", animationDelay: ".12s" }}>
          The ROI Engine routes everything it knows through one reasoning core — product
          insight, customer angle, source data, creative pattern, performance hypothesis —
          and out the other side comes a finished, approved creative.{" "}
          <span style={{ color: "rgba(255,255,255,.85)" }}>Nothing is a black box.</span>
        </p>
      </div>

      {/* ── Radial diagram ──────────────────────────────────────────────── */}
      <div className="v3rise" style={{ position: "relative", width: 1040, height: 620, margin: "26px auto 0", animationDelay: ".18s" }}>

        {/* arc labels */}
        <div style={{ position: "absolute", left: 96, top: 4, fontFamily: MONO, fontSize: 10.5, letterSpacing: "1.6px", color: "rgba(255,255,255,.4)" }}>INPUTS&nbsp;THE&nbsp;ENGINE&nbsp;READS</div>
        <div style={{ position: "absolute", right: 96, top: 4, fontFamily: MONO, fontSize: 10.5, letterSpacing: "1.6px", color: "rgba(255,255,255,.4)", textAlign: "right" }}>CREATIVE&nbsp;OUTPUT</div>

        {/* curved beams (behind everything) */}
        <svg viewBox="0 0 1040 620" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <filter id="v3glowf" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="v3coreglow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(250,204,21,.55)" />
              <stop offset="45%" stopColor="rgba(250,204,21,.18)" />
              <stop offset="100%" stopColor="rgba(250,204,21,0)" />
            </radialGradient>
          </defs>

          {/* ambient halo behind the core */}
          <circle className="v3glow" cx={CX} cy={CY} r={210} fill="url(#v3coreglow)"
            style={{ transformOrigin: `${CX}px ${CY}px`, animation: "v3glowpulse 4.2s ease-in-out infinite" }} />

          {/* INPUT beams → into core */}
          {INPUTS.map((_, i) => {
            const p = IN_POS[i];
            const e = edge(p.x, p.y);
            const mx = (p.x + e.x) / 2;
            const my = (p.y + e.y) / 2;
            const cpx = mx + (CY - my) * 0.18; // gentle bow toward center line
            const d = `M ${p.x} ${p.y} Q ${cpx} ${my} ${e.x} ${e.y}`;
            return (
              <g key={"in" + i}>
                <path d={d} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth={1.3} />
                <path className="v3beam" d={d} fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" pathLength={1} filter="url(#v3glowf)"
                  style={{ strokeDasharray: "0.16 1", animation: "v3beamin 2.4s linear infinite", animationDelay: `${i * 0.4}s` }} />
              </g>
            );
          })}

          {/* OUTPUT beams ← out of core */}
          {OUTPUTS.map((_, i) => {
            const p = OUT_POS[i];
            const e = edge(p.x, p.y);
            const mx = (p.x + e.x) / 2;
            const my = (p.y + e.y) / 2;
            const cpx = mx + (CY - my) * 0.18;
            const d = `M ${e.x} ${e.y} Q ${cpx} ${my} ${p.x} ${p.y}`;
            return (
              <g key={"out" + i}>
                <path d={d} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth={1.3} />
                <path className="v3beam" d={d} fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" pathLength={1} filter="url(#v3glowf)"
                  style={{ strokeDasharray: "0.16 1", animation: "v3beamout 2.4s linear infinite", animationDelay: `${1 + i * 0.4}s` }} />
              </g>
            );
          })}
        </svg>

        {/* ── CENTRAL CORE ──────────────────────────────────────────────── */}
        <div style={{ position: "absolute", left: CX, top: CY, transform: "translate(-50%,-50%)", width: CORE_R * 2 + 88, height: CORE_R * 2 + 88, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* rotating conic ring */}
          <div className="v3ring" style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "conic-gradient(from 0deg, rgba(250,204,21,0) 0deg, rgba(250,204,21,.05) 60deg, #FACC15 150deg, rgba(255,236,150,.9) 175deg, #FACC15 200deg, rgba(250,204,21,.05) 300deg, rgba(250,204,21,0) 360deg)",
            WebkitMask: "radial-gradient(closest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
            mask: "radial-gradient(closest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
            animation: "v3rotate 9s linear infinite", filter: "drop-shadow(0 0 8px rgba(250,204,21,.5))",
          }} />
          {/* counter-rotating fainter inner tick ring */}
          <div className="v3ring" style={{
            position: "absolute", inset: 22, borderRadius: "50%",
            background: "conic-gradient(from 90deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,.22) 40deg, rgba(255,255,255,0) 120deg, rgba(255,255,255,0) 240deg, rgba(255,255,255,.16) 300deg, rgba(255,255,255,0) 360deg)",
            WebkitMask: "radial-gradient(closest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
            mask: "radial-gradient(closest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
            animation: "v3rotaterev 14s linear infinite",
          }} />

          {/* the glowing core disc */}
          <div className="v3core" style={{
            position: "relative", width: CORE_R * 2, height: CORE_R * 2, borderRadius: "50%",
            background: "radial-gradient(circle at 38% 32%, rgba(255,243,191,.30), rgba(28,21,9,.96) 62%, rgba(14,10,5,.98))",
            border: "1px solid rgba(250,204,21,.5)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
            animation: "v3corepulse 3.4s ease-in-out infinite",
          }}>
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "2.4px", color: "rgba(255,255,255,.55)" }}>STRATEGY</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, lineHeight: 1, color: "#fff", marginTop: 6, textShadow: "0 0 22px rgba(250,204,21,.45)" }}>Reasoning<br />Core</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 9, fontFamily: MONO, fontSize: 8.5, letterSpacing: "1.2px", color: GOLD }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, boxShadow: `0 0 6px ${GOLD}` }} />
              LIVE
            </span>
          </div>
        </div>

        {/* ── INPUT chips (left arc) ────────────────────────────────────── */}
        {INPUTS.map((n, i) => {
          const p = IN_POS[i];
          return (
            <div key={n.key} className="v3chip v3floaty"
              style={{
                position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)",
                width: 216, display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 14,
                background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.09)",
                backdropFilter: "blur(2px)", boxShadow: "0 18px 40px -22px rgba(0,0,0,.7)",
                animationDelay: `${0.3 + i * 0.1}s, ${0.3 + i * 0.1}s`,
                animationName: "v3chipin, v3float",
                animationDuration: ".7s, 6s",
                animationTimingFunction: "cubic-bezier(.2,.7,.2,1), ease-in-out",
                animationIterationCount: "1, infinite",
                animationFillMode: "both, none",
              }}>
              <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(250,204,21,.12)", border: "1px solid rgba(250,204,21,.26)", color: GOLD }}>{n.icon}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: "#fff" }}>{n.label}</span>
                <span style={{ display: "block", fontSize: 11.5, color: "rgba(255,255,255,.5)", marginTop: 1 }}>{n.sub}</span>
              </span>
            </div>
          );
        })}

        {/* ── OUTPUT creative cards (right arc) ─────────────────────────── */}
        {OUTPUTS.map((o, i) => {
          const p = OUT_POS[i];
          return (
            <div key={o.label} className="v3card"
              style={{
                position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)",
                width: 156, animationDelay: `${0.9 + i * 0.12}s`,
              }}>
              <div style={{ position: "relative", height: 112, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.12)", background: o.grad, boxShadow: "0 20px 46px -22px rgba(0,0,0,.8)" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 28% 18%, rgba(255,255,255,.34), transparent 55%)" }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", color: "#fff", fontSize: 17, textShadow: "0 1px 8px rgba(0,0,0,.45)" }}>{o.caption}</div>
                {o.video && (
                  <div style={{ position: "absolute", left: "50%", top: "44%", transform: "translate(-50%,-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,.42)", border: "1px solid rgba(255,255,255,.65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                )}
                <span style={{ position: "absolute", top: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: MONO, fontSize: 8, letterSpacing: ".5px", color: "#0a2e1c", background: "#34D399", padding: "2px 7px", borderRadius: 20, fontWeight: 700, animation: "v3badge 3.4s ease-in-out infinite", animationDelay: `${i * 0.4}s` }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0a2e1c" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                  APPROVED
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{o.label}</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{o.dims}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
