"use client";

// ROI Labs homepage — Aurora Light system (warm cream + brand yellow), with
// content/structure inspired by proof-forward SaaS landing pages: two-tone
// hero, stat band, a detailed numbered "how it works" with product mockups,
// case-study results, a dark audit band, two plans, and an FAQ. All markup is
// rendered verbatim inside the scoped `.aurora` wrapper; motion, the FAQ
// accordion, and the audit/contact forms (-> /api/leads) run in one effect.

import { useEffect, useRef } from "react";

const CHK = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>`;
const SVG = (p: string) => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I_SEARCH = SVG(`<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>`);
const I_CHART = SVG(`<path d="M3 3v18h18"/><path d="m7 14 3-3 3 3 5-6"/>`);
const I_TARGET = SVG(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>`);
const I_GEAR = SVG(`<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/>`);
const I_SPARK = SVG(`<path d="m12 2 2.4 7.4H22l-6 4.5 2.3 7.1L12 16.7 5.7 21l2.3-7.1-6-4.5h7.6z"/>`);
const I_BOLT = SVG(`<path d="M3 12h4l3 8 4-16 3 8h4"/>`);
const I_FRAME = SVG(`<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/>`);
const I_REFRESH = SVG(`<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>`);
const I_DOC = SVG(`<path d="M14 3v5h5"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>`);

const META = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>`;
const GOOGLE = `<svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"/></svg>`;
const LINKEDIN = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
const XICON = `<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
const SF = (icon: string, t: string, d: string) =>
  `<div class="sf"><div class="t"><span class="i">${icon}</span>${t}</div><p>${d}</p></div>`;

// Prefix assets with the deploy base path so raw <img> srcs resolve on
// subpath hosts like GitHub Pages (/agency). Empty string on Vercel/apex.
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const HTML = `
<div class="navwrap">
  <nav>
    <div class="nv">
      <a href="#top" class="brand"><img src="${BP}/roi-logo-dark.png" alt="ROI Labs" /></a>
      <div class="nv-links"><a href="#process">How it works</a><a href="#system">The system</a><a href="/audit">Free audit</a><a href="#plans">Plans</a><a href="#faq">FAQ</a></div>
      <a href="#contact" class="btn btn-pri">Book your audit</a>
    </div>
  </nav>
</div>

<section class="hero">
  <div class="wrap">
    <p class="ey" data-reveal>AI-native paid media agency</p>
    <h1 data-reveal data-delay="80">Paid media, measured in revenue.<span class="l2"><span class="grad">Scaled by AI.</span></span></h1>
    <p class="l" data-reveal data-delay="140">ROI Labs runs an AI-native engine that researches, produces, launches, and optimizes — until spend tracks to revenue, not ROAS.</p>
    <div class="hero-cta" data-reveal data-delay="240">
      <a href="#contact" class="btn btn-pri btn-lg">Book your audit →</a>
      <a href="#process" class="btn btn-gh btn-lg">See how it works</a>
    </div>
    <div class="agencyline" data-reveal>
      <p class="q">Running an agency?</p>
      <p class="a">We white-label the whole engine for your clients. <a href="#plans">See agency plans →</a></p>
    </div>
  </div>
</section>

<section style="padding-top:10px;">
  <div class="wrap">
    <div class="broken" data-reveal>
      <p class="ey">Why AI-native</p>
      <h2>The agency model is broken. <span class="grad">We thought so too.</span></h2>
      <p>Most shops ship ten ads a month, hand your account to a junior buyer, and report on metrics that never reach your P&amp;L. AI changed what's possible — so we built the agency around it. Agents produce and test creative at a volume no human team can match; senior operators own the strategy and the one number that pays the bills.</p>
    </div>
  </div>
</section>

