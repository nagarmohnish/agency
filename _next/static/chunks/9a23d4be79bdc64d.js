(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,96288,e=>{"use strict";var a=e.i(43476),t=e.i(71645);let s='<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6 12l-3.5-3.5"/></svg>',i="/agency",l=`
<div class="navwrap">
  <nav>
    <div class="nv">
      <a href="#top" class="brand"><img src="${i}/roi-logo-dark.png" alt="ROI Labs" /></a>
      <div class="nv-links"><a href="#process">How it works</a><a href="/integrations">Integrations</a><a href="/audit">Free audit</a><a href="#plans">Plans</a><a href="#faq">FAQ</a></div>
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

<section style="padding-top:10px;">
  <div class="wrap">
    <div class="broken" data-reveal>
      <p class="ey">Why AI-native</p>
      <h2>The agency model is broken. <span class="grad">We thought so too.</span></h2>
      <p>Most shops ship ten ads a month, hand your account to a junior buyer, and report on metrics that never reach your P&amp;L. AI changed what's possible — so we built the agency around it. AI produces and tests creative at a volume no human team can match; senior operators own the strategy and the number that pays the bills for each funnel — revenue for stores, cost-per-install for apps, cost-per-lead for lead-gen.</p>
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
          <li><span class="mk">${s}</span>Senior-led strategy + AI-run execution</li>
          <li><span class="mk">${s}</span>Meta &amp; Google managed end-to-end</li>
          <li><span class="mk">${s}</span>60+ creatives produced &amp; tested / month</li>
          <li><span class="mk">${s}</span>Landing pages &amp; CRO included</li>
          <li><span class="mk">${s}</span>Revenue &amp; CAC reporting, weekly</li>
        </ul>
        <a href="#contact" class="btn btn-pri">Book your audit →</a>
      </div>
      <div class="plan" data-reveal data-delay="80">
        <h3>For Agencies</h3>
        <p class="pd">For agencies that want to offer AI-run paid media under their own brand.</p>
        <ul>
          <li><span class="mk">${s}</span>White-label creative + media engine</li>
          <li><span class="mk">${s}</span>Client-ready reporting under your brand</li>
          <li><span class="mk">${s}</span>Manage multiple accounts in one place</li>
          <li><span class="mk">${s}</span>Recurring revenue, near-zero overhead</li>
          <li><span class="mk">${s}</span>Priority support</li>
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
          <li><span class="mk">${s}</span>AI audit of your current ad accounts</li>
          <li><span class="mk">${s}</span>Competitive ad-library teardown</li>
          <li><span class="mk">${s}</span>A custom creative + media plan</li>
          <li><span class="mk">${s}</span>Transparent pricing — no retainer pitch unless it fits</li>
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
        <img src="${i}/roi-logo-dark.png" alt="ROI Labs" />
        <p class="ft">AI-native paid media for growth brands on Meta &amp; Google. Measured by the outcome that matters — revenue, installs, or leads.</p>
        <div class="fsoc"><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a><a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X"><svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a></div>
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
    <div class="fbar2"><span>\xa9 2026 ROI Labs. All rights reserved.</span><span>support@roilabs.in</span></div>
  </div>
</footer>

<div class="modal-ov" id="popup" role="dialog" aria-modal="true" aria-label="Book your audit">
  <div class="modal">
    <div class="mL">
      <button class="mClose" id="popupClose" type="button" aria-label="Close"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5l14 14M19 5 5 19"/></svg></button>
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
      <p class="mrp">AI-run paid media, measured by the outcome that matters — not platform-reported vanity metrics.</p>
      <div class="chips"><span>DTC</span><span>B2B SaaS</span><span>Ecommerce</span><span>Subscription</span><span>Marketplaces</span><span>Lead-gen</span></div>
    </div>
  </div>
</div>
`;function n(){let e=(0,t.useRef)(null);return(0,t.useEffect)(()=>{let a=e.current;if(!a)return;let t=document.documentElement,s="function"==typeof window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;t.classList.add("aurora-js");let l=window.setTimeout(()=>t.classList.add("aurora-reveal-off"),1100),n=a.querySelector("nav"),r=()=>{n&&n.classList.toggle("scrolled",window.scrollY>8)},o=Array.from(a.querySelectorAll("[data-reveal]")),d=o.slice(),c=(e,a)=>{let t=e.getBoundingClientRect(),s=window.innerHeight||800;return(!!t.height||!!t.width)&&t.top<s-(a||0)*s&&t.bottom>0},p=()=>{for(let e=d.length-1;e>=0;e--){let a=d[e];if(c(a,.06)){let t=parseInt(a.getAttribute("data-delay")||"0",10);window.setTimeout(()=>a.classList.add("in"),s?0:t),d.splice(e,1)}}};s&&o.forEach(e=>e.classList.add("in"));let v=!1,u=()=>{r(),v||(v=!0,requestAnimationFrame(()=>{p(),v=!1}))};r(),p();let m=window.setTimeout(p,120),h=window.setTimeout(p,400),g=Array.from(a.querySelectorAll(".faq .q")),b=e=>{let a=e.currentTarget,t="true"===a.getAttribute("aria-expanded");if(g.forEach(e=>{e.setAttribute("aria-expanded","false");let a=e.nextElementSibling;a&&a.classList.remove("open")}),!t){a.setAttribute("aria-expanded","true");let e=a.nextElementSibling;e&&e.classList.add("open")}};g.forEach(e=>e.addEventListener("click",b));let w=[{num:"01",tag:"Audit flow",url:"roilabs.in/audit",agent:"Research & intelligence",title:"Audit & opportunity",desc:"We tear down your Meta and Google accounts, creative, and tracking — then map where the money's leaking and the upside left on the table.",prompt:"Find where this account is leaking spend.",result:{label:"Opportunity map",main:"31% of spend at risk, mapped to ranked fixes.",stats:[["$74","Current CAC"],["31%","Spend at risk"],["6","Creatives / mo"]]},stack:`
          <div class="bubble">Find where this account is leaking spend.</div>
          <div class="card">
            <div class="k">Account teardown</div>
            <div class="card__title">Spend at risk \xb7 31%</div>
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
          </div>`},{num:"02",tag:"Creative flow",url:"roilabs.in/creative",agent:"Creative production",title:"Creative at volume",desc:"Targeting is automated — creative is the lever. We produce static, motion, and UGC at a volume no studio can match, tested at the asset level.",prompt:"Produce this week's creative batch for the vitamin brand.",result:{label:"Creative pipeline",main:"6 assets generated and queued for testing.",stats:[["3","Static"],["2","Motion"],["1","UGC"]]},stack:`
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
              <div class="thumb thumb--win"><img src="${i}/hiw/creative-1.png" alt="Scaled creative"><span class="thumb__badge">3.4x</span><div class="thumb__label thumb__label--win">Scaled</div></div>
              <div class="thumb"><img src="${i}/hiw/creative-2.png" alt="Testing creative"><div class="thumb__label">Testing</div></div>
              <div class="thumb"><img src="${i}/hiw/creative-3.png" alt="Queued creative" style="opacity:.78"><div class="thumb__label">Queued</div></div>
            </div>
          </div>`},{num:"03",tag:"Launch flow",url:"roilabs.in/campaigns",agent:"Media buying & landing pages",title:"Launch across Meta & Google",desc:"Campaigns go live with proper structure, landing pages, and attribution from day one — bids and budget managed automatically while we ship landing pages that convert.",prompt:"Launch across Meta & Google with tracking wired.",result:{label:"Campaigns live",main:"Meta + Google live with attribution from day one.",stats:[["12","Live tests"],["On","Pixel / CAPI"],["On","GA4"]]},stack:`
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
          </div>`},{num:"04",tag:"Optimize flow",url:"roilabs.in/performance",agent:"Measurement & attribution",title:"Optimize until it works",desc:"We measure each campaign against its own objective — revenue for stores, cost-per-install for apps, cost-per-lead for lead-gen — kill what isn't working, and feed the next angle back into research. Optimized daily by AI, reviewed weekly by senior operators.",prompt:"What should we cut and scale today?",result:{label:"What's working",main:"Losers cut, winners scaled — tracked to each funnel's true outcome.",stats:[["3.2x","ROAS"],["−47%","CAC"],["$284K","Net new"]]},stack:`
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
          </div>`}],y=0,f="app",k=0,_=()=>{if("app"===f)(()=>{let e=w[y],t=a.querySelector("#chromeUrl");t&&(t.textContent=e.url);let s=a.querySelector("#chromeTag");s&&(s.textContent=e.tag);let i=a.querySelector("#stack");if(i){i.innerHTML=e.stack;let a=0;Array.from(i.children).forEach(e=>{e.classList.add("hiw-anim"),e.style.animationDelay=a+"ms",a+=150,e.querySelectorAll(".row,.mini,.plat,.thumb,.card__lead").forEach(e=>{e.classList.add("hiw-anim2"),e.style.animationDelay=a+"ms",a+=85})})}let l=a.querySelector("#steps");l&&(l.innerHTML=w.map((e,a)=>`
        <div class="step ${a===y?"is-active":""}" data-i="${a}">
          <div class="step__head">
            <span class="step__num">${e.num}</span>
            <div><div class="step__title">${e.title}</div><div class="step__agent">${e.agent}</div></div>
          </div>
          ${a===y?`<div class="step__body"><p>${e.desc}</p><div class="bar"><i></i></div></div>`:""}
        </div>`).join(""))})();else{let e,t,s,i,l,n;(e=a.querySelector("#tlTrack"))&&(e.innerHTML=w.map((e,a)=>`
        <div class="tl__node ${a===y?"is-active":""}" data-i="${a}">
          <span class="tl__dot">${e.num}</span>
          <span class="tl__label">${e.title}</span>
        </div>`).join("")),t=w[y],(s=a.querySelector("#tlPrompt"))&&(s.textContent=t.prompt),(i=a.querySelector("#tlLabel"))&&(i.textContent=t.result.label),(l=a.querySelector("#tlMain"))&&(l.textContent=t.result.main),(n=a.querySelector("#tlStats"))&&(n.innerHTML=t.result.stats.map(([e,a])=>`<div class="tl__stat"><b>${e}</b><span>${a}</span></div>`).join(""))}},L=()=>{s||(window.clearInterval(k),k=window.setInterval(()=>{y=(y+1)%w.length,_()},4600))},S=e=>{y=e,_(),L()},A=Array.from(a.querySelectorAll(".toggle__btn")),C=e=>{var t;return f=t=e.currentTarget.dataset.mode||"app",y=0,a.querySelector("#appView")?.classList.toggle("hidden","app"!==t),void(a.querySelector("#timelineView")?.classList.toggle("hidden","timeline"!==t),a.querySelectorAll(".toggle__btn").forEach(e=>e.classList.toggle("is-on",e.dataset.mode===t)),_(),L())};A.forEach(e=>e.addEventListener("click",C));let q=a.querySelector("#steps"),E=a.querySelector("#tlTrack"),x=e=>{let a=e.target.closest(".step");a&&S(Number(a.dataset.i))},T=e=>{let a=e.target.closest(".tl__node");a&&S(Number(a.dataset.i))};q&&q.addEventListener("click",x),E&&E.addEventListener("click",T),a.querySelector("#stack")&&(_(),L());let M=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,I=e=>{fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).catch(()=>{})},$=e=>{let t=a.querySelector("#"+e);return t?t.value.trim():""},P=a.querySelector("#cf"),O=a.querySelector("#sent"),R=e=>{e.preventDefault();let t=!0;if([["c-name",e=>!!e],["c-email",e=>M.test(e)],["c-budget",e=>!!e],["c-msg",e=>!!e]].forEach(([e,s])=>{let i=a.querySelector("#"+e);if(!i)return;let l=i.closest(".f.row > div")||i.closest(".f"),n=!s($(e));l&&l.classList.toggle("err",n),n&&(t=!1)}),!t)return;I({name:$("c-name"),email:$("c-email"),company:$("c-company"),budget:$("c-budget"),message:$("c-msg"),source:"aurora-home"});let s=P?.querySelector(".fbtn");s&&(s.style.display="none"),O&&(O.style.display="block"),P?.reset()},G=e=>{let a=e.target.closest(".f.row > div")||e.target.closest(".f");a&&a.classList.remove("err")};P&&(P.addEventListener("submit",R),P.addEventListener("input",G));let H=a.querySelector("#auditForm"),B=a.querySelector("#auditSent"),W=e=>{e.preventDefault();let t=$("auditUrl");if(!t)return;let i=a.querySelector("#c-msg"),l=a.querySelector("#c-company");i&&(i.value="Free audit request for: "+t),l&&!l.value&&(l.value=t),B&&(B.style.display="block");let n=a.querySelector("#contact");n&&n.scrollIntoView({behavior:s?"auto":"smooth",block:"start"});let r=a.querySelector("#c-name");r&&window.setTimeout(()=>r.focus(),600*!s)};H&&H.addEventListener("submit",W);let j=a.querySelector("#popup"),F=a.querySelector("#popupClose"),z="roi_popup_shown",U=!1,D=0,V=()=>{if(!U&&j){try{if(sessionStorage.getItem(z)){U=!0;return}}catch{}U=!0;try{sessionStorage.setItem(z,"1")}catch{}j.classList.add("open"),window.clearTimeout(D)}},N=()=>{j&&j.classList.remove("open")},Y=()=>{let e=document.documentElement;(window.scrollY+window.innerHeight)/(e.scrollHeight||1)>=.5&&V()};try{sessionStorage.getItem(z)||(D=window.setTimeout(V,2e4))}catch{D=window.setTimeout(V,2e4)}F&&F.addEventListener("click",N);let K=e=>{e.target===j&&N()};j&&j.addEventListener("click",K);let Q=e=>{"Escape"===e.key&&N()};window.addEventListener("keydown",Q);let J=a.querySelector("#pf"),X=a.querySelector("#p-err"),Z=a.querySelector("#p-sent"),ee=e=>{if(e.preventDefault(),!$("p-name")||!M.test($("p-email"))){X&&(X.style.display="block");return}X&&(X.style.display="none"),I({name:$("p-name"),email:$("p-email"),company:$("p-site"),message:"Audit request (popup)",source:"popup"});let a=J?.querySelector(".mbtn");a&&(a.style.display="none"),Z&&(Z.style.display="block"),J?.reset()};return J&&J.addEventListener("submit",ee),window.addEventListener("scroll",Y,{passive:!0}),window.addEventListener("scroll",u,{passive:!0}),window.addEventListener("resize",u,{passive:!0}),window.addEventListener("load",p),()=>{window.clearTimeout(l),window.clearTimeout(m),window.clearTimeout(h),window.clearTimeout(D),window.clearInterval(k),window.removeEventListener("scroll",u),window.removeEventListener("scroll",Y),window.removeEventListener("resize",u),window.removeEventListener("load",p),window.removeEventListener("keydown",Q),g.forEach(e=>e.removeEventListener("click",b)),A.forEach(e=>e.removeEventListener("click",C)),q&&q.removeEventListener("click",x),E&&E.removeEventListener("click",T),P&&(P.removeEventListener("submit",R),P.removeEventListener("input",G)),H&&H.removeEventListener("submit",W),F&&F.removeEventListener("click",N),j&&j.removeEventListener("click",K),J&&J.removeEventListener("submit",ee),t.classList.remove("aurora-js","aurora-reveal-off")}},[]),(0,a.jsx)("div",{className:"aurora",id:"top",ref:e,dangerouslySetInnerHTML:{__html:l}})}e.s(["default",()=>n])}]);