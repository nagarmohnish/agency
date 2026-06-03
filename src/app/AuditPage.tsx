"use client";

// ROI Labs Auditor — the real tool's form (target URL / email / vertical / up to
// 3 competitors -> branded PDF), re-themed to the site's warm-cream + yellow
// Aurora look, with explainer sections below. Submits to the shared /api/leads
// endpoint (source: "audit").

import { useState } from "react";

const VERTICALS = ["DTC / ecommerce", "B2B / SaaS", "Lead-gen", "Other"];

function Ico({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <g dangerouslySetInnerHTML={{ __html: d }} />
    </svg>
  );
}

const AREAS = [
  { t: "Tracking stack", d: "GA4, the pixel, CAPI, server-side — can you even measure what's working?", g: '<path d="M3 3v18h18"/><path d="m7 14 3-3 3 3 5-6"/>' },
  { t: "Channel presence", d: "How you show up across Meta & Google, and where the gaps are.", g: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>' },
  { t: "Landing pages", d: "Speed, mobile UX, and message match for the traffic you pay for.", g: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/>' },
  { t: "Creative", d: "Volume, formats, hooks, and fatigue — the lever that moves CPMs now.", g: '<path d="m12 2 2.4 7.4H22l-6 4.5 2.3 7.1L12 16.7 5.7 21l2.3-7.1-6-4.5h7.6z"/>' },
];

const SCORES: [string, number][] = [
  ["Tracking stack", 82],
  ["Channel presence", 71],
  ["Landing pages", 64],
  ["Creative", 88],
];

const STEPS = [
  { n: "01", t: "Paste your site", d: "Drop your domain and email — no account, no setup." },
  { n: "02", t: "We score public signals", d: "We read your Meta & Google footprint, your pages, and your competitors' ad libraries." },
  { n: "03", t: "Get your branded PDF", d: "A graded report lands in your inbox with the highest-leverage fixes." },
];

export default function AuditPage() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [vertical, setVertical] = useState(VERTICALS[0]);
  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");
  const [c3, setC3] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !re.test(email.trim())) {
      setErr("Add your site and a valid email to run the audit.");
      return;
    }
    setErr("");
    const competitors = [c1, c2, c3].map((c) => c.trim()).filter(Boolean);
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: url.trim(),
        email: email.trim(),
        company: url.trim(),
        message: `Audit request — vertical: ${vertical}${competitors.length ? "; competitors: " + competitors.join(", ") : ""}`,
        source: "audit",
      }),
    }).catch(() => {});
    setSent(true);
  };

  return (
    <div className="aurora" id="top">
      <div className="navwrap">
        <nav>
          <div className="nv">
            <a href="/" className="brand">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/roi-logo-light.png" alt="ROI Labs" /></a>
            <div className="nv-links"><a href="/">Home</a><a href="/#process">How it works</a><a href="/#plans">Plans</a></div>
            <a href="/#contact" className="btn btn-pri">Talk to us</a>
          </div>
        </nav>
      </div>

      <section id="run" style={{ padding: "70px 0 80px" }}>
        <div className="wrap" style={{ maxWidth: "1000px" }}>
          <p className="ey">ROI Labs · Free audit</p>
          <h1 style={{ fontSize: "clamp(34px,5vw,56px)", margin: "16px 0 0", maxWidth: "20ch" }}>
            Paid media, measured in <span className="grad">revenue.</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "18px", lineHeight: 1.6, maxWidth: "60ch", marginTop: "18px" }}>
            Paste your site. We score four pillars of paid-media readiness from public signals — tracking stack, channel
            presence, landing pages, creative — and email you a branded PDF.
          </p>

          <div className="aud-card">
            {sent ? (
              <div className="aud-done">
                <div className="aud-tick">✓</div>
                <h3>Your audit is on the way.</h3>
                <p>We&apos;ll email a branded PDF to <strong>{email}</strong> shortly — and may follow up with one short note. No spam.</p>
                <a href="/" className="btn btn-gh">← Back to roilabs.in</a>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="aud-grid">
                  <div className="afield">
                    <label htmlFor="a-url">Target URL</label>
                    <input id="a-url" type="text" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                  </div>
                  <div className="afield">
                    <label htmlFor="a-email">Email</label>
                    <input id="a-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="afield">
                  <label htmlFor="a-vert">Vertical</label>
                  <select id="a-vert" value={vertical} onChange={(e) => setVertical(e.target.value)} className="cursor-pointer">
                    {VERTICALS.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="afield">
                  <label>Competitors (optional, up to 3)</label>
                  <div className="aud-comp">
                    <input type="text" placeholder="https://competitor-1.com" value={c1} onChange={(e) => setC1(e.target.value)} />
                    <input type="text" placeholder="https://competitor-2.com" value={c2} onChange={(e) => setC2(e.target.value)} />
                    <input type="text" placeholder="https://competitor-3.com" value={c3} onChange={(e) => setC3(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="btn btn-pri btn-lg">Run audit →</button>
                {err && <p className="aud-err">{err}</p>}
                <p className="aud-disc">We&apos;ll email you a PDF and may follow up with one short note. No spam. Unsubscribe anytime.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="ey">Your report</p>
            <h2>An honest grade, <span className="grad">backed by data.</span></h2>
            <p>Four pillars decide whether paid media works. The audit scores each from public signals and shows exactly where you&apos;re leaking money.</p>
          </div>
          <div className="auditgrid">
            <div className="cards3" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 0 }}>
              {AREAS.map((a) => (
                <div className="pcard" key={a.t}>
                  <div style={{ color: "var(--gold-text)" }}><Ico d={a.g} /></div>
                  <h3 style={{ marginTop: "12px" }}>{a.t}</h3>
                  <p>{a.d}</p>
                </div>
              ))}
            </div>
            <div className="mock">
              <div className="bar"><i></i><i></i><i></i><span className="fav"></span><span className="url">audit.roilabs.in/report</span></div>
              <div className="mbody">
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
                  <div className="grade">B+</div>
                  <div>
                    <div className="mt"><span className="livedot"></span>Overall grade</div>
                    <div style={{ fontFamily: "var(--disp)", fontWeight: 700, fontSize: "18px", color: "var(--ink)", marginTop: "4px" }}>Strong, with quick wins</div>
                  </div>
                </div>
                <div className="scorelist">
                  {SCORES.map(([label, val]) => (
                    <div className="scorerow" key={label}>
                      <span>{label}</span>
                      <div className="track"><span style={{ width: val + "%" }}></span></div>
                      <span className="pct">{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "16px" }}>
                  <div className="listrow"><span>Competitor teardown</span><span className="pb">up to 3</span></div>
                  <div className="listrow"><span><b>ROI-Labs-Audit.pdf</b></span><span className="pb">✓ Emailed</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head"><p className="ey">How it works</p><h2>From URL to PDF in <span className="grad">minutes.</span></h2></div>
          <div className="cards3">
            {STEPS.map((s) => (
              <div className="pcard" key={s.n}><div className="n">{s.n}</div><h3>{s.t}</h3><p>{s.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="audit">
            <p className="ey" style={{ color: "var(--yellow)" }}>Free audit</p>
            <h2>Ready to see your grade?</h2>
            <p>Run the auditor and get your branded PDF — tracking stack, channel presence, landing pages, creative, and a competitor teardown.</p>
            <div style={{ marginTop: "24px" }}><a href="#run" className="btn btn-pri btn-lg">Run your audit ↑</a></div>
            <p className="fine">Free · no commitment.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="fbar2" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
            <span>© 2026 ROI Labs — AI-native paid media.</span>
            <span><a href="/" style={{ color: "var(--gold-text)", fontWeight: 600 }}>← Back to roilabs.in</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