<section id="system">
  <div class="wrap">
    <div class="sec-head" data-reveal>
      <p class="ey">The system</p>
      <h2>A senior team at the core. <span class="grad">Five agents</span> in orbit.</h2>
      <p>Five agents run the work in the background. Senior operators own the strategy and sign off on everything that ships.</p>
    </div>
    <div class="orbit-wrap" data-reveal>
      <div class="orbit">
        <div class="ring r1"></div><div class="ring r2"></div>
        <div class="sweep"><span class="comet"></span></div>
        <svg viewBox="0 0 500 500" fill="none">
          <line x1="250" y1="250" x2="250" y2="50" stroke="rgba(250,204,21,.45)"/>
          <line x1="250" y1="250" x2="440" y2="188" stroke="rgba(250,204,21,.45)"/>
          <line x1="250" y1="250" x2="368" y2="412" stroke="rgba(250,204,21,.45)"/>
          <line x1="250" y1="250" x2="132" y2="412" stroke="rgba(250,204,21,.45)"/>
          <line x1="250" y1="250" x2="60" y2="188" stroke="rgba(250,204,21,.45)"/>
        </svg>
        <div class="node nt" style="left:250px;top:50px;"><div class="bubble">${I_SEARCH}</div><div class="label"><div class="nm">Scout</div><div class="rl">Research</div></div></div>
        <div class="node nt" style="left:440px;top:188px;"><div class="bubble">${I_SPARK}</div><div class="label"><div class="nm">Forge</div><div class="rl">Creative</div></div></div>
        <div class="node" style="left:368px;top:412px;"><div class="bubble">${I_BOLT}</div><div class="label"><div class="nm">Pilot</div><div class="rl">Media buying</div></div></div>
        <div class="node" style="left:132px;top:412px;"><div class="bubble">${I_FRAME}</div><div class="label"><div class="nm">Frame</div><div class="rl">Landing/CRO</div></div></div>
        <div class="node nt" style="left:60px;top:188px;"><div class="bubble">${I_CHART}</div><div class="label"><div class="nm">Signal</div><div class="rl">Measurement</div></div></div>
        <div class="core"><div class="pulse"></div><div><div class="ttl">ROI Core</div><div class="sub">Senior Ops</div></div></div>
      </div>
      <div class="alist">
        <div class="arow" data-reveal><div class="ic">${I_SEARCH}</div><div><div class="nm">Scout</div><div class="rl">Research &amp; Intelligence</div><div class="dc">Tears down competitor ad libraries, maps audiences, finds angles worth testing.</div></div><div class="mt"><div class="v">[500+]</div><div class="k">accounts</div></div></div>
        <div class="arow" data-reveal><div class="ic">${I_SPARK}</div><div><div class="nm">Forge</div><div class="rl">Creative Engine</div><div class="dc">Static, motion, and UGC concepts and variants at volume, tested at the asset level.</div></div><div class="mt"><div class="v">[1,200+]</div><div class="k">variants/qtr</div></div></div>
        <div class="arow" data-reveal><div class="ic">${I_BOLT}</div><div><div class="nm">Pilot</div><div class="rl">Media Buying &amp; Optimization</div><div class="dc">Structures campaigns, paces budget, rotates creative across Meta and Google.</div></div><div class="mt"><div class="v">[$25M+]</div><div class="k">optimized</div></div></div>
        <div class="arow" data-reveal><div class="ic">${I_FRAME}</div><div><div class="nm">Frame</div><div class="rl">Landing Pages &amp; CRO</div><div class="dc">Fast, mobile-first landing pages for ad traffic, A/B tested continuously.</div></div><div class="mt"><div class="v">[300+]</div><div class="k">pages</div></div></div>
        <div class="arow" data-reveal><div class="ic">${I_CHART}</div><div><div class="nm">Signal</div><div class="rl">Measurement &amp; Attribution</div><div class="dc">GA4, server-side tracking, and attribution that ties every dollar to revenue.</div></div><div class="mt"><div class="v">[40+]</div><div class="k">brands</div></div></div>
      </div>
    </div>
    <p class="disclaim" data-reveal>This isn't AI spam. Agents do the research, drafts, and optimization at scale. <b>Senior humans review, refine, and approve everything before a dollar goes live.</b></p>
  </div>
