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
const L_GOOGLE = `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"/></svg>`;
const L_META = `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#0081FB" d="M3.4 14.5c0 1.3.3 2.3.7 2.9.5.8 1.2 1.1 2 1.1 1 0 1.8-.2 3.4-2.5 1.3-1.8 2.8-4.4 3.8-6l1.7-2.6c1.2-1.8 2.6-3.8 4.2-3.8 1.3 0 2.3 1.2 2.3 3v6.6c0 1.8-.4 2.8-1.2 2.8-.7 0-1.3-.5-2.4-2.3l-1.5-2.5-1.3 2.1c1.5 2.4 2.8 4.2 5 4.2 2 0 3.2-1.8 3.2-4.7V9c0-3.4-1.6-5.7-4.3-5.7-1.9 0-3.4 1.4-4.9 3.7L13 9.7l-1.6-2.6C9.6 4.4 8.1 3.3 6.3 3.3 4 3.3 2 5.7 2 9.4l1.4 5.1z"/><path fill="#0064E1" d="M3.4 14.5c0 1.3.3 2.3.7 2.9.5.8 1.2 1.1 2 1.1 1 0 1.8-.2 3.4-2.5 1.3-1.8 2.8-4.4 3.8-6l1.7-2.6c1.2-1.8 2.6-3.8 4.2-3.8 1.3 0 2.3 1.2 2.3 3"/><path fill="none" stroke="#0064E1" stroke-width="0"/></svg>`;
const L_TIKTOK = `<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#010101" d="M16.6 5.8a4.3 4.3 0 0 1-1-2.8h-3.1v11.5a2.4 2.4 0 1 1-2.4-2.4c.2 0 .5 0 .7.1V9a5.5 5.5 0 1 0 4.8 5.5V8.7a7.3 7.3 0 0 0 4 1.2V6.8a4.3 4.3 0 0 1-3-1z"/></svg>`;
const L_LINKEDIN = `<svg width="22" height="22" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.45 20.45h-3.55v-5.57c0-1.33 0-3.04-1.85-3.04s-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>`;
const L_PINTEREST = `<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#E60023" d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.5-.2 1 .5 1.9 1.6 1.9 2 0 3.3-2.5 3.3-5.5 0-2.3-1.5-4-4.3-4a4.9 4.9 0 0 0-5.1 4.9c0 1 .3 1.6.8 2.1.2.2.2.3.1.6l-.2.8c-.1.3-.3.4-.6.2-1.2-.5-1.8-1.9-1.8-3.4 0-2.6 2.2-5.7 6.5-5.7 3.5 0 5.8 2.5 5.8 5.2 0 3.6-2 6.3-4.9 6.3-1 0-1.9-.5-2.2-1.1l-.6 2.4c-.2.8-.7 1.6-1 2.1A10 10 0 1 0 12 2z"/></svg>`;
const L_SNAP = `<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#FFFC00" stroke="#222" stroke-width=".4" d="M12 2.2c2.2 0 3.9 1.7 4 4 .1 1 0 1.9.1 2.3.1.2.4.3.7.2.3-.1.7-.2 1 .1.4.4.1.9-.4 1.1-.4.3-1.1.5-1.3.9-.1.4 1 1.8 2.4 2.5.4.2.3.6 0 .8-.5.3-1.2.3-1.5.6-.1.3.1.8-.3 1-.4.1-1-.2-1.6-.1-.6.1-1 .8-1.9 1.1-.6.2-1.2.2-1.8 0-.9-.4-1.3-1-1.9-1.1-.6-.1-1.2.2-1.6.1-.4-.2-.2-.7-.3-1-.2-.4-1-.4-1.5-.6-.3-.2-.4-.6 0-.8 1.4-.7 2.5-2.1 2.4-2.5-.1-.4-.9-.6-1.3-.9-.5-.2-.8-.7-.4-1.1.3-.3.7-.2 1-.1.3.1.6 0 .7-.2.1-.4 0-1.3.1-2.3.1-2.3 1.8-4 4-4z"/></svg>`;
const L_SHOPIFY = `<svg width="22" height="22" viewBox="0 0 109.5 124.5"><path fill="#95BF47" d="M95.9 23.9c-.1-.6-.6-1-1.1-1-.5 0-9.3-.2-9.3-.2s-7.4-7.2-8.1-7.9c-.7-.7-2.2-.5-2.7-.3 0 0-1.4.4-3.7 1.1-.4-1.3-1-2.8-1.8-4.4-2.6-5-6.5-7.7-11.1-7.7-.3 0-.6 0-1 .1-.1-.2-.3-.3-.4-.5C53.5 1.4 50.9.3 47.8.4c-6 .2-12 4.5-16.8 12.2-3.4 5.4-6 12.2-6.7 17.5-6.9 2.1-11.7 3.6-11.8 3.7-3.5 1.1-3.6 1.2-4 4.5C8.1 40.2 0 105.9 0 105.9l71.2 12.3 30.9-7.7S96 24.5 95.9 23.9zM69.3 17.3c-1.7.5-3.7 1.1-5.8 1.8 0-3-.4-7.1-1.8-10.7 4.5.9 6.7 6 7.6 8.9zM58.8 20.4c-3.9 1.2-8.2 2.5-12.5 3.8 1.2-4.6 3.5-9.2 6.3-12.2 1-1.1 2.5-2.3 4.2-3 1.7 3.6 2.1 8.6 2 11.4zM50.2 4.4c1.4 0 2.6.3 3.6.9-1.6.8-3.2 2.1-4.6 3.6-3.7 4-6.6 10.3-7.7 16.3-3.6 1.1-7.1 2.2-10.3 3.2C33.3 19.3 41.2 4.6 50.2 4.4z"/><path fill="#5E8E3E" d="M94.8 22.9c-.5 0-9.3-.2-9.3-.2s-7.4-7.2-8.1-7.9c-.3-.3-.6-.4-1-.5l-5.4 110.4 30.9-7.7S96 24.5 95.9 23.9c-.1-.6-.6-.9-1.1-1z"/><path fill="#FFF" d="M58.3 38.4l-3.6 13.4s-4-1.8-8.7-1.5c-6.9.4-7 4.8-6.9 5.9.4 6 16.1 7.3 17 21.3.7 11-5.8 18.5-15.2 19.1-11.3.7-17.5-6-17.5-6l2.4-10.2s6.2 4.7 11.2 4.4c3.3-.2 4.4-2.9 4.3-4.7-.5-7.8-13.3-7.4-14.1-20.2-.7-10.7 6.3-21.6 21.9-22.6 6-.4 9.1 1.1 9.1 1.1z"/></svg>`;
const L_WOO = `<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#7F54B3" d="M2.2 4.8h19.6c1.2 0 2.2 1 2.2 2.2v7.3c0 1.2-1 2.2-2.2 2.2H14.8l1.9 4.7-8.4-4.7H2.2c-1.2 0-2.2-1-2.2-2.2V7c0-1.2 1-2.2 2.2-2.2z"/><path fill="#fff" d="M2.6 6.9c.3-.4.7-.6 1.2-.6.7-.1 1.1.3 1.2 1 .4 2.7.8 5 1.2 6.9l2.4-4.6c.2-.4.5-.6.9-.7.6 0 .9.3 1.1 1.1.3 1.7.6 3.1.9 4.3.6-2.9 1.6-5 3-6.3.4-.4.8-.5 1.2-.6.4 0 .7.1 1 .4.3.3.4.6.4 1 0 .3-.1.6-.3.9-1.2 2.2-2.1 5.8-2.6 10.7-.1.6-.4 1-.8 1-.4 0-.8-.3-1.2-1-1-2-1.8-4-2.4-6.3-.7 1.5-1.3 2.6-1.7 3.4-.7 1.4-1.4 2.2-1.9 2.3-.4 0-.8-.4-1.1-1.2C5 16.3 4.3 12.6 3.4 8c-.1-.5 0-.9.2-1.1z"/></svg>`;
const L_GA4 = `<svg width="22" height="22" viewBox="0 0 24 24"><rect x="15" y="3" width="5" height="18" rx="2.5" fill="#F9AB00"/><rect x="9" y="9" width="5" height="12" rx="2.5" fill="#E37400"/><circle cx="6" cy="18.4" r="2.6" fill="#E37400"/></svg>`;
const L_HUBSPOT = `<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#FF7A59" d="M16.4 9.1V6.7a2.1 2.1 0 1 0-1.6 0v2.4a5.7 5.7 0 0 0-2.7 1.2L6 6.5a2.3 2.3 0 1 0-1 1.4l6 4.6a5.7 5.7 0 1 0 5.4-3.4zm-1.6 9a2.9 2.9 0 1 1 0-5.9 2.9 2.9 0 0 1 0 5.9z"/></svg>`;
const L_SF = `<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#00A1E0" d="M9.9 6.4a3.6 3.6 0 0 1 6.1.9 3.1 3.1 0 0 1 1.3-.3 3.2 3.2 0 0 1 .5 6.3 2.9 2.9 0 0 1-3.6 3 3.3 3.3 0 0 1-6-.4 2.8 2.8 0 0 1-.6.1 2.9 2.9 0 0 1-1.4-5.5 3.3 3.3 0 0 1 3.7-4.1z"/></svg>`;
const L_GHL = `<svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="6.5" fill="#2563EB"/><path fill="#fff" d="M12 5.8l5 7.2h-3.3V18h-3.4v-5h-3.3l5-7.2z"/></svg>`;
const L_PIPE = `<svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="6.5" fill="#21A84C"/><path fill="#fff" d="M12.6 6.7c-1.3 0-2.3.5-2.9 1.3l-.1-1.1H7.2c0 .6.1 1.2.1 2v9.4h2.6v-3.8c.6.6 1.4.9 2.5.9 2.4 0 4.3-1.8 4.3-4.4 0-2.6-1.7-4.3-4.1-4.3zm-.5 6.5c-1.2 0-2-.9-2-2.2 0-1.3.8-2.1 2-2.1s2 .9 2 2.1c0 1.3-.8 2.2-2 2.2z"/></svg>`;
const L_AIR = `<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#2D7FF9" d="M11.6 4.2 4.3 7.1c-.4.2-.4.7 0 .9l7.3 2.9c.3.1.6.1.9 0l7.3-2.9c.4-.2.4-.7 0-.9l-7.3-2.9c-.3-.1-.6-.1-.9 0z"/><path fill="#FFBF00" d="M12.4 12.1v7.4c0 .3.3.6.7.4l6.6-2.6c.2-.1.4-.3.4-.6V9.7c0-.3-.4-.5-.7-.4l-6.6 2.6c-.3.1-.4.2-.4.6z"/><path fill="#FF3D71" d="M4 9.2v6.2c0 .2.1.4.3.5l5.6 2.7c.3.1.5-.1.5-.4v-6.2c0-.2-.1-.4-.3-.5L4.5 8.8c-.2-.1-.5.1-.5.4z"/></svg>`;

type Status = "live" | "soon";
type Integ = { name: string; cat: string; sec: string; desc: string; status: Status; logo: string; feat?: boolean };

const SEC_ADS = "Ad platforms";
const SEC_REV = "Revenue & e-commerce";
const SEC_MEAS = "Measurement & CRM";

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
];

const SECTIONS = [
  { id: SEC_ADS, sub: "Where spend goes" },
  { id: SEC_REV, sub: "Where revenue is measured" },
  { id: SEC_MEAS, sub: "Where it all gets attributed" },
];

function Logo({ svg }: { svg: string }) {
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
              <a href="/#system">Solutions</a>
              <a href="/blog">Blog</a>
              <a href="/integrations">Integrations</a>
              <a href="/audit">Audit</a>
              <a href="/#plans">Pricing</a>
              <a href="/#faq">FAQ</a>
            </div>
            <a href="/#contact" className="btn btn-pri">Book your audit</a>
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
              <img src={`${BP}/roi-logo-dark.png`} alt="ROI Labs" />
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
