"use client";

// VARIANT 4 — ANNOTATED AD "X-RAY" (LIGHT). One real, finished creative shown in a
// phone, in-feed — then dissected with callouts that trace each element back to the
// data/strategy behind it. Light/warm theme to match the Aurora-Light landing.
// Connector lines draw in; a scan line sweeps the ad. CSS/SVG only. `xr` keyframes.

import XrayScaler from "./_xrayScaler";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const AD_IMG = `${BP}/transparent/ad-creative-02.jpeg`; // real AI ad creative shown in-feed

const GOLD = "#FACC15";        // bright gold accents (badge, dots)
const LINEGOLD = "#E0A82E";    // connector beams (visible on the cream bg)
const LBL = "#9A7A0A";         // callout label text (deep gold)
const INK = "#1A1710";
const MUTED = "#6A6456";
const DISP = "var(--font-sora), 'Sora', system-ui, sans-serif"; // heavy grotesque section header (matches .hiw__title)
const SANS = "var(--font-manrope), 'Manrope', system-ui, sans-serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

// stage coordinate space 1080 × 620; phone card x:410–670 (screen interior ~417–663, y ~47–573)
const CALLOUTS: { side: "L" | "R"; label: string; text: string; ax: number; ay: number; nx: number; ny: number }[] = [
  { side: "L", label: "PERSONA", text: "Creators & designers, 22–40. The editorial portrait out-tested flat product shots.", ax: 505, ay: 182, nx: 24, ny: 96 },
  { side: "L", label: "AI GENERATION", text: "The creative shows the tool working live — “add a floral pattern to the sari” — proof, not a claim.", ax: 486, ay: 305, nx: 24, ny: 290 },
  { side: "L", label: "ANGLE", text: "Platform-as-creative-partner — the brand follows the maker, not the other way around.", ax: 498, ay: 452, nx: 24, ny: 452 },
  { side: "R", label: "PERFORMANCE HYPOTHESIS", text: "Native vertical format + a soft “Learn more” — optimizing for watch-through, not hard clicks.", ax: 643, ay: 336, nx: 774, ny: 96 },
  { side: "R", label: "DISCLOSURE", text: "Labeled “Ad” and AI-assisted, per platform 2026 policy.", ax: 643, ay: 505, nx: 774, ny: 452 },
];
const NW = 282; // note width

function connector(c: (typeof CALLOUTS)[number]) {
  const fromX = c.side === "L" ? c.nx + NW : c.nx;
  const fromY = c.ny + 27;
  const dir = c.ax > fromX ? 1 : -1;
  return { fromX, fromY, d: `M ${fromX} ${fromY} C ${fromX + 52 * dir} ${fromY}, ${c.ax - 40 * dir} ${c.ay}, ${c.ax} ${c.ay}` };
}

