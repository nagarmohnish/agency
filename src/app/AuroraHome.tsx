"use client";

// Aurora Light homepage. The markup is rendered verbatim (so it stays
// pixel-identical to the approved design) inside a scoped `.aurora` wrapper;
// the motion engine + form wiring run in a single effect after mount.

import { useEffect, useRef } from "react";

const HTML = `
<nav>
  <div class="wrap nv">
    <a href="#top" class="brand"><img src="/roi-logo-light.png" alt="ROI Labs" /></a>
    <div class="nv-links"><a href="#system">The agents</a><a href="#services">What we do</a><a href="#platforms">Platforms</a><a href="#process">How it works</a></div>
    <a href="#contact" class="btn btn-pri">Talk to us</a>
  </div>
</nav>

<section class="hero">
  <div class="wrap">
    <span class="pill" data-reveal><span class="dot"></span> Five agents online · human-in-the-loop</span>
    <h1 data-reveal data-delay="80">Paid media, run by AI agents. Measured in <span class="grad">revenue.</span></h1>
    <p class="l" data-reveal data-delay="160">We run Meta and Google end-to-end. Agents draft and test creative at a volume no human team can match; senior operators own the strategy and the only number that matters — revenue.</p>
    <div class="hero-cta" data-reveal data-delay="240">
      <a href="#contact" class="btn btn-pri btn-lg">Get a free teardown →</a>
      <a href="#system" class="btn btn-gh btn-lg">See how it works</a>
    </div>
    <div class="trust">
      <div class="t" data-reveal><div class="n"><span data-count="120" data-prefix="$" data-suffix="M+">$0M+</span></div><div class="k">Ad spend managed</div></div>
      <div class="t" data-reveal data-delay="80"><div class="n"><span data-count="6400" data-suffix="+">0+</span></div><div class="k">Creatives shipped</div></div>
      <div class="t" data-reveal data-delay="160"><div class="n"><span data-count="38" data-suffix="%">0%</span></div><div class="k">Avg. CAC reduction</div></div>
      <div class="t" data-reveal data-delay="240"><div class="n"><span data-count="84" data-prefix="$" data-suffix="M+">$0M+</span></div><div class="k">Revenue influenced</div></div>
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
        <svg viewBox="0 0 500 500" fill="none">
          <line x1="250" y1="250" x2="250" y2="50" stroke="rgba(250,204,21,.45)"/>
          <line x1="250" y1="250" x2="440" y2="188" stroke="rgba(250,204,21,.45)"/>
          <line x1="250" y1="250" x2="368" y2="412" stroke="rgba(250,204,21,.45)"/>
          <line x1="250" y1="250" x2="132" y2="412" stroke="rgba(250,204,21,.45)"/>
          <line x1="250" y1="250" x2="60" y2="188" stroke="rgba(250,204,21,.45)"/>
        </svg>
        <div class="core"><div class="pulse"></div><div><div class="ttl">ROI Core</div><div class="sub">Senior Ops</div></div></div>
        <div class="node" style="left:250px;top:50px;"><div class="bubble"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></div><div class="label"><div class="nm">Scout</div><div class="rl">Research</div></div></div>
        <div class="node" style="left:440px;top:188px;"><div class="bubble"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 2.4 7.4H22l-6 4.5 2.3 7.1L12 16.7 5.7 21l2.3-7.1-6-4.5h7.6z"/></svg></div><div class="label"><div class="nm">Forge</div><div class="rl">Creative</div></div></div>
        <div class="node" style="left:368px;top:412px;"><div class="bubble"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></div><div class="label"><div class="nm">Pilot</div><div class="rl">Media buying</div></div></div>
        <div class="node" style="left:132px;top:412px;"><div class="bubble"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg></div><div class="label"><div class="nm">Frame</div><div class="rl">Landing/CRO</div></div></div>
        <div class="node" style="left:60px;top:188px;"><div class="bubble"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 14 3-3 3 3 5-6"/></svg></div><div class="label"><div class="nm">Signal</div><div class="rl">Measurement</div></div></div>
      </div>
      <div class="alist">
        <div class="arow" data-reveal><div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></div><div><div class="nm">Scout</div><div class="rl">Research &amp; Intelligence</div><div class="dc">Tears down competitor ad libraries, maps audiences, finds angles worth testing.</div></div><div class="mt"><div class="v">[500+]</div><div class="k">accounts</div></div></div>
        <div class="arow" data-reveal><div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 2.4 7.4H22l-6 4.5 2.3 7.1L12 16.7 5.7 21l2.3-7.1-6-4.5h7.6z"/></svg></div><div><div class="nm">Forge</div><div class="rl">Creative Engine</div><div class="dc">Static, motion, and UGC concepts and variants at volume, tested at the asset level.</div></div><div class="mt"><div class="v">[1,200+]</div><div class="k">variants/qtr</div></div></div>
        <div class="arow" data-reveal><div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></div><div><div class="nm">Pilot</div><div class="rl">Media Buying &amp; Optimization</div><div class="dc">Structures campaigns, paces budget, rotates creative across Meta and Google.</div></div><div class="mt"><div class="v">[$25M+]</div><div class="k">optimized</div></div></div>
        <div class="arow" data-reveal><div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg></div><div><div class="nm">Frame</div><div class="rl">Landing Pages &amp; CRO</div><div class="dc">Fast, mobile-first landing pages for ad traffic, A/B tested continuously.</div></div><div class="mt"><div class="v">[300+]</div><div class="k">pages</div></div></div>
        <div class="arow" data-reveal><div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 14 3-3 3 3 5-6"/></svg></div><div><div class="nm">Signal</div><div class="rl">Measurement &amp; Attribution</div><div class="dc">GA4, server-side tracking, and attribution that ties every dollar to revenue.</div></div><div class="mt"><div class="v">[40+]</div><div class="k">brands</div></div></div>
      </div>
    </div>
    <p class="disclaim" data-reveal>This isn't AI spam. Agents do the research, drafts, and optimization at scale. <b>Senior humans review, refine, and approve everything before a dollar goes live.</b></p>
  </div>
</section>

<section id="services">
  <div class="wrap">
    <div class="sec-head" data-reveal><p class="ey">What we do</p><h2>Strategy, creative, and media — <span class="grad">as one engine.</span></h2></div>
    <div class="svc">
      <div class="scard" data-reveal><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></div><h4>Paid Media</h4><p>Meta and Google end-to-end — proper structure, real keyword discipline, and Advantage+ / PMax that don't torch the budget.</p></div>
      <div class="scard" data-reveal><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 2.4 7.4H22l-6 4.5 2.3 7.1L12 16.7 5.7 21l2.3-7.1-6-4.5h7.6z"/></svg></div><h4>Content &amp; Creative</h4><p>An always-on engine. Static, motion, and UGC shipped weekly, tested at the asset level. Volume is the strategy.</p></div>
      <div class="scard" data-reveal><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div><h4>Strategy</h4><p>Channel mix and budget on margin math — informed by AI teardowns at machine speed, not vanity ROAS.</p></div>
      <div class="scard" data-reveal><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg></div><h4>Landing &amp; CRO</h4><p>Fast, mobile-first pages built for ad traffic and A/B tested continuously.</p></div>
      <div class="scard" data-reveal><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 14 3-3 3 3 5-6"/></svg></div><h4>Measurement</h4><p>GA4, server-side tracking, and attribution that ties spend to revenue — not clicks.</p></div>
      <div class="scard" data-reveal><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12H4z"/><path d="M4 20h16"/></svg></div><h4>Reporting</h4><p>Weekly read on revenue and CAC, in plain English. What worked, what didn't, what's next.</p></div>
    </div>
  </div>
</section>

<section id="platforms">
  <div class="wrap">
    <div class="sec-head" data-reveal><p class="ey">Platforms</p><h2>Two channels. Run properly. <span class="grad">Amplified by AI.</span></h2><p>Meta and Google are 90% of the work for most brands we run. Other channels added when they earn it.</p></div>
    <div class="plat">
      <div class="pcard" data-reveal>
        <div class="top"><h3>Meta Ads</h3><span class="bdg">Primary</span></div>
        <div class="ch">Facebook · Instagram · Messenger · Reels</div>
        <p class="pd">Full-funnel paid social — cold prospecting to retargeting and catalog sales. Creative-led campaigns built around what converts on platform.</p>
        <ul>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Conversion campaigns</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Lead generation</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Catalog &amp; dynamic ads</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Reels-native creative</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Advantage+ Shopping</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Pixel &amp; CAPI setup</li>
        </ul>
      </div>
      <div class="pcard" data-reveal>
        <div class="top"><h3>Google Ads</h3><span class="bdg">Primary</span></div>
        <div class="ch">Search · Performance Max · YouTube · Demand Gen</div>
        <p class="pd">Search intent and visual demand, run together. Tight structure, real keyword discipline, and Performance Max that doesn't burn budget.</p>
        <ul>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Search &amp; shopping</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Performance Max</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>YouTube ads</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Demand Gen</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Tag Manager &amp; GA4</li>
          <li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>Negative keywords</li>
        </ul>
      </div>
    </div>
    <div class="addons">
      <div class="adn" data-reveal><div class="top"><h4>LinkedIn Ads</h4><span class="bdg">Add-on</span></div><p>B2B targeting, ABM lists, lead-gen forms.</p></div>
      <div class="adn" data-reveal><div class="top"><h4>Snapchat Ads</h4><span class="bdg">Add-on</span></div><p>Gen Z reach, AR lenses, creative-first formats.</p></div>
      <div class="adn" data-reveal><div class="top"><h4>Programmatic</h4><span class="bdg">Add-on</span></div><p>Display, native, and direct deal placements.</p></div>
    </div>
  </div>
</section>

<section id="process">
  <div class="wrap">
    <div class="sec-head" data-reveal><p class="ey">How it works</p><h2>From audit to live in <span class="grad">days, not months.</span></h2></div>
    <div class="steps">
      <div class="stp" data-reveal><div class="sn">1</div><h4>Audit &amp; teardown</h4><p>Free audit of your Meta and Google accounts plus an AI competitive teardown. Clear read in 24 hours.</p></div>
      <div class="stp" data-reveal><div class="sn">2</div><h4>Architecture</h4><p>Audience map, funnel, and budget on margin math — built in days, not a month-long deck.</p></div>
      <div class="stp" data-reveal><div class="sn">3</div><h4>Creative spins up</h4><p>Your first batch of static, motion, and UGC ads in [under a week], tested at the asset level.</p></div>
      <div class="stp" data-reveal><div class="sn">4</div><h4>Launch</h4><p>Campaigns structured properly. Pixel/CAPI, GA4, and server-side tracking from day one.</p></div>
      <div class="stp" data-reveal><div class="sn">5</div><h4>Optimize daily</h4><p>Agents handle bidding, pacing, and rotation; senior operators steer weekly.</p></div>
      <div class="stp" data-reveal><div class="sn">6</div><h4>Compound</h4><p>Weekly reporting on revenue and CAC. Winning angles compound.</p></div>
    </div>
  </div>
</section>

<section id="contact" style="padding-bottom:60px;">
  <div class="wrap">
    <div class="contact-wrap" data-reveal="scale">
      <div class="contact-l">
        <p class="ey">Contact</p>
        <h2>Let's talk about your <span class="grad">growth.</span></h2>
        <p>Tell us about your business and goals. You'll get a clear read on your Meta and Google accounts — plus a shortlist of the highest-leverage fixes — within 24 hours.</p>
        <ul class="incl">
          <li><svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 7 13l-4-4"/></svg>AI-powered audit of your current ad accounts</li>
          <li><svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 7 13l-4-4"/></svg>Competitive ad-library teardown</li>
          <li><svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 7 13l-4-4"/></svg>Custom paid media + creative strategy</li>
          <li><svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 7 13l-4-4"/></svg>Transparent pricing — no retainer pitch unless it fits</li>
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
            <div><label>Company</label><input id="c-company" type="text" placeholder="Company name" /><div class="errm"></div></div>
            <div><label>Monthly budget</label><select id="c-budget" required><option value="" selected disabled>Select range</option><option>Under $5,000</option><option>$5,000 – $15,000</option><option>$15,000 – $50,000</option><option>$50,000+</option></select><div class="errm">Please pick a range.</div></div>
          </div>
          <div class="f"><label>Message</label><textarea id="c-msg" placeholder="Tell us about your goals…" required></textarea><div class="errm">Tell us a little about your goals.</div></div>
          <button type="submit" class="btn btn-pri btn-lg fbtn">Send message →</button>
          <div class="sent" id="sent">✓ Sent — we'll be in touch within 24 hours.</div>
        </form>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="wrap foot">
    <span>ROI Labs — the AI-native paid media agency.</span>
    <span>© 2026 · support@roilabs.in</span>
  </div>
</footer>
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
    const navShadow = () => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 6);
    };

    const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const counts = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    const fmt = (n: number) => n.toLocaleString("en-US");

    function countUp(el: HTMLElement) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      const t = parseFloat(el.getAttribute("data-count") || "0");
      const dur = 1500;
      const pre = el.getAttribute("data-prefix") || "";
      const suf = el.getAttribute("data-suffix") || "";
      const dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (reduce) {
        el.textContent = pre + (dec ? t.toFixed(dec) : fmt(t)) + suf;
        return;
      }
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        const v = t * e;
        el.textContent = pre + (dec ? v.toFixed(dec) : fmt(Math.round(v))) + suf;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = pre + (dec ? t.toFixed(dec) : fmt(t)) + suf;
      };
      requestAnimationFrame(step);
    }

    function inView(el: HTMLElement, m: number) {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      if (!r.height && !r.width) return false;
      return r.top < vh - (m || 0) * vh && r.bottom > 0;
    }

    const revQ = reveals.slice();
    const cntQ = counts.slice();
    function check() {
      for (let i = revQ.length - 1; i >= 0; i--) {
        const el = revQ[i];
        if (inView(el, 0.06)) {
          const d = parseInt(el.getAttribute("data-delay") || "0", 10);
          window.setTimeout(() => el.classList.add("in"), reduce ? 0 : d);
          revQ.splice(i, 1);
        }
      }
      for (let j = cntQ.length - 1; j >= 0; j--) {
        if (inView(cntQ[j], 0)) {
          countUp(cntQ[j]);
          cntQ.splice(j, 1);
        }
      }
    }

    if (reduce) {
      reveals.forEach((el) => el.classList.add("in"));
      counts.forEach(countUp);
    }

    let tick = false;
    const onScroll = () => {
      navShadow();
      if (!tick) {
        tick = true;
        requestAnimationFrame(() => {
          check();
          tick = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    navShadow();
    check();
    requestAnimationFrame(check);
    const t1 = window.setTimeout(check, 120);
    const t2 = window.setTimeout(check, 400);
    window.addEventListener("load", check);

    // contact form -> Supabase /api/leads
    const form = root.querySelector<HTMLFormElement>("#cf");
    const sent = root.querySelector<HTMLElement>("#sent");
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const val = (id: string) => {
      const el = root.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("#" + id);
      return el ? el.value.trim() : "";
    };
    const onSubmit = async (e: Event) => {
      e.preventDefault();
      let ok = true;
      const checks: [string, (v: string) => boolean][] = [
        ["c-name", (v) => !!v],
        ["c-email", (v) => re.test(v)],
        ["c-budget", (v) => !!v],
        ["c-msg", (v) => !!v],
      ];
      checks.forEach(([id, test]) => {
        const el = root.querySelector<HTMLElement>("#" + id);
        if (!el) return;
        const box = (el.closest(".f.row > div") || el.closest(".f")) as HTMLElement | null;
        const bad = !test(val(id));
        if (box) box.classList.toggle("err", bad);
        if (bad) ok = false;
      });
      if (!ok) return;
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: val("c-name"),
            email: val("c-email"),
            company: val("c-company"),
            budget: val("c-budget"),
            message: val("c-msg"),
            source: "aurora-home",
          }),
        });
      } catch {
        /* show success regardless; lead is best-effort */
      }
      const btn = form?.querySelector<HTMLElement>(".fbtn");
      if (btn) btn.style.display = "none";
      if (sent) sent.style.display = "block";
      form?.reset();
    };
    const onInput = (e: Event) => {
      const target = e.target as HTMLElement;
      const box = (target.closest(".f.row > div") || target.closest(".f")) as HTMLElement | null;
      if (box) box.classList.remove("err");
    };
    if (form) {
      form.addEventListener("submit", onSubmit);
      form.addEventListener("input", onInput);
    }

    return () => {
      window.clearTimeout(offTimer);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", check);
      if (form) {
        form.removeEventListener("submit", onSubmit);
        form.removeEventListener("input", onInput);
      }
      docEl.classList.remove("aurora-js", "aurora-reveal-off");
    };
  }, []);

  return <div className="aurora" id="top" ref={ref} dangerouslySetInnerHTML={{ __html: HTML }} />;
}