</section>

<section id="process">
  <div class="wrap">
    <div class="sec-head" data-reveal>
      <p class="ey">How it works</p>
      <h2>An engine, not a <span class="grad">campaign.</span></h2>
      <p>Senior operators handle the highest-leverage work first; agents run the volume underneath. Here's the loop that turns spend into revenue.</p>
    </div>
    <div class="hiw">

      <div class="step" data-reveal>
        <div class="txt">
          <div class="stepn">1</div>
          <h3>Audit &amp; opportunity</h3>
          <p class="sd">We tear down your Meta and Google accounts, creative, and tracking, then map where the money's leaking and the upside that's left on the table.</p>
          <div class="subfeat">
            ${SF(I_SEARCH, "Account teardown", "Structure, spend, and creative reviewed against what's working in your category.")}
            ${SF(I_TARGET, "Opportunity map", "The highest-leverage fixes and angles, ranked by impact on CAC and revenue.")}
            ${SF(I_DOC, "Competitor library", "What your competitors are running — and the gaps you can win.")}
            ${SF(I_GEAR, "Engine setup", "We configure the agent stack around your business, margins, and goals.")}
          </div>
        </div>
        <div class="visual">
          <div class="mock">
            <div class="bar"><i></i><i></i><i></i><span class="fav"></span><span class="url">roilabs.in/audit</span></div>
            <div class="mbody">
              <div class="mt"><span class="livedot"></span>Account opportunity</div>
              <div class="mrow">
                <div class="tile"><div class="tv g">31%</div><div class="tk">Spend at risk</div></div>
                <div class="tile"><div class="tv">6/mo</div><div class="tk">Creatives shipped</div></div>
                <div class="tile"><div class="tv">$74</div><div class="tk">Current CAC</div></div>
              </div>
              <div class="spark"><svg viewBox="0 0 300 72" preserveAspectRatio="none"><polyline points="0,58 40,52 80,55 120,40 160,42 200,28 240,22 300,10" fill="none" stroke="#FACC15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            </div>
          </div>
        </div>
      </div>

      <div class="step rev" data-reveal>
        <div class="txt">
          <div class="stepn">2</div>
          <h3>Creative at volume</h3>
          <p class="sd">Targeting is automated — creative is the lever. Forge produces static, motion, and UGC concepts at a volume no studio can match, tested at the asset level.</p>
          <div class="subfeat">
            ${SF(I_SPARK, "Always-on engine", "Fresh static, motion, and UGC shipped every week, not once a month.")}
            ${SF(I_TARGET, "Asset-level testing", "Every hook, format, and angle tested on its own merits — winners scale.")}
            ${SF(I_FRAME, "On-brand at scale", "A brand system keeps volume on-brand, not off the rails.")}
            ${SF(I_REFRESH, "Beat fatigue", "New angles in rotation before CPMs climb.")}
          </div>
        </div>
        <div class="visual">
          <div class="mock">
            <div class="bar"><i></i><i></i><i></i><span class="fav"></span><span class="url">roilabs.in/creative</span></div>
            <div class="mbody">
              <div class="mt"><span class="livedot"></span>Creative pipeline</div>
              <div class="listrow"><span><b>Hook A</b> · UGC 9:16</span><span class="pb">Scaled</span></div>
              <div class="listrow"><span><b>Static v7</b> · offer card</span><span class="pb">Testing</span></div>
              <div class="listrow"><span><b>Demo cut</b> · 15s motion</span><span class="pb">Shipped</span></div>
              <div class="listrow"><span><b>Testimonial</b> · UGC</span><span class="pb">Queued</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="step" data-reveal>
        <div class="txt">
          <div class="stepn">3</div>
          <h3>Launch across Meta &amp; Google</h3>
          <p class="sd">Campaigns go live with proper structure and attribution from day one — Pilot manages bids and budget while Frame ships the landing pages traffic actually converts on.</p>
          <div class="subfeat">
            ${SF(I_BOLT, "Proper structure", "Clean account architecture across Meta and Google — no spaghetti.")}
            ${SF(I_TARGET, "Advantage+ / PMax", "Platform automation fed the right inputs, kept on a budget.")}
            ${SF(I_CHART, "Tracking from day one", "Pixel, CAPI, GA4, and server-side wired before launch.")}
            ${SF(I_FRAME, "Landing &amp; CRO", "Fast, mobile-first pages built for the click and A/B tested.")}
          </div>
        </div>
        <div class="visual">
          <div class="mock">
            <div class="bar"><i></i><i></i><i></i><span class="fav"></span><span class="url">roilabs.in/campaigns</span></div>
            <div class="mbody">
              <div class="mt"><span class="livedot"></span>Live campaigns</div>
              <div class="mrow">
                <div class="tile"><div class="tv" style="display:flex;align-items:center;gap:7px;font-size:15px">${META}Meta</div><div class="tk">Prospecting + retarget</div></div>
                <div class="tile"><div class="tv" style="display:flex;align-items:center;gap:7px;font-size:15px">${GOOGLE}Google</div><div class="tk">Search + PMax</div></div>
                <div class="tile"><div class="tv g">12</div><div class="tk">Live tests</div></div>
              </div>
              <div class="listrow"><span><b>Pixel &amp; CAPI</b></span><span class="pb">✓ Connected</span></div>
              <div class="listrow"><span><b>GA4 + server-side</b></span><span class="pb">✓ Connected</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="step rev" data-reveal>
        <div class="txt">
          <div class="stepn">4</div>
          <h3>Optimize until it works</h3>
          <p class="sd">Performance isn't solved on launch. Signal measures what's working, kills what isn't, and feeds Scout the next angle — daily by agents, weekly by senior operators.</p>
          <div class="subfeat">
            ${SF(I_REFRESH, "Daily optimization", "Bids, pacing, and creative rotation handled every day.")}
            ${SF(I_CHART, "Kill &amp; scale", "Losers cut fast; winners get budget. Decisions tied to revenue.")}
            ${SF(I_SEARCH, "Senior review", "Operators steer weekly — strategy stays human.")}
            ${SF(I_DOC, "Revenue reporting", "Weekly read on revenue and CAC, in plain English.")}
          </div>
        </div>
        <div class="visual">
          <div class="mock">
            <div class="bar"><i></i><i></i><i></i><span class="fav"></span><span class="url">roilabs.in/performance</span></div>
            <div class="mbody">
              <div class="mt"><span class="livedot"></span>What's working</div>
              <div class="mrow">
                <div class="tile"><div class="tv g">3.2x</div><div class="tk">ROAS</div></div>
                <div class="tile"><div class="tv g">−47%</div><div class="tk">CAC</div></div>
                <div class="tile"><div class="tv">$284K</div><div class="tk">Net new rev</div></div>
              </div>
              <div class="spark"><svg viewBox="0 0 300 72" preserveAspectRatio="none"><polyline points="0,60 40,55 80,48 120,50 160,36 200,30 240,18 300,8" fill="none" stroke="#FACC15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="audit" data-reveal>
      <p class="ey o" style="color:var(--yellow)">Free audit</p>
      <h2>How much is your paid media leaving on the table?</h2>
      <p>Drop your site and we'll send back an honest read on your Meta and Google accounts, your creative, and your tracking — plus the highest-leverage fixes.</p>
      <form class="auditform" id="auditForm" novalidate>
        <input id="auditUrl" type="text" placeholder="yourcompany.com" aria-label="Your website" />
        <button type="submit" class="btn btn-pri btn-lg">Run a free audit →</button>
      </form>
      <p class="fine">Free, no commitment. A clear read within 24 hours.</p>
      <p class="asent" id="auditSent">✓ Great — drop your email in the form below and we'll send your audit.</p>
    </div>
  </div>