export default function Variant4Xray() {
  return (
    <section style={{ minHeight: 880, background: "#FFFFFF", color: INK, fontFamily: SANS, padding: "84px 40px 96px", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}>
      <style>{`
        @keyframes xr-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes xr-adin { from { opacity: 0; transform: translateY(22px) scale(.965); } to { opacity: 1; transform: none; } }
        @keyframes xr-draw { to { stroke-dashoffset: 0; } }
        @keyframes xr-noteL { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
        @keyframes xr-noteR { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }
        @keyframes xr-dot { 0% { opacity: 0; transform: scale(0); } 60% { opacity: 1; } 100% { opacity: 1; transform: scale(1); } }
        @keyframes xr-ping { 0% { transform: scale(.6); opacity: .8; } 70%,100% { transform: scale(2.4); opacity: 0; } }
        @keyframes xr-scan { 0% { transform: translateY(0); opacity: 0; } 12%,88% { opacity: .9; } 100% { transform: translateY(498px); opacity: 0; } }
        .xr-rise { animation: xr-rise .85s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce){ .xr-rise,[class].xr-a { animation-duration:.01s !important; } .xr-scan,.xr-ping { display:none !important; } }
      `}</style>

      {/* header */}
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="xr-rise" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "3px", color: LBL, marginBottom: 18 }}>TRANSPARENT&nbsp;AI</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <h1 className="xr-rise" style={{ fontFamily: DISP, fontWeight: 800, fontSize: 50, lineHeight: 1.02, letterSpacing: "-.03em", margin: 0, color: INK, animationDelay: ".06s" }}>See why every ad<br />was created</h1>
          <p className="xr-rise" style={{ fontSize: 16, lineHeight: 1.65, color: MUTED, maxWidth: 400, margin: 0, animationDelay: ".12s" }}>
            Open any creative and the ROI Engine shows its work — every element traced to the insight, angle, and hypothesis behind it. <span style={{ color: INK, fontWeight: 600 }}>No black box.</span>
          </p>
        </div>
      </div>

      {/* x-ray stage — scaled to fit narrow viewports as one unit (scale=1 at >=1080px).
          Below ~640px the scaler hands us `mobile` and we render a phone-only layout
          instead (the side callout notes would otherwise shrink to unreadable text). */}
      <XrayScaler top={44}>
      {({ mobile }: { mobile: boolean }) => mobile ? (
        /* ── MOBILE: centered phone + short caption, no side notes/connectors ──────── */
        <div className="xr-rise" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: "8px 4px 0", animationDelay: ".2s" }}>
          <div style={{ position: "relative", width: 246, maxWidth: "78vw", aspectRatio: "260 / 540", borderRadius: 36, padding: 7, background: "linear-gradient(150deg,#1b1712,#0c0a07)", boxShadow: "0 46px 90px -38px rgba(60,40,20,.55), 0 6px 18px -10px rgba(0,0,0,.4)" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 29, overflow: "hidden", background: "#000" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={AD_IMG} alt="An AI-assisted ad creative shown natively in a social feed" width={590} height={1280} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div className="xr-scan" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: `0 0 12px ${GOLD}`, animation: "xr-scan 6s cubic-bezier(.5,0,.5,1) infinite", animationDelay: "1s", pointerEvents: "none" }} />
            </div>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: MUTED, textAlign: "center", maxWidth: 360, margin: 0 }}>
            One real, AI-assisted creative — every element traced to the persona, angle, and performance hypothesis behind it.{" "}
            <a href={`${BP}/transparent/xray`} style={{ color: LBL, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>See the full x-ray →</a>
          </p>
        </div>
      ) : (
      <div className="xr-rise" style={{ position: "relative", width: 1080, height: 620, margin: 0, animationDelay: ".2s" }}>

        {/* connector lines (SVG overlay) */}
        <svg viewBox="0 0 1080 620" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
          <defs>
            <filter id="xrglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {CALLOUTS.map((c, i) => {
            const { d } = connector(c);
            const delay = 0.9 + i * 0.28;
            return (
              <path key={"l" + i} className="xr-a" d={d} fill="none" stroke={LINEGOLD} strokeWidth={1.6} strokeLinecap="round" pathLength={1} filter="url(#xrglow)"
                style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: `xr-draw .7s ease-out forwards`, animationDelay: `${delay}s` }} />
            );
          })}
        </svg>

        {/* ── the PHONE showing the real creative, full-screen in-feed ───────────── */}
        <div className="xr-a" style={{ position: "absolute", left: 410, top: 40, width: 260, height: 540, borderRadius: 36, padding: 7, background: "linear-gradient(150deg,#1b1712,#0c0a07)", boxShadow: "0 46px 90px -38px rgba(60,40,20,.55), 0 6px 18px -10px rgba(0,0,0,.4)", animation: "xr-adin .9s cubic-bezier(.2,.7,.2,1) both", animationDelay: ".3s" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 29, overflow: "hidden", background: "#000" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AD_IMG} alt="An AI-assisted ad creative shown natively in a social feed" width={590} height={1280} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {/* x-ray scan line */}
            <div className="xr-scan" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: `0 0 12px ${GOLD}`, animation: "xr-scan 6s cubic-bezier(.5,0,.5,1) infinite", animationDelay: "1s", pointerEvents: "none" }} />
          </div>
        </div>

        {/* anchor dots */}
        {CALLOUTS.map((c, i) => (
          <span key={"d" + i} className="xr-a" style={{ position: "absolute", left: c.ax, top: c.ay, transform: "translate(-50%,-50%)", width: 9, height: 9, animation: "xr-dot .4s ease-out both", animationDelay: `${0.9 + i * 0.28 + 0.6}s` }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: GOLD, boxShadow: `0 0 0 2px rgba(255,255,255,.85), 0 0 8px ${LINEGOLD}` }} />
            <span className="xr-a xr-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${LINEGOLD}`, animation: "xr-ping 2.6s ease-out infinite", animationDelay: `${1.6 + i * 0.28}s` }} />
          </span>
        ))}

        {/* callout notes (light cards) */}
        {CALLOUTS.map((c, i) => (
          <div key={"n" + i} className="xr-a" style={{ position: "absolute", left: c.nx, top: c.ny, width: NW, padding: "12px 15px", borderRadius: 13, background: "#FFFFFF", border: "1px solid #ECE6D6", boxShadow: "0 16px 40px -24px rgba(60,48,16,.45)", animation: `${c.side === "L" ? "xr-noteL" : "xr-noteR"} .7s cubic-bezier(.2,.7,.2,1) both`, animationDelay: `${1.0 + i * 0.28}s` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: LINEGOLD, flexShrink: 0 }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "1.4px", color: LBL }}>{c.label}</span>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: "#4f4940" }}>{c.text}</div>
          </div>
        ))}
      </div>
      )}
      </XrayScaler>
    </section>
  );
}
