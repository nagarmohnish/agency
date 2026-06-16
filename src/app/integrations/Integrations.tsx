"use client";

// ROI Labs — Integrations page. Aurora Light system (cream + brand yellow),
// reusing aurora.css tokens/nav/footer/buttons. Reframed from a generic "ads
// stack" page around ROI Labs' thesis: every campaign is measured against its
// true objective — store revenue (reconciled to Shopify), app installs/CPI, or
// leads — not platform-reported vanity metrics. Search filters live.

import { useEffect, useMemo, useRef, useState } from "react";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const SVG = (p: string) => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I_SEARCH = SVG(`<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>`);
const LINKEDIN = `<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
const XICON = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

// brand logos (compact)
const L_GOOGLE = "/logos/google.jpg";
const L_META = "/logos/meta.png";
const L_TIKTOK = "/logos/tiktok.png";
const L_LINKEDIN = "/logos/linkedin.png";
const L_PINTEREST = "/logos/pinterest.png";
const L_SNAP = "/logos/snapchat.jpg";
const L_SHOPIFY = "/logos/shopify.svg";
const L_WOO = "/logos/woo.png";
const L_GA4 = "/logos/ga4.png";
const L_HUBSPOT = "/logos/hubspot.png";
const L_SF = "/logos/salesforce.png";
const L_GHL = "/logos/highlevel.jpg";
const L_PIPE = `<svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="6.5" fill="#21A84C"/><path fill="#fff" d="M12.6 6.7c-1.3 0-2.3.5-2.9 1.3l-.1-1.1H7.2c0 .6.1 1.2.1 2v9.4h2.6v-3.8c.6.6 1.4.9 2.5.9 2.4 0 4.3-1.8 4.3-4.4 0-2.6-1.7-4.3-4.1-4.3zm-.5 6.5c-1.2 0-2-.9-2-2.2 0-1.3.8-2.1 2-2.1s2 .9 2 2.1c0 1.3-.8 2.2-2 2.2z"/></svg>`;
const L_AIR = "/logos/airtable.png";
const L_STRIPE = "/logos/stripe.png";
const L_PAYPAL = "/logos/paypal.svg";
const L_RAZORPAY = "/logos/razorpay.png";
const L_UPI = "/logos/upi.webp";

type Status = "live" | "soon";
type Integ = { name: string; cat: string; sec: string; desc: string; status: Status; logo: string; feat?: boolean };

const SEC_ADS = "Ad platforms";
const SEC_REV = "Revenue & e-commerce";
const SEC_MEAS = "Measurement & CRM";
const SEC_PAY = "Payments & subscriptions";

const ITEMS: Integ[] = [
  { name: "Google Ads", cat: "Ads platform", sec: SEC_ADS, status: "live", logo: L_GOOGLE,
    desc: "Search, Performance Max, app-install and YouTube campaigns read into the engine — measured on the right objective for each (revenue, or installs and cost-per-install for app campaigns), audited automatically by the research & intelligence layer." },
  { name: "Meta Ads", cat: "Ads platform", sec: SEC_ADS, status: "live", logo: L_META,
    desc: "Campaigns, ad sets, creatives and purchase events analysed directly from your Meta Ads account, end-to-end." },
  { name: "TikTok Ads", cat: "Ads platform", sec: SEC_ADS, status: "soon", logo: L_TIKTOK,
    desc: "Short-form creative performance pulled into the same outcome-based decision layer as Meta and Google." },
  { name: "LinkedIn Ads", cat: "Ads platform", sec: SEC_ADS, status: "soon", logo: L_LINKEDIN,
    desc: "B2B audiences, lead-gen campaigns and demand-gen reporting tied back to pipeline." },
  { name: "Pinterest Ads", cat: "Ads platform", sec: SEC_ADS, status: "soon", logo: L_PINTEREST,
    desc: "Intent and inspiration signals added to the model when the connector opens." },
  { name: "Snapchat Ads", cat: "Ads platform", sec: SEC_ADS, status: "soon", logo: L_SNAP,
    desc: "Mobile-first creative and AR campaign insights for future launches." },

  { name: "Shopify", cat: "Revenue source of truth", sec: SEC_REV, status: "live", logo: L_SHOPIFY, feat: true,
    desc: "Orders, revenue, products and AOV — the revenue source of truth the engine reconciles store campaigns against. This is how “store spend, measured in real revenue, not ROAS” is real, not a claim." },
  { name: "WooCommerce", cat: "E-commerce", sec: SEC_REV, status: "soon", logo: L_WOO,
    desc: "WordPress store revenue brought in so acquisition is judged on real store growth, not platform-reported ROAS." },

  { name: "GA4", cat: "Measurement", sec: SEC_MEAS, status: "soon", logo: L_GA4,
    desc: "Server-side events and last-click attribution that tie every dollar of spend to revenue — the engine's measurement & attribution layer." },
  { name: "HubSpot", cat: "CRM", sec: SEC_MEAS, status: "soon", logo: L_HUBSPOT,
    desc: "Lifecycle stages and deals so the engine prioritises campaigns that create quality pipeline, not just leads." },
  { name: "Salesforce", cat: "CRM", sec: SEC_MEAS, status: "soon", logo: L_SF,
    desc: "Enterprise opportunities and account context connected to acquisition performance." },
  { name: "GoHighLevel", cat: "CRM", sec: SEC_MEAS, status: "soon", logo: L_GHL,
    desc: "Appointments, deals and lead attribution for local and agency workflows." },
  { name: "Pipedrive", cat: "CRM", sec: SEC_MEAS, status: "soon", logo: L_PIPE,
    desc: "Deals, pipeline value and commercial activity mapped back to the campaigns that drove them." },
  { name: "Airtable", cat: "Ops", sec: SEC_MEAS, status: "soon", logo: L_AIR,
    desc: "Creative pipelines, approvals and campaign status aligned with the engine's recommendations." },

  { name: "Stripe", cat: "Payments", sec: SEC_PAY, status: "soon", logo: L_STRIPE, feat: true,
    desc: "Recurring subscription revenue — MRR, active subscribers and churn — read alongside one-time Shopify orders so the engine optimises to blended revenue, not just first purchase." },
  { name: "Razorpay", cat: "Payments", sec: SEC_PAY, status: "soon", logo: L_RAZORPAY,
    desc: "India-first cards, netbanking and subscription billing brought in as a primary recurring-revenue source." },
  { name: "PayPal", cat: "Payments", sec: SEC_PAY, status: "soon", logo: L_PAYPAL,
    desc: "Global checkout and recurring billing reconciled into the same revenue truth as the store." },
  { name: "UPI", cat: "Payments", sec: SEC_PAY, status: "soon", logo: L_UPI,
    desc: "UPI autopay and one-time collections — India's dominant payment rail — tracked as recurring app-purchase revenue." },
];

const SECTIONS = [
  { id: SEC_ADS, sub: "Where spend goes" },
  { id: SEC_REV, sub: "Where revenue is measured" },
  { id: SEC_PAY, sub: "Where recurring revenue comes from" },
  { id: SEC_MEAS, sub: "Where it all gets attributed" },
];

function Logo({ svg }: { svg: string }) {
  if (svg.startsWith("/")) return <span className="ig-logo"><img src={`${BP}${svg}`} alt="" loading="lazy" /></span>;
  return <span className="ig-logo" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function Card({ it }: { it: Integ }) {
  return (
    <div className={`ig-card${it.feat ? " feat" : ""}`}>
      <p className="ig-cat">{it.cat}</p>
      <div className="ig-top">
        <Logo svg={it.logo} />
        <span className="ig-nm">{it.name}</span>
      </div>
      <p className="ig-desc">{it.desc}</p>
      {it.status === "live" ? (
        <span className="ig-badge live"><span className="d" />Live</span>
      ) : (
        <span className="ig-badge soon"><span className="d" />Coming soon</span>
      )}
    </div>
  );
}

export default function Integrations() {
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nav = root.querySelector("nav");
    const onScroll = () => { if (nav) nav.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return ITEMS;
    return ITEMS.filter((i) => (i.name + " " + i.cat + " " + i.desc).toLowerCase().includes(t));
  }, [q]);

  return (
    <div className="aurora" id="top" ref={ref}>
      <div className="navwrap">
        <nav>
          <div className="nv">
            <a href="/" className="brand"><img src={`${BP}/roi-logo-dark.png`} alt="ROI Labs" /></a>
            <div className="nv-links">
              <a href="/#process">How it works</a>
              <a href="/integrations">Integrations</a>
              <a href="/audit">Free audit</a>
              <a href="/#plans">Plans</a>
              <a href="/#faq">FAQ</a>
            </div>
            <a href="/engine?login=1" className="btn btn-pri">Login</a>
          </div>
        </nav>
      </div>

      <section className="ig-hero">
        <div className="wrap">
          <p className="ey">Integrations</p>
          <h1>Connect ROI Labs to your <span className="grad">revenue stack.</span></h1>
          <p className="l">
            Bring ad spend, store revenue and conversion signals into one AI-native engine — so every
            campaign is measured against the outcome it actually drove: store revenue reconciled to
            Shopify, app installs and cost-per-install, or qualified leads — not the vanity metrics each
            platform reports about itself.
          </p>
          <div className="ig-search">
            <span dangerouslySetInnerHTML={{ __html: I_SEARCH }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search integrations…"
              aria-label="Search integrations"
            />
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          {q.trim() ? (
            filtered.length ? (
              <div className="ig-grid">
                {filtered.map((it) => <Card key={it.name} it={it} />)}
              </div>
            ) : (
              <p className="ig-empty">No integrations match “{q}”. <a href="/#contact" style={{ color: "var(--gold-text)", fontWeight: 700 }}>Tell us what you need →</a></p>
            )
          ) : (
            SECTIONS.map((s) => {
              const list = ITEMS.filter((i) => i.sec === s.id);
              return (
                <div className="ig-sec" key={s.id}>
                  <div className="ig-sechead">
                    <h2>{s.id}</h2>
                    <span className="ct">{s.sub}</span>
                  </div>
                  <div className="ig-grid">
                    {list.map((it) => <Card key={it.name} it={it} />)}
                  </div>
                </div>
              );
            })
          )}

          <div className="ig-cta">
            <div className="in">
              <h2>Missing an integration?</h2>
              <p>Tell us what you want to connect. The engine is built to expand with your stack — if revenue flows through it, we can measure against it.</p>
              <a href="/#contact" className="btn btn-pri btn-lg">Request an integration →</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="fgrid">
            <div className="fbrand">
              <img src={`${BP}/roi-logo-light.png`} alt="ROI Labs" />
              <p className="ft">AI-native paid media for growth brands on Meta &amp; Google. Measured by the outcome that matters — revenue, installs, or leads.</p>
              <div className="fsoc">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" dangerouslySetInnerHTML={{ __html: LINKEDIN }} />
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" dangerouslySetInnerHTML={{ __html: XICON }} />
              </div>
            </div>
            <div className="fcol">
              <h5>Company</h5>
              <a href="/#system">The system</a>
              <a href="/#process">How it works</a>
              <a href="/integrations">Integrations</a>
              <a href="/#plans">Plans</a>
            </div>
            <div className="fcol">
              <h5>Services</h5>
              <span className="fl">Paid media</span>
              <span className="fl">Creative engine</span>
              <span className="fl">Landing &amp; CRO</span>
              <span className="fl">Measurement</span>
            </div>
            <div className="fcol">
              <h5>Get in touch</h5>
              <a href="/#contact">Book an audit</a>
              <a href="mailto:support@roilabs.in">support@roilabs.in</a>
            </div>
          </div>
          <div className="fbar2"><span>© 2026 ROI Labs. All rights reserved.</span><span>support@roilabs.in</span></div>
        </div>
      </footer>
    </div>
  );
}