</section>

<section id="plans">
  <div class="wrap">
    <div class="sec-head" data-reveal>
      <p class="ey">Plans</p>
      <h2>Two ways to <span class="grad">work with us.</span></h2>
      <p>Run your own paid media, or resell the whole engine to your clients.</p>
    </div>
    <div class="plans">
      <div class="plan" data-reveal>
        <h3>For Brands</h3>
        <p class="pd">For growth brands that want paid media run as one accountable system.</p>
        <ul>
          <li><span class="mk">${CHK}</span>Senior-led strategy + AI-run execution</li>
          <li><span class="mk">${CHK}</span>Meta &amp; Google managed end-to-end</li>
          <li><span class="mk">${CHK}</span>60+ creatives produced &amp; tested / month</li>
          <li><span class="mk">${CHK}</span>Landing pages &amp; CRO included</li>
          <li><span class="mk">${CHK}</span>Revenue &amp; CAC reporting, weekly</li>
        </ul>
        <a href="#contact" class="btn btn-pri">Book your audit →</a>
      </div>
      <div class="plan" data-reveal data-delay="80">
        <h3>For Agencies</h3>
        <p class="pd">For agencies that want to offer AI-run paid media under their own brand.</p>
        <ul>
          <li><span class="mk">${CHK}</span>White-label creative + media engine</li>
          <li><span class="mk">${CHK}</span>Client-ready reporting under your brand</li>
          <li><span class="mk">${CHK}</span>Manage multiple accounts in one place</li>
          <li><span class="mk">${CHK}</span>Recurring revenue, near-zero overhead</li>
          <li><span class="mk">${CHK}</span>Priority support</li>
        </ul>
        <a href="#contact" class="btn btn-gh">Talk to us →</a>
      </div>
    </div>
    <p class="plans-note">Not sure which fits? <a href="#contact">Start with an audit</a> — your fee is credited to the engagement.</p>
  </div>
