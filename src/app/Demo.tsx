"use client";

// ROI Labs — handhold.io-inspired demo landing (white modern-SaaS, yellow/amber
// gradient accent, floating orbs). Scoped under .hhd. Separate from the live
// Aurora homepage — this is a design exploration at /demo.

import { useState } from "react";

function Svg({ p, w = 26, stroke = "currentColor" }: { p: string; w?: number; stroke?: string }) {
  return (
    <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: p }} />
  );
}

// rotating hero orbit — node centers on a 460x460 viewBox (radius 185)
const MAG = '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>';
const SPARK = '<path d="m12 2 2.4 7.4H22l-6 4.5 2.3 7.1L12 16.7 5.7 21l2.3-7.1-6-4.5h7.6z"/>';
const BOLT = '<path d="M3 12h4l3 8 4-16 3 8h4"/>';
const CHART = '<path d="M3 3v18h18"/><path d="m7 14 3-3 3 3 5-6"/>';
const FRAME = '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/>';
const TARGET = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>';
const ORBIT = [
  { x: 230, y: 45, ic: MAG, yellow: true },
  { x: 390, y: 137, ic: SPARK },
  { x: 390, y: 323, ic: BOLT, yellow: true },
  { x: 230, y: 415, ic: CHART },
  { x: 70, y: 323, ic: FRAME, yellow: true },
  { x: 70, y: 137, ic: TARGET },
];

const USES = [
  { icon: '<path d="m12 2 2.4 7.4H22l-6 4.5 2.3 7.1L12 16.7 5.7 21l2.3-7.1-6-4.5h7.6z"/>', t: "Creative engine", d: "Static, motion, and UGC shipped weekly and tested at the asset level — the volume no in-house team can match." },
  { icon: '<path d="M3 12h4l3 8 4-16 3 8h4"/>', t: "Media buying", d: "Meta & Google run end-to-end: structure, bids, and budget moved to winners daily, kept on a revenue leash." },
  { icon: '<path d="M3 3v18h18"/><path d="m7 14 3-3 3 3 5-6"/>', t: "Measurement", d: "GA4, server-side tracking, and attribution that ties every dollar of spend back to revenue — not ROAS." },
];

const STEPS = [
  { n: "1", t: "Audit your account", d: "We score your Meta & Google, creative, and tracking, then map the highest-leverage fixes." },
  { n: "2", t: "Spin up the engine", d: "AI builds and launches creative across both platforms with attribution wired from day one." },
  { n: "3", t: "Compound the wins", d: "Daily optimization, weekly senior review, and reporting on revenue and CAC — angles compound." },
];

