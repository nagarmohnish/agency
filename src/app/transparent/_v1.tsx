// VARIANT 1 — HORIZONTAL SIGNAL PIPELINE
// "See why every ad was created" — DATA IN → AI REASONING → OUTPUT.
// Curved gold SVG beams flow left→right (pathLength + animated strokeDashoffset),
// the strategy node pulses, APPROVED badges fade on a loop. Pure CSS/SVG, no JS.
// All keyframes + classes prefixed `v1-` so it never collides with other variants.

import type React from "react";

const GOLD = "#FACC15";
const SERIF = "var(--font-serif), 'Instrument Serif', Georgia, serif";
const SANS = "var(--font-manrope), var(--font-sora), system-ui, sans-serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

// ── inline icons ──────────────────────────────────────────────────────────
const icon = (path: React.ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);
const I = {
  product: icon(<><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></>),
  personas: icon(<><circle cx="9" cy="9" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 7.5a3 3 0 0 1 0 5.8" /><path d="M16.5 14.2A5.5 5.5 0 0 1 20.5 19.5" /></>),
  reviews: icon(<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />),
  perf: icon(<path d="M3 16l5-5 4 3 6-7" />),
};

// ── diagram geometry (fixed SVG coordinate space, 760 × 460) ────────────────
const VW = 760, VH = 460;
const INPUTS = [
  { key: "product", label: "Product", ic: I.product, cy: 56 },
  { key: "personas", label: "Personas", ic: I.personas, cy: 178 },
  { key: "reviews", label: "Reviews", ic: I.reviews, cy: 300 },
  { key: "perf", label: "Ad performance", ic: I.perf, cy: 416 },
];
const OUTPUTS = [
  { label: "Feed", dims: "1080 × 1080", thumb: "linear-gradient(150deg, #d8b48a, #b87b62 60%, #7a4f5e)", video: false, cy: 70 },
  { label: "Story", dims: "1080 × 1920", thumb: "linear-gradient(160deg, #6c5ce7 0%, #a368c9 55%, #d98aa0)", video: false, cy: 230 },
  { label: "Video", dims: "1080 × 1080 · 0:15", thumb: "linear-gradient(150deg, #2a9d8f, #1d6f6a 55%, #173e44)", video: true, cy: 390 },
];

// node edges in SVG space
const IN_RIGHT = 256;            // right edge of input chips
const SX = 300, SR = 460, SCY = VH / 2;  // strategy box: left, right, center-y
const OUT_LEFT = 506;            // left edge of output cards

export default function Variant1() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: 720,
        background: "radial-gradient(120% 110% at 70% 20%, #19130b 0%, #0b0907 55%, #070605 100%)",
        color: "#fff",
        fontFamily: SANS,
        padding: "96px 40px",
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @keyframes v1-beam { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes v1-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,.16), 0 0 36px rgba(250,204,21,.16); border-color: rgba(250,204,21,.40); }
          50%     { box-shadow: 0 0 0 0 rgba(250,204,21,.30), 0 0 64px rgba(250,204,21,.40); border-color: rgba(250,204,21,.68); }
        }
        @keyframes v1-glowdot { 0%,100% { opacity:.45; transform: scale(.85);} 50% { opacity:1; transform: scale(1.15);} }
        @keyframes v1-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes v1-badge { 0%,42% { opacity: 0; transform: scale(.8); } 58%,100% { opacity: 1; transform: none; } }
        @keyframes v1-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes v1-sheen { 0% { transform: translateX(-130%) skewX(-18deg); } 60%,100% { transform: translateX(260%) skewX(-18deg); } }
        .v1-rise { animation: v1-rise .8s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .v1-rise, [class*="v1-"] { animation: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── HEADER (left-aligned, above the diagram) ───────────────────── */}
        <header style={{ maxWidth: 720, marginBottom: 56 }}>
          <div className="v1-rise" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: MONO, fontSize: 12, letterSpacing: "2.6px", color: "rgba(255,255,255,.5)", marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, animation: "v1-glowdot 2.4s ease-in-out infinite" }} />
            TRANSPARENT&nbsp;AI
          </div>
          <h2 className="v1-rise" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 60, lineHeight: 1.03, letterSpacing: "-.5px", margin: 0, color: "#fff", animationDelay: ".06s" }}>
            See why every ad was created
          </h2>
          <p className="v1-rise" style={{ fontSize: 17, lineHeight: 1.65, color: "rgba(255,255,255,.55)", maxWidth: 600, marginTop: 24, animationDelay: ".13s" }}>
            The ROI Engine exposes the reasoning behind each ad — product insight, customer angle, source data, creative pattern, and the performance hypothesis it&apos;s testing.{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>Nothing is a black box.</span>
          </p>
        </header>

        {/* ── PIPELINE ────────────────────────────────────────────────────── */}
        <div
          className="v1-rise"
          style={{
            animationDelay: ".2s",
            position: "relative",
            borderRadius: 26,
            padding: "34px 30px",
            background: "linear-gradient(180deg, rgba(26,21,13,.55), rgba(12,10,8,.55))",
            border: "1px solid rgba(255,255,255,.09)",
            boxShadow: "0 40px 100px -40px rgba(0,0,0,.75)",
          }}
        >
          {/* column captions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 18 }}>
            <span style={cap("left")}>DATA IN</span>
            <span style={cap("center")}>AI REASONING</span>
            <span style={cap("right")}>OUTPUT</span>
          </div>

          <div style={{ position: "relative", width: "100%", aspectRatio: `${VW} / ${VH}` }}>
            {/* ── connector beams (SVG, behind nodes) ─────────────────────── */}
            <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <filter id="v1-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.6" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id="v1-beamgrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FACC15" stopOpacity="0" />
                  <stop offset="45%" stopColor="#FACC15" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FFE680" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* inputs → strategy */}
              {INPUTS.map((n, i) => {
                const d = `M ${IN_RIGHT} ${n.cy} C ${IN_RIGHT + 38} ${n.cy}, ${SX - 38} ${SCY}, ${SX} ${SCY}`;
                return <Beam key={"i" + i} d={d} delay={i * 0.42} />;
              })}
              {/* strategy → outputs */}
              {OUTPUTS.map((o, i) => {
                const d = `M ${SR} ${SCY} C ${SR + 26} ${SCY}, ${OUT_LEFT - 26} ${o.cy}, ${OUT_LEFT} ${o.cy}`;
                return <Beam key={"o" + i} d={d} delay={0.9 + i * 0.42} />;
              })}
            </svg>

            {/* ── DATA IN chips ───────────────────────────────────────────── */}
            {INPUTS.map((n, i) => (
              <div
                key={n.key}
                style={{
                  position: "absolute",
                  left: `${(14 / VW) * 100}%`,
                  top: `${(n.cy / VH) * 100}%`,
                  transform: "translateY(-50%)",
                  width: `${(228 / VW) * 100}%`,
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  padding: "12px 15px",
                  borderRadius: 13,
                  background: "rgba(255,255,255,.035)",
                  border: "1px solid rgba(255,255,255,.09)",
                  color: "#fff",
                  animation: "v1-float 5s ease-in-out infinite",
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(250,204,21,.10)", border: "1px solid rgba(250,204,21,.22)", color: GOLD }}>{n.ic}</span>
                <span style={{ fontSize: 14.5, fontWeight: 500, whiteSpace: "nowrap" }}>{n.label}</span>
              </div>
            ))}

            {/* ── STRATEGY node (center, pulsing) ─────────────────────────── */}
            <div
              style={{
                position: "absolute",
                left: `${(SX / VW) * 100}%`,
                top: "50%",
                transform: "translateY(-50%)",
                width: `${((SR - SX) / VW) * 100}%`,
                padding: "16px 18px",
                borderRadius: 18,
                background: "linear-gradient(180deg, rgba(28,21,11,.95), rgba(14,11,7,.95))",
                border: "1px solid rgba(250,204,21,.42)",
                animation: "v1-pulse 3.4s ease-in-out infinite",
                zIndex: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
                <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "1.6px", color: "rgba(255,255,255,.5)" }}>STRATEGY</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: MONO, fontSize: 9, letterSpacing: "1px", color: GOLD }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, animation: "v1-glowdot 1.8s ease-in-out infinite" }} />
                  REASONING
                </span>
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 25, lineHeight: 1.08, color: "#fff" }}>Founder-led proof.</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.55)", marginTop: 8, lineHeight: 1.4 }}>authority &middot; social proof &middot; scarcity</div>
            </div>

            {/* ── OUTPUT cards ────────────────────────────────────────────── */}
            {OUTPUTS.map((o, i) => (
              <div
                key={o.label}
                style={{
                  position: "absolute",
                  right: `${(8 / VW) * 100}%`,
                  top: `${(o.cy / VH) * 100}%`,
                  transform: "translateY(-50%)",
                  width: `${(168 / VW) * 100}%`,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "16 / 11",
                    borderRadius: 13,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,.12)",
                    background: o.thumb,
                    boxShadow: "0 14px 34px -16px rgba(0,0,0,.7)",
                  }}
                >
                  {/* light bloom */}
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 28% 18%, rgba(255,255,255,.38), transparent 56%)" }} />
                  {/* moving sheen */}
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "45%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent)", animation: "v1-sheen 4.6s ease-in-out infinite", animationDelay: `${i * 0.6}s` }} />
                  {/* product line */}
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", color: "#fff", fontSize: 16, textShadow: "0 1px 10px rgba(0,0,0,.5)" }}>Soft Glow</div>
                  {/* play badge for video */}
                  {o.video && (
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,.42)", border: "1px solid rgba(255,255,255,.65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  )}
                  {/* APPROVED badge (loops) */}
                  <span style={{ position: "absolute", top: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: MONO, fontSize: 8, letterSpacing: ".5px", color: "#0a2e1c", background: "#34D399", padding: "3px 7px", borderRadius: 20, fontWeight: 700, boxShadow: "0 2px 10px rgba(52,211,153,.4)", animation: "v1-badge 3.6s ease-in-out infinite", animationDelay: `${1.4 + i * 0.45}s` }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0a2e1c" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    APPROVED
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{o.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9.5, color: "rgba(255,255,255,.4)" }}>{o.dims}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// curved gold beam: faint static base path + animated flowing dash
function Beam({ d, delay }: { d: string; delay: number }) {
  return (
    <>
      <path d={d} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
      <path
        d={d}
        fill="none"
        stroke="url(#v1-beamgrad)"
        strokeWidth={2.2}
        strokeLinecap="round"
        pathLength={1}
        filter="url(#v1-glow)"
        vectorEffect="non-scaling-stroke"
        style={{ strokeDasharray: "0.12 1", animation: "v1-beam 2.8s linear infinite", animationDelay: `${delay}s` }}
      />
    </>
  );
}

function cap(align: "left" | "center" | "right"): React.CSSProperties {
  return { fontFamily: MONO, fontSize: 10.5, letterSpacing: "1.8px", color: "rgba(255,255,255,.42)", textAlign: align };
}