</section>

<section id="faq">
  <div class="wrap">
    <div class="faqwrap">
      <div class="faqhead" data-reveal>
        <h2>FAQ</h2>
        <p>Everything you need to know about working with ROI Labs.</p>
      </div>
      <div class="faq" data-reveal>
        <div class="item"><button class="q" aria-expanded="false">What exactly does ROI Labs do?<span class="ic">+</span></button><div class="a"><p>We run your Meta and Google paid media end-to-end — strategy, creative production at volume, landing pages, launches, and optimization — as one accountable system, measured in revenue.</p></div></div>
        <div class="item"><button class="q" aria-expanded="false">Is the creative actually AI, or real?<span class="ic">+</span></button><div class="a"><p>Agents do the research, drafts, and variants at scale. Senior operators review, refine, and approve everything before a dollar goes live — and we disclose AI-generated creative per platform policy.</p></div></div>
        <div class="item"><button class="q" aria-expanded="false">How fast can we launch?<span class="ic">+</span></button><div class="a"><p>Typically under two weeks from audit to first live campaign — the engine spins up your first creative batch in days, not a month-long deck.</p></div></div>
        <div class="item"><button class="q" aria-expanded="false">What does it cost?<span class="ic">+</span></button><div class="a"><p>Transparent, scoped to your spend — no per-seat tool fees. We start with an audit; if we're a fit, the audit fee is credited to the engagement.</p></div></div>
        <div class="item"><button class="q" aria-expanded="false">Do you work with agencies?<span class="ic">+</span></button><div class="a"><p>Yes — we white-label the whole creative + media engine so you can offer AI-run paid media to your clients under your own brand. See the agency plan above.</p></div></div>
      </div>
    </div>
  </div>
</section>