const FEATS = [
  { icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', t: "Always-on optimization", d: "AI manages bids, pacing, and creative rotation every day — not just when a human logs in." },
  { icon: '<path d="M16 11a4 4 0 1 0-8 0"/><path d="M2 21a8 8 0 0 1 16 0"/><circle cx="12" cy="7" r="0"/>', t: "Senior-led judgment", d: "The people who pitched you own the strategy and approve everything before a dollar goes live." },
  { icon: '<path d="M12 2v20M2 12h20"/>', t: "Revenue reporting", d: "MER, CAC, and contribution margin in plain English — the numbers on your P&L, weekly." },
];

const TESTI = [
  { q: "They ship more tested creative in a week than our last agency did in a quarter — and CAC actually moved.", n: "Priya M.", r: "Head of Growth, DTC", a: "P" },
  { q: "Finally an agency that reports on revenue, not a dashboard. The senior team is genuinely in the account.", n: "Daniel R.", r: "Founder, Ecommerce", a: "D" },
  { q: "Live in under two weeks, attribution clean from day one. The audit alone was worth the call.", n: "Sara K.", r: "VP Marketing, B2B SaaS", a: "S" },
];

const FAQS = [
  { q: "Is the creative actually AI, or real?", a: "AI does the research, drafts, and variants at scale; senior operators review, refine, and approve everything before launch — and we disclose AI-generated creative per platform policy." },
  { q: "How fast can we go live?", a: "Typically under two weeks from audit to first live campaign — the engine spins up your first creative batch in days, not a month-long deck." },
  { q: "What do you report on?", a: "Revenue, CAC, MER, and contribution margin — the numbers on your P&L — with a weekly read on what's working and what's next." },
  { q: "What does it cost?", a: "Transparent and scoped to your spend, with no per-seat tool fees. We start with an audit; if we're a fit, the fee is credited to the engagement." },
];

export default function Demo() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="hhd" id="top">
      <nav>
        <div className="wrap nv">
          <a href="#top" className="brand">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/roi-logo-dark.png" alt="ROI Labs" /></a>
          <div className="nv-links"><a href="#uses">Product</a><a href="#how">How it works</a><a href="#faq">FAQ</a><a href="/">Live site</a></div>
          <div className="nv-right"><a href="https://calendly.com/mohnish-nagar-roilabs/30min" target="_blank" rel="noopener noreferrer" className="link">Sign in</a><a href="https://calendly.com/mohnish-nagar-roilabs/30min" target="_blank" rel="noopener noreferrer" className="btn btn-pri">Get started</a></div>
        </div>
      </nav>

      <section className="hero two">
        <div className="wrap hero-2col">
          <div className="hero-l">
            <span className="ann"><span className="tag">New</span> AI-run paid media, measured in revenue</span>
            <h1>A dedicated growth team for <span className="g">every brand</span>.</h1>
            <p className="sub">AI runs your Meta &amp; Google around the clock — senior operators own the strategy, and everything is measured in revenue, not ROAS.</p>
            <div className="cta-row">
              <a href="https://calendly.com/mohnish-nagar-roilabs/30min" target="_blank" rel="noopener noreferrer" className="btn btn-pri btn-lg">Book your audit →</a>
              <a href="#how" className="btn btn-gh btn-lg">See how it works</a>
            </div>
          </div>
          <div className="hero-r">
            <span className="ringorb"></span>
            <div className="rorbit">
              <div className="rring"></div>
              <div className="rspin">
                <svg viewBox="0 0 460 460" fill="none">
                  {ORBIT.map((n, i) => (
                    <line key={i} x1="230" y1="230" x2={n.x} y2={n.y} stroke="#E3E6EC" strokeWidth="1.5" />
                  ))}
                </svg>
                {ORBIT.map((n, i) => (
                  <div key={i} className={"rnode" + (n.yellow ? " y" : "")} style={{ left: (n.x / 460 * 100) + "%", top: (n.y / 460 * 100) + "%" }}>
                    <div className="ic"><Svg p={n.ic} w={26} /></div>
                  </div>
                ))}
              </div>
              <div className="rhub"><Svg p={SPARK} w={46} stroke="#FACC15" /></div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="quote">
            <p className="q">&ldquo;We replaced five tools and a junior buyer with one accountable team — and the only metric that changed was the one that mattered.&rdquo;</p>
            <div className="by"><span className="avatar">M</span><div style={{ textAlign: "left" }}><div className="nm">Mara V.</div><div className="rl">CMO, Subscription</div></div></div>
          </div>
        </div>
      </section>

      <section id="uses">
        <div className="wrap">
          <div className="center"><p className="ey">One system</p><h2>Three engines, run as one.</h2><p className="lead">Creative, media, and measurement — powered by AI, owned by senior operators.</p></div>
          <div className="uses">
            {USES.map((u) => (
              <div className="uc" key={u.t}>
                <div className="top"><Svg p={u.icon} w={30} stroke="#fff" /></div>
                <div className="body"><h3>{u.t}</h3><p>{u.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how">
        <div className="wrap">
          <div className="center"><p className="ey">How it works</p><h2>From audit to live in days.</h2></div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}><div className="stepn">{s.n}</div><h3>{s.t}</h3><p>{s.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="feat-sec">
        <div className="wrap">
          <div className="center"><p className="ey">Why it works</p><h2>A team that never logs off.</h2></div>
          <div className="feats">
            {FEATS.map((f) => (
              <div className="ft" key={f.t}><div className="ic"><Svg p={f.icon} w={22} /></div><h3>{f.t}</h3><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="center"><p className="ey">Loved by operators</p><h2>Results people talk about.</h2></div>
          <div className="tgrid">
            {TESTI.map((t) => (
              <div className="tcard" key={t.n}><p>&ldquo;{t.q}&rdquo;</p><div className="by"><span className="avatar">{t.a}</span><div style={{ textAlign: "left" }}><div className="nm">{t.n}</div><div className="rl">{t.r}</div></div></div></div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="wrap">
          <div className="center"><p className="ey">FAQ</p><h2>Good questions.</h2></div>
          <div className="faqwrap">
            {FAQS.map((f, i) => (
              <div className="fitem" key={i}>
                <button className="fq" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  {f.q}<span className="ic">+</span>
                </button>
                <div className={"fa" + (open === i ? " open" : "")}><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="cta">
            <span className="orb a"></span>
            <h2>Give your paid media a dedicated team.</h2>
            <p>Start with a free audit — an honest read on your Meta &amp; Google, your creative, and your tracking.</p>
            <div className="cta-row"><a href="https://calendly.com/mohnish-nagar-roilabs/30min" target="_blank" rel="noopener noreferrer" className="btn btn-pri btn-lg">Book your audit →</a><a href="/audit" className="btn btn-gh btn-lg" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>Run a free audit</a></div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="fgrid">
            <div className="fbr">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/roi-logo-dark.png" alt="ROI Labs" /><p>AI-native paid media for growth brands on Meta &amp; Google. Measured in revenue.</p></div>
            <div className="fcol"><h5>Product</h5><a href="#uses">Creative</a><a href="#uses">Media</a><a href="#uses">Measurement</a></div>
            <div className="fcol"><h5>Company</h5><a href="/">Live site</a><a href="/audit">Free audit</a><a href="https://calendly.com/mohnish-nagar-roilabs/30min" target="_blank" rel="noopener noreferrer">Contact</a></div>
            <div className="fcol"><h5>Get in touch</h5><a href="mailto:support@roilabs.in">support@roilabs.in</a></div>
          </div>
          <div className="fbar"><span>© 2026 ROI Labs — demo design.</span><span><a href="/" style={{ color: "var(--y-text)", fontWeight: 600 }}>← Back to roilabs.in</a></span></div>
        </div>
      </footer>
    </div>
  );
}
