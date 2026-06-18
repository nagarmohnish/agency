// VARIANT 2 — REASONING TRACE / INSPECTOR
// "See why every ad was created" rendered as an audit log: a tall inspector card
// shows one finished ad (creative thumbnail + APPROVED pill) on top, then a vertical
// numbered trace of the 5 reasoning steps connected by a glowing gold line, with a
// pulse dot travelling down the line. Pure CSS/SVG animation — runs with JS disabled.
// Every class + @keyframes is prefixed "v2" to avoid collisions with sibling variants.

import type React from "react";

const GOLD = "#FACC15";
const SERIF = "var(--font-serif), 'Instrument Serif', Georgia, serif";
const SANS = "var(--font-manrope), var(--font-sora), system-ui, sans-serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

type Step = { n: string; title: string; detail: string };

const STEPS: Step[] = [
  { n: "01", title: "Product insight", detail: "Niacinamide barrier serum — fragrance-free, repurchase rate 41%." },
  { n: "02", title: "Customer angle", detail: "Sensitive-skin buyers who distrust loud claims; want calm proof." },
  { n: "03", title: "Source data", detail: "1,284 reviews + persona set + 6 weeks of ad performance." },
  { n: "04", title: "Creative pattern", detail: "Quiet hero shot, one line of copy, no model — trust over hype." },
  { n: "05", title: "Performance hypothesis", detail: "Restraint lifts CTR with high-intent skin audiences. Testing now." },
];

const INPUTS = ["Product", "Personas", "Reviews", "Ad performance"];

// vertical line geometry: circles are 44px, rows are evenly spaced.
const ROW_GAP = 30;
const ROW_H = 64;