<section id="contact">
  <div class="wrap">
    <div class="sec-head" data-reveal><p class="ey">Get started</p><h2>Ready to grow through <span class="grad">Meta &amp; Google?</span></h2></div>
    <div class="contact-wrap" data-reveal="scale">
      <div class="contact-l">
        <p class="ey o" style="color:var(--gold-text)">What's included</p>
        <h2>A clear read in 24 hours.</h2>
        <p>Tell us about your business and goals. You'll get an honest read on your Meta and Google accounts — and a shortlist of the highest-leverage fixes.</p>
        <ul class="incl">
          <li><span class="mk">${CHK}</span>AI audit of your current ad accounts</li>
          <li><span class="mk">${CHK}</span>Competitive ad-library teardown</li>
          <li><span class="mk">${CHK}</span>A custom creative + media plan</li>
          <li><span class="mk">${CHK}</span>Transparent pricing — no retainer pitch unless it fits</li>
        </ul>
        <p class="email">Or email us directly — <a href="mailto:support@roilabs.in">support@roilabs.in</a></p>
      </div>
      <div class="contact-r">
        <form id="cf" novalidate>
          <div class="f row">
            <div><label>Name</label><input id="c-name" type="text" placeholder="Your name" required /><div class="errm">Please enter your name.</div></div>
            <div><label>Email</label><input id="c-email" type="email" placeholder="you@company.com" required /><div class="errm">Enter a valid email.</div></div>
          </div>
          <div class="f row">
            <div><label>Company / website</label><input id="c-company" type="text" placeholder="company.com" /><div class="errm"></div></div>
            <div><label>Monthly budget</label><select id="c-budget" required><option value="" selected disabled>Select range</option><option>Under €5,000</option><option>€5,000 – €15,000</option><option>€15,000 – €50,000</option><option>€50,000+</option></select><div class="errm">Please pick a range.</div></div>
          </div>
          <div class="f"><label>Message</label><textarea id="c-msg" placeholder="Tell us about your goals…" required></textarea><div class="errm">Tell us a little about your goals.</div></div>
          <button type="submit" class="btn btn-pri btn-lg fbtn">Book your audit →</button>
          <div class="sent" id="sent">✓ Sent — we'll be in touch within 24 hours.</div>
        </form>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="fgrid">
      <div class="fbrand">
        <img src="${BP}/roi-logo-light.png" alt="ROI Labs" />
        <p class="ft">AI-native paid media for growth brands on Meta &amp; Google. Measured in revenue.</p>
        <div class="fsoc"><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${LINKEDIN}</a><a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">${XICON}</a></div>
      </div>
      <div class="fcol">
        <h5>Company</h5>
        <a href="#system">The system</a>
        <a href="#process">How it works</a>
        <a href="#plans">Plans</a>
      </div>
      <div class="fcol">
        <h5>Services</h5>
        <span class="fl">Paid media</span>
        <span class="fl">Creative engine</span>
        <span class="fl">Landing &amp; CRO</span>
        <span class="fl">Measurement</span>
      </div>
      <div class="fcol">
        <h5>Get in touch</h5>
        <a href="#contact">Book an audit</a>
        <a href="mailto:support@roilabs.in">support@roilabs.in</a>
      </div>
    </div>
    <div class="fbar2"><span>© 2026 ROI Labs. All rights reserved.</span><span>support@roilabs.in</span></div>
  </div>
</footer>

<div class="modal-ov" id="popup" role="dialog" aria-modal="true" aria-label="Book your audit">
  <div class="modal">
    <div class="mL">
      <button class="mClose" id="popupClose" type="button" aria-label="Close">${SVG('<path d="M5 5l14 14M19 5 5 19"/>')}</button>
      <h3>Put AI to work on your paid media.</h3>
      <p class="ms">Book an audit and see what AI-run paid media could do for your revenue.</p>
      <form id="pf" novalidate>
        <div class="mf"><label>First name</label><input id="p-name" type="text" placeholder="John" /></div>
        <div class="mf"><label>Work email</label><input id="p-email" type="email" placeholder="john@company.com" /></div>
        <div class="mf"><label>Company website</label><input id="p-site" type="text" placeholder="company.com" /></div>
        <button type="submit" class="mbtn">Book your audit</button>
        <div class="merr" id="p-err">Please enter your name and a valid work email.</div>
        <div class="msent" id="p-sent">✓ Got it — we'll be in touch within 24 hours.</div>
      </form>
    </div>
    <div class="mR">
      <h4>Join growth brands scaling on <span class="hl">Meta &amp; Google</span></h4>
      <p class="mrp">AI-run paid media, measured in revenue — not ROAS.</p>
      <div class="chips"><span>DTC</span><span>B2B SaaS</span><span>Ecommerce</span><span>Subscription</span><span>Marketplaces</span><span>Lead-gen</span></div>
    </div>
  </div>
