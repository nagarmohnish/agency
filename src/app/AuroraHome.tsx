"use client";

// ROI Labs homepage — Aurora Light system (warm cream + brand yellow). The
// "How it works" section is an Adwize-style auto-playing process engine: a left
// "app" panel that builds cards per phase while a right step list highlights the
// active phase with a progress bar (App-flow / Timeline toggle). It cycles the
// four offerings — Audit → Creative → Launch → Optimize. Implemented from the
// Claude Design handoff (how-it-works/index.html), ported into this scoped
// `.aurora` component; motion, FAQ accordion, the auto-player, and the
// audit/contact forms (-> /api/leads) all run in one effect.

import { useEffect, useRef } from "react";

const CHK = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>`;
const SVG = (p: string) => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

const LINKEDIN = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
const XICON = `<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

// Prefix assets with the deploy base path so raw <img> srcs resolve on
// subpath hosts like GitHub Pages (/agency). Empty string on Vercel/apex.
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const HTML = `
<div class="navwrap">
  <nav>
    <div class="nv">
      <a href="#top" class="brand"><img src="${BP}/roi-logo-dark.png" alt="ROI Labs" /></a>
      <div class="nv-links"><a href="/#process">How it works</a><a href="/integrations">Integrations</a><a href="/audit">Free audit</a><a href="/#plans">Plans</a><a href="/#faq">FAQ</a></div>
      <a href="#contact" class="btn btn-pri">Book your audit</a>
    </div>
  </nav>
</div>

<section class="hero">
  <div class="wrap">
    <p class="ey" data-reveal>AI-native paid media agency</p>
    <h1 data-reveal data-delay="80">Paid media, measured in revenue.<span class="l2"><span class="grad">Scaled by AI.</span></span></h1>
    <p class="l" data-reveal data-delay="140">ROI Labs runs an AI-native engine that researches, produces, launches, and optimizes — until every campaign tracks to the outcome that matters: revenue for stores, installs for apps, leads for lead-gen.</p>
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

<section class="hiw" id="process">
  <div class="hiw__wrap">
    <div class="hiw__head" data-reveal>
      <div class="hiw__eyebrow">How it works</div>
      <h2 class="hiw__title">An engine, not a <span class="grad">campaign.</span></h2>
      <p class="hiw__sub">Senior operators handle the highest-leverage work; AI runs the volume underneath. Watch the loop that turns spend into the outcome that matters — revenue, installs, or leads — it runs itself.</p>
    </div>

    <div class="toggle" data-reveal>
      <div class="toggle__group">
        <button class="toggle__btn is-on" data-mode="app" type="button">App flow</button>
        <button class="toggle__btn" data-mode="timeline" type="button">Timeline</button>
      </div>
    </div>

    <div class="app" id="appView" data-reveal>
      <div class="app__panelwrap">
        <div class="app__glow"></div>
        <div class="panel">
          <div class="chrome">
            <div class="chrome__dots"><span></span><span></span><span></span></div>
            <div class="chrome__url"><b id="chromeUrl">roilabs.in/audit</b><span class="chrome__tag" id="chromeTag">Audit flow</span></div>
          </div>
          <div class="stack" id="stack"></div>
        </div>
      </div>
      <div class="steps" id="steps"></div>
    </div>

    <div class="tl hidden" id="timelineView">
      <div class="tl__track" id="tlTrack"></div>
      <div class="tl__card">
        <div class="tl__prompt"><span class="tl__logo">R</span><div class="tl__bubble" id="tlPrompt"></div></div>
        <div class="k" id="tlLabel"></div>
        <div class="tl__main" id="tlMain"></div>
        <div class="tl__stats" id="tlStats"></div>
      </div>
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
        <div class="item"><button class="q" aria-expanded="false">What exactly does ROI Labs do?<span class="ic">+</span></button><div class="a"><p>We run your Meta and Google paid media end-to-end — strategy, creative production at volume, landing pages, launches, and optimization — as one accountable system, measured against each campaign's real objective: store revenue, app installs, or qualified leads.</p></div></div>
        <div class="item"><button class="q" aria-expanded="false">Is the creative actually AI, or real?<span class="ic">+</span></button><div class="a"><p>AI does the research, drafts, and variants at scale. Senior operators review, refine, and approve everything before a dollar goes live — and we disclose AI-generated creative per platform policy.</p></div></div>
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
        <p class="ft">AI-native paid media for growth brands on Meta &amp; Google. Measured by the outcome that matters — revenue, installs, or leads.</p>
        <div class="fsoc"><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${LINKEDIN}</a><a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">${XICON}</a></div>
      </div>
      <div class="fcol">
        <h5>Company</h5>
        <a href="#process">How it works</a>
        <a href="/integrations">Integrations</a>
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
      <div class="mR-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <span class="mR-live" aria-hidden="true"><b></b>Scaling now</span>
      <h4>Join growth brands scaling on <span class="hl">Meta &amp; Google</span></h4>
      <p class="mrp">AI-run paid media, measured by the outcome that matters — not platform-reported vanity metrics.</p>
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

    // ── "How it works" auto-playing process engine ───────────────────────────
    const HIW_PHASE_MS = 4600;
    const HIW_PHASES = [
      {
        num: "01", tag: "Audit flow", url: "roilabs.in/audit", agent: "Research & intelligence",
        title: "Audit & opportunity",
        desc: "We tear down your Meta and Google accounts, creative, and tracking — then map where the money's leaking and the upside left on the table.",
        prompt: "Find where this account is leaking spend.",
        result: { label: "Opportunity map", main: "31% of spend at risk, mapped to ranked fixes.", stats: [["$74", "Current CAC"], ["31%", "Spend at risk"], ["6", "Creatives / mo"]] },
        stack: `
          <div class="bubble">Find where this account is leaking spend.</div>
          <div class="card">
            <div class="k">Account teardown</div>
            <div class="card__title">Spend at risk · 31%</div>
            <div class="rows">
              <div class="row"><span class="tick">&check;</span>Account structure reviewed</div>
              <div class="row"><span class="tick">&check;</span>Creative library audited</div>
              <div class="row"><span class="tick">&check;</span>Tracking gaps found</div>
            </div>
          </div>
          <div class="card card--y">
            <div class="k">Opportunity map</div>
            <div class="card__lead">The highest-leverage fixes, ranked by impact on CAC &amp; revenue.</div>
            <div class="minis">
              <div class="mini"><b>$74</b><span>current CAC</span></div>
              <div class="mini"><b>6/mo</b><span>creatives now</span></div>
            </div>
          </div>`,
      },
      {
        num: "02", tag: "Creative flow", url: "roilabs.in/creative", agent: "Creative production",
        title: "Creative at volume",
        desc: "Targeting is automated — creative is the lever. We produce static, motion, and UGC at a volume no studio can match, tested at the asset level.",
        prompt: "Produce this week's creative batch for the vitamin brand.",
        result: { label: "Creative pipeline", main: "6 assets generated and queued for testing.", stats: [["3", "Static"], ["2", "Motion"], ["1", "UGC"]] },
        stack: `
          <div class="bubble">Produce this week's creative batch for the vitamin brand.</div>
          <div class="card">
            <div class="k">Creative pipeline</div>
            <div class="card__title">6 assets generated</div>
            <div class="rows">
              <div class="row"><span class="tick">&check;</span>Static offer cards — on-brand</div>
              <div class="row"><span class="tick">&check;</span>Motion + UGC hooks drafted</div>
              <div class="row"><span class="tick">&check;</span>Tested at the asset level</div>
            </div>
          </div>
          <div class="card card--y">
            <div class="k">Pick the next test</div>
            <div class="thumbs">
              <div class="thumb thumb--win"><img src="${BP}/hiw/creative-1.png" alt="Scaled creative"><span class="thumb__badge">3.4x</span><div class="thumb__label thumb__label--win">Scaled</div></div>
              <div class="thumb"><img src="${BP}/hiw/creative-2.png" alt="Testing creative"><div class="thumb__label">Testing</div></div>
              <div class="thumb"><img src="${BP}/hiw/creative-3.png" alt="Queued creative" style="opacity:.78"><div class="thumb__label">Queued</div></div>
            </div>
          </div>`,
      },
      {
        num: "03", tag: "Launch flow", url: "roilabs.in/campaigns", agent: "Media buying & landing pages",
        title: "Launch across Meta & Google",
        desc: "Campaigns go live with proper structure, landing pages, and attribution from day one — bids and budget managed automatically while we ship landing pages that convert.",
        prompt: "Launch across Meta & Google with tracking wired.",
        result: { label: "Campaigns live", main: "Meta + Google live with attribution from day one.", stats: [["12", "Live tests"], ["On", "Pixel / CAPI"], ["On", "GA4"]] },
        stack: `
          <div class="bubble">Launch across Meta &amp; Google with tracking wired.</div>
          <div class="card">
            <div class="k">Campaigns live</div>
            <div class="platforms">
              <div class="plat"><b>Meta</b><span>Prospecting + retarget</span></div>
              <div class="plat"><b>Google</b><span>Search + PMax</span></div>
            </div>
            <div class="rows">
              <div class="row row--between"><span>Pixel &amp; CAPI</span><span class="ok">&check; Connected</span></div>
              <div class="row row--between"><span>GA4 + server-side</span><span class="ok">&check; Connected</span></div>
            </div>
          </div>
          <div class="card card--y card--split">
            <div><div class="k">Ready to launch</div><div class="card__title sm">12 live tests structured</div></div>
            <span class="apply">Apply</span>
          </div>`,
      },
      {
        num: "04", tag: "Optimize flow", url: "roilabs.in/performance", agent: "Measurement & attribution",
        title: "Optimize until it works",
        desc: "We measure each campaign against its own objective — revenue for stores, cost-per-install for apps, cost-per-lead for lead-gen — kill what isn't working, and feed the next angle back into research. Optimized daily by AI, reviewed weekly by senior operators.",
        prompt: "What should we cut and scale today?",
        result: { label: "What's working", main: "Losers cut, winners scaled — tracked to each funnel's true outcome.", stats: [["3.2x", "ROAS"], ["−47%", "CAC"], ["$284K", "Net new"]] },
        stack: `
          <div class="bubble">What should we cut and scale today?</div>
          <div class="card">
            <div class="k">Performance check</div>
            <div class="card__title">One ad is under target</div>
            <div class="rows">
              <div class="row"><span class="tick tick--warn">!</span>ROAS below objective</div>
              <div class="row"><span class="tick tick--warn">!</span>CPA above ecommerce target</div>
              <div class="row"><span class="tick tick--ok">&check;</span>Other ads within objective</div>
            </div>
          </div>
          <div class="card card--y">
            <div class="k">What's working</div>
            <div class="minis minis--3">
              <div class="mini c"><b>3.2x</b><span>ROAS</span></div>
              <div class="mini c"><b style="color:var(--gold-text)">−47%</b><span>CAC</span></div>
              <div class="mini c"><b>$284K</b><span>net new</span></div>
            </div>
          </div>`,
      },
    ];

    let hiwPhase = 0;
    let hiwMode = "app";
    let hiwTimer = 0;
    const hq = (sel: string) => root.querySelector<HTMLElement>(sel);

    const hiwRenderApp = () => {
      const p = HIW_PHASES[hiwPhase];
      const cu = hq("#chromeUrl"); if (cu) cu.textContent = p.url;
      const ct = hq("#chromeTag"); if (ct) ct.textContent = p.tag;
      const st = hq("#stack");
      if (st) {
        st.innerHTML = p.stack;
        // Cascade every element in: each block rises, then its inner rows/stats
        // tick in, then the next block — assigning delays in document order.
        let d = 0;
        Array.from(st.children).forEach((blk) => {
          (blk as HTMLElement).classList.add("hiw-anim");
          (blk as HTMLElement).style.animationDelay = d + "ms";
          d += 150;
          blk.querySelectorAll<HTMLElement>(".row,.mini,.plat,.thumb,.card__lead").forEach((c) => {
            c.classList.add("hiw-anim2");
            c.style.animationDelay = d + "ms";
            d += 85;
          });
        });
      }
      const steps = hq("#steps");
      if (steps) steps.innerHTML = HIW_PHASES.map((ph, i) => `
        <div class="step ${i === hiwPhase ? "is-active" : ""}" data-i="${i}">
          <div class="step__head">
            <span class="step__num">${ph.num}</span>
            <div><div class="step__title">${ph.title}</div><div class="step__agent">${ph.agent}</div></div>
          </div>
          ${i === hiwPhase ? `<div class="step__body"><p>${ph.desc}</p><div class="bar"><i></i></div></div>` : ``}
        </div>`).join("");
    };

    const hiwRenderTimeline = () => {
      const track = hq("#tlTrack");
      if (track) track.innerHTML = HIW_PHASES.map((ph, i) => `
        <div class="tl__node ${i === hiwPhase ? "is-active" : ""}" data-i="${i}">
          <span class="tl__dot">${ph.num}</span>
          <span class="tl__label">${ph.title}</span>
        </div>`).join("");
      const p = HIW_PHASES[hiwPhase];
      const pr = hq("#tlPrompt"); if (pr) pr.textContent = p.prompt;
      const lb = hq("#tlLabel"); if (lb) lb.textContent = p.result.label;
      const mn = hq("#tlMain"); if (mn) mn.textContent = p.result.main;
      const stt = hq("#tlStats");
      if (stt) stt.innerHTML = p.result.stats.map(([v, k]) => `<div class="tl__stat"><b>${v}</b><span>${k}</span></div>`).join("");
    };

    const hiwRender = () => { if (hiwMode === "app") hiwRenderApp(); else hiwRenderTimeline(); };
    const hiwStart = () => {
      if (reduce) return;
      window.clearInterval(hiwTimer);
      hiwTimer = window.setInterval(() => { hiwPhase = (hiwPhase + 1) % HIW_PHASES.length; hiwRender(); }, HIW_PHASE_MS);
    };
    const hiwJump = (i: number) => { hiwPhase = i; hiwRender(); hiwStart(); };
    const hiwSetMode = (m: string) => {
      hiwMode = m; hiwPhase = 0;
      hq("#appView")?.classList.toggle("hidden", m !== "app");
      hq("#timelineView")?.classList.toggle("hidden", m !== "timeline");
      root.querySelectorAll<HTMLElement>(".toggle__btn").forEach((b) => b.classList.toggle("is-on", b.dataset.mode === m));
      hiwRender(); hiwStart();
    };

    const hiwToggleBtns = Array.from(root.querySelectorAll<HTMLButtonElement>(".toggle__btn"));
    const onHiwToggle = (e: Event) => hiwSetMode((e.currentTarget as HTMLElement).dataset.mode || "app");
    hiwToggleBtns.forEach((b) => b.addEventListener("click", onHiwToggle));
    const hiwSteps = hq("#steps");
    const hiwTrack = hq("#tlTrack");
    const onHiwSteps = (e: Event) => { const s = (e.target as HTMLElement).closest<HTMLElement>(".step"); if (s) hiwJump(Number(s.dataset.i)); };
    const onHiwTrack = (e: Event) => { const n = (e.target as HTMLElement).closest<HTMLElement>(".tl__node"); if (n) hiwJump(Number(n.dataset.i)); };
    if (hiwSteps) hiwSteps.addEventListener("click", onHiwSteps);
    if (hiwTrack) hiwTrack.addEventListener("click", onHiwTrack);
    if (hq("#stack")) { hiwRender(); hiwStart(); }

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
      window.clearInterval(hiwTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", scrollDepth);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", check);
      window.removeEventListener("keydown", onKey);
      qs.forEach((b) => b.removeEventListener("click", onQ));
      hiwToggleBtns.forEach((b) => b.removeEventListener("click", onHiwToggle));
      if (hiwSteps) hiwSteps.removeEventListener("click", onHiwSteps);
      if (hiwTrack) hiwTrack.removeEventListener("click", onHiwTrack);
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