export default function Variant2() {
  return (
    <section
      style={{
        minHeight: 720,
        background: "radial-gradient(120% 110% at 70% 20%, #19130b 0%, #0b0907 55%, #070605 100%)",
        color: "#fff",
        fontFamily: SANS,
        display: "flex",
        alignItems: "center",
        padding: "96px 40px",
        WebkitFontSmoothing: "antialiased",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes v2rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes v2steprise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes v2thumb { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
        @keyframes v2badge { 0%,42% { opacity: 0; transform: scale(.7); } 62% { opacity: 1; transform: scale(1.08); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes v2linegrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes v2dot {
          0%   { top: 0; opacity: 0; }
          6%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes v2ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(250,204,21,.0), 0 0 0 0 rgba(250,204,21,.0); }
          50%      { box-shadow: 0 0 0 3px rgba(250,204,21,.12), 0 0 18px rgba(250,204,21,.35); }
        }
        @keyframes v2shine { 0% { transform: translateX(-120%) skewX(-18deg); } 60%,100% { transform: translateX(220%) skewX(-18deg); } }
        @keyframes v2cardglow { 0%,100% { box-shadow: 0 40px 90px -40px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.05); } 50% { box-shadow: 0 40px 100px -38px rgba(0,0,0,.8), 0 0 60px -20px rgba(250,204,21,.18), 0 0 0 1px rgba(250,204,21,.10); } }
        @keyframes v2caret { 0%,100% { opacity: .25; } 50% { opacity: 1; } }

        .v2rise { animation: v2rise .75s cubic-bezier(.2,.7,.2,1) both; }
        .v2chip { animation: v2rise .6s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "0.86fr 1.14fr",
          gap: 72,
          alignItems: "center",
        }}
      >
        {/* ── LEFT: headline block ─────────────────────────────────── */}
        <div>
          <div
            className="v2rise"
            style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: "2.6px", color: "rgba(255,255,255,.42)", marginBottom: 26 }}
          >
            TRANSPARENT&nbsp;AI
          </div>

          <h1
            className="v2rise"
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 60,
              lineHeight: 1.03,
              letterSpacing: "-.5px",
              margin: 0,
              color: "#fff",
              animationDelay: ".05s",
            }}
          >
            See why every<br />
            <span style={{ fontStyle: "italic", color: GOLD }}>ad</span> was created
          </h1>

          <p
            className="v2rise"
            style={{
              fontSize: 17,
              lineHeight: 1.66,
              color: "rgba(255,255,255,.6)",
              maxWidth: 440,
              marginTop: 26,
              animationDelay: ".12s",
            }}
          >
            Open any creative and read its audit trail — product insight, customer angle,
            source data, creative pattern, and the performance hypothesis it&apos;s testing.
            Nothing is a black box.
          </p>

          {/* inputs the engine reads */}
          <div className="v2rise" style={{ marginTop: 38, animationDelay: ".2s" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "1.8px", color: "rgba(255,255,255,.4)", marginBottom: 14 }}>
              READS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {INPUTS.map((label, i) => (
                <span
                  key={label}
                  className="v2chip"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "rgba(255,255,255,.82)",
                    background: "rgba(255,255,255,.035)",
                    border: "1px solid rgba(255,255,255,.09)",
                    borderRadius: 999,
                    padding: "8px 14px",
                    animationDelay: `${0.28 + i * 0.07}s`,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: inspector card ────────────────────────────────── */}
        <div
          className="v2rise"
          style={{
            animationDelay: ".16s",
            borderRadius: 22,
            padding: 22,
            background: "linear-gradient(180deg, rgba(26,21,13,.72), rgba(12,10,8,.72))",
            border: "1px solid rgba(255,255,255,.08)",
            animation: "v2rise .75s cubic-bezier(.2,.7,.2,1) both, v2cardglow 5.5s ease-in-out infinite 1s",
            justifySelf: "center",
            width: 460,
          }}
        >
          {/* inspector title bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10.5, letterSpacing: "1.6px", color: "rgba(255,255,255,.5)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
              </svg>
              AD&nbsp;INSPECTOR
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1px", color: "rgba(255,255,255,.35)" }}>
              #AD-4127
            </span>
          </div>

          {/* creative thumbnail + name + approved pill */}
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              padding: 14,
              borderRadius: 16,
              background: "rgba(255,255,255,.035)",
              border: "1px solid rgba(255,255,255,.09)",
              marginBottom: 22,
              animation: "v2thumb .8s cubic-bezier(.2,.7,.2,1) both .25s",
            }}
          >
            {/* CSS-gradient creative thumbnail */}
            <div
              style={{
                position: "relative",
                width: 84,
                height: 84,
                flexShrink: 0,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.12)",
                background: "linear-gradient(150deg, #e6c79c 0%, #c98a72 55%, #7a4f5e 100%)",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 28% 18%, rgba(255,255,255,.45), transparent 55%)" }} />
              {/* sweep shine */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 28,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)",
                  animation: "v2shine 5s ease-in-out infinite 1.4s",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 10,
                  textAlign: "center",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  color: "#fff",
                  fontSize: 17,
                  textShadow: "0 1px 8px rgba(0,0,0,.45)",
                }}
              >
                Soft Glow
              </div>
            </div>

            {/* name + meta + approved */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 3 }}>Soft Glow — Feed</div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(255,255,255,.4)", marginBottom: 11 }}>
                1080 × 1080 · v3
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: MONO,
                  fontSize: 9.5,
                  letterSpacing: ".6px",
                  fontWeight: 700,
                  color: "#0a2e1c",
                  background: "#34D399",
                  padding: "4px 9px",
                  borderRadius: 999,
                  animation: "v2badge 4s ease-in-out infinite",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a2e1c" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                APPROVED
              </span>
            </div>
          </div>

          {/* trace label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1.8px", color: "rgba(255,255,255,.42)" }}>REASONING&nbsp;TRACE</span>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(255,255,255,.12), transparent)" }} />
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1px", color: GOLD, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, animation: "v2caret 1.6s ease-in-out infinite" }} />
              5&nbsp;STEPS
            </span>
          </div>

          {/* vertical numbered trace */}
          <div style={{ position: "relative", paddingLeft: 8 }}>
            {/* connecting vertical line (behind circles) */}
            <div
              style={{
                position: "absolute",
                left: 8 + 22, // align to circle centers (paddingLeft + half circle)
                top: 22,
                bottom: 22,
                width: 2,
                transform: "translateX(-1px)",
                background: "rgba(255,255,255,.10)",
                borderRadius: 2,
              }}
            >
              {/* gold gradient overlay that grows in */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 2,
                  transformOrigin: "top",
                  background: `linear-gradient(180deg, ${GOLD}, rgba(250,204,21,.35))`,
                  boxShadow: `0 0 10px rgba(250,204,21,.5)`,
                  animation: "v2linegrow 1.4s cubic-bezier(.4,0,.2,1) both .35s",
                }}
              />
              {/* travelling pulse dot */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  marginLeft: -5,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: GOLD,
                  boxShadow: `0 0 12px ${GOLD}, 0 0 24px rgba(250,204,21,.6)`,
                  animation: "v2dot 4.2s cubic-bezier(.55,0,.45,1) infinite 1.6s",
                }}
              />
            </div>

            {/* step rows */}
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                style={{
                  position: "relative",
                  display: "flex",
                  gap: 16,
                  minHeight: ROW_H,
                  marginBottom: i === STEPS.length - 1 ? 0 : ROW_GAP,
                  animation: "v2steprise .65s cubic-bezier(.2,.7,.2,1) both",
                  animationDelay: `${0.45 + i * 0.16}s`,
                }}
              >
                {/* gold-ringed step number circle */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    flexShrink: 0,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(17,13,8,.96)",
                    border: `1.5px solid rgba(250,204,21,.55)`,
                    color: GOLD,
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: ".5px",
                    animation: "v2ring 4.2s ease-in-out infinite",
                    animationDelay: `${1.6 + i * 0.4}s`,
                  }}
                >
                  {s.n}
                </div>

                {/* step body */}
                <div style={{ paddingTop: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "1.4px", color: "rgba(255,255,255,.38)" }}>
                      STEP&nbsp;{s.n}
                    </span>
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 600, color: "#fff", marginTop: 2, lineHeight: 1.2 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,.55)", marginTop: 4, maxWidth: 300 }}>
                    {s.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* footer verdict */}
          <div
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1px", color: "rgba(255,255,255,.4)" }}>
              TRACE&nbsp;COMPLETE
            </span>
            <span style={{ fontSize: 12.5, fontStyle: "italic", fontFamily: SERIF, color: "rgba(255,255,255,.72)" }}>
              Nothing is a black box.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