</div>
`;

export default function AuroraHome() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const docEl = document.documentElement;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    docEl.classList.add("aurora-js");
    const offTimer = window.setTimeout(() => docEl.classList.add("aurora-reveal-off"), 1100);

    const nav = root.querySelector("nav");
    const navShadow = () => { if (nav) nav.classList.toggle("scrolled", window.scrollY > 8); };

    const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const revQ = reveals.slice();
    const inView = (el: HTMLElement, m: number) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      if (!r.height && !r.width) return false;
      return r.top < vh - (m || 0) * vh && r.bottom > 0;
    };
    const check = () => {
      for (let i = revQ.length - 1; i >= 0; i--) {
        const el = revQ[i];
        if (inView(el, 0.06)) {
          const d = parseInt(el.getAttribute("data-delay") || "0", 10);
          window.setTimeout(() => el.classList.add("in"), reduce ? 0 : d);
          revQ.splice(i, 1);
        }
      }
    };
    if (reduce) reveals.forEach((el) => el.classList.add("in"));
    let tick = false;
    const onScroll = () => {
      navShadow();
      if (!tick) { tick = true; requestAnimationFrame(() => { check(); tick = false; }); }
    };
    navShadow();
    check();
    const t1 = window.setTimeout(check, 120);
    const t2 = window.setTimeout(check, 400);

    // FAQ accordion (single-open)
    const qs = Array.from(root.querySelectorAll<HTMLButtonElement>(".faq .q"));
    const onQ = (e: Event) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const open = btn.getAttribute("aria-expanded") === "true";
      qs.forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const a = b.nextElementSibling as HTMLElement | null;
        if (a) a.classList.remove("open");
      });
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        const a = btn.nextElementSibling as HTMLElement | null;
        if (a) a.classList.add("open");
      }
    };
    qs.forEach((b) => b.addEventListener("click", onQ));

    // forms -> /api/leads
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const post = (payload: Record<string, string>) => {
      fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
    };
    const v = (id: string) => {
      const el = root.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("#" + id);
      return el ? el.value.trim() : "";
    };

    // contact form
    const cf = root.querySelector<HTMLFormElement>("#cf");
    const cSent = root.querySelector<HTMLElement>("#sent");
    const onContact = (e: Event) => {
      e.preventDefault();
      let ok = true;
      ([["c-name", (x: string) => !!x], ["c-email", (x: string) => re.test(x)], ["c-budget", (x: string) => !!x], ["c-msg", (x: string) => !!x]] as [string, (x: string) => boolean][])
        .forEach(([id, test]) => {
          const el = root.querySelector<HTMLElement>("#" + id);
          if (!el) return;
          const box = (el.closest(".f.row > div") || el.closest(".f")) as HTMLElement | null;
          const bad = !test(v(id));
          if (box) box.classList.toggle("err", bad);
          if (bad) ok = false;
        });
      if (!ok) return;
      post({ name: v("c-name"), email: v("c-email"), company: v("c-company"), budget: v("c-budget"), message: v("c-msg"), source: "aurora-home" });
      const btn = cf?.querySelector<HTMLElement>(".fbtn");
      if (btn) btn.style.display = "none";
      if (cSent) cSent.style.display = "block";
      cf?.reset();
    };
    const onContactInput = (e: Event) => {
      const box = ((e.target as HTMLElement).closest(".f.row > div") || (e.target as HTMLElement).closest(".f")) as HTMLElement | null;
      if (box) box.classList.remove("err");
    };
    if (cf) { cf.addEventListener("submit", onContact); cf.addEventListener("input", onContactInput); }

    // audit band -> prefill contact + scroll
    const af = root.querySelector<HTMLFormElement>("#auditForm");
    const aSent = root.querySelector<HTMLElement>("#auditSent");
    const onAudit = (e: Event) => {
      e.preventDefault();
      const url = v("auditUrl");
      if (!url) return;
      const msg = root.querySelector<HTMLTextAreaElement>("#c-msg");
      const company = root.querySelector<HTMLInputElement>("#c-company");
      if (msg) msg.value = "Free audit request for: " + url;
      if (company && !company.value) company.value = url;
      if (aSent) aSent.style.display = "block";
      const c = root.querySelector("#contact");
      if (c) c.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      const nameEl = root.querySelector<HTMLInputElement>("#c-name");
      if (nameEl) window.setTimeout(() => nameEl.focus(), reduce ? 0 : 600);
    };
    if (af) af.addEventListener("submit", onAudit);

    // lead popup — opens after 20s OR 50% scroll depth, once per session
    const overlay = root.querySelector<HTMLElement>("#popup");
    const closeBtn = root.querySelector<HTMLElement>("#popupClose");
    const POP_KEY = "roi_popup_shown";
    let popShown = false;
    let popTimer = 0;
    const openPopup = () => {
      if (popShown || !overlay) return;
      try { if (sessionStorage.getItem(POP_KEY)) { popShown = true; return; } } catch { /* ignore */ }
      popShown = true;
      try { sessionStorage.setItem(POP_KEY, "1"); } catch { /* ignore */ }
      overlay.classList.add("open");
      window.clearTimeout(popTimer);
    };
    const closePopup = () => { if (overlay) overlay.classList.remove("open"); };
    const scrollDepth = () => {
      const h = document.documentElement;
      if ((window.scrollY + window.innerHeight) / (h.scrollHeight || 1) >= 0.5) openPopup();
    };
    try { if (!sessionStorage.getItem(POP_KEY)) popTimer = window.setTimeout(openPopup, 20000); } catch { popTimer = window.setTimeout(openPopup, 20000); }
    if (closeBtn) closeBtn.addEventListener("click", closePopup);
    const onOverlayClick = (e: MouseEvent) => { if (e.target === overlay) closePopup(); };
    if (overlay) overlay.addEventListener("click", onOverlayClick);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePopup(); };
    window.addEventListener("keydown", onKey);

    const pf = root.querySelector<HTMLFormElement>("#pf");
    const pErr = root.querySelector<HTMLElement>("#p-err");
    const pSent = root.querySelector<HTMLElement>("#p-sent");
    const onPopup = (e: Event) => {
      e.preventDefault();
      if (!v("p-name") || !re.test(v("p-email"))) { if (pErr) pErr.style.display = "block"; return; }
      if (pErr) pErr.style.display = "none";
      post({ name: v("p-name"), email: v("p-email"), company: v("p-site"), message: "Audit request (popup)", source: "popup" });
      const b = pf?.querySelector<HTMLElement>(".mbtn");
      if (b) b.style.display = "none";
      if (pSent) pSent.style.display = "block";
      pf?.reset();
    };
    if (pf) pf.addEventListener("submit", onPopup);

    window.addEventListener("scroll", scrollDepth, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("load", check);

    return () => {
      window.clearTimeout(offTimer); window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(popTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", scrollDepth);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", check);
      window.removeEventListener("keydown", onKey);
      qs.forEach((b) => b.removeEventListener("click", onQ));
      if (cf) { cf.removeEventListener("submit", onContact); cf.removeEventListener("input", onContactInput); }
      if (af) af.removeEventListener("submit", onAudit);
      if (closeBtn) closeBtn.removeEventListener("click", closePopup);
      if (overlay) overlay.removeEventListener("click", onOverlayClick);
      if (pf) pf.removeEventListener("submit", onPopup);
      docEl.classList.remove("aurora-js", "aurora-reveal-off");
    };
  }, []);

  return <div className="aurora" id="top" ref={ref} dangerouslySetInnerHTML={{ __html: HTML }} />;
}
