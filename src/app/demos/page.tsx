import type { Metadata } from "next";
import "../demos.css";

export const metadata: Metadata = {
  title: "ROI Labs — Design Demos",
  robots: { index: false, follow: false },
};

const DESIGNS = [
  {
    title: "ROI Labs — Homepage",
    tag: "Aurora Light · live",
    href: "/",
    desc: "The current homepage design (live on roilabs.in): AI-native positioning, the auto-playing 'how it works' section, plans, FAQ, and the lead popup.",
  },
  {
    title: "Stellar.ai — Hero",
    tag: "New",
    href: "/stellar",
    desc: "White Inter hero with a staggered fade-in, an auto-cycling tab bar over a looping video, and a per-tab overlay card.",
  },
  {
    title: "Handhold-style Demo",
    tag: "Exploration",
    href: "/demo",
    desc: "Light modern-SaaS layout with a two-column hero and a rotating orbital ring of agent icons.",
  },
  {
    title: "Demo Blue",
    tag: "Exploration",
    href: "/demo-blue",
    desc: "Blue-themed landing exploration.",
  },
  {
    title: "Free Audit",
    tag: "Tool",
    href: "/audit",
    desc: "The re-themed ROI Labs Auditor — target URL, email, vertical, competitors — plus report and how-it-works sections.",
  },
];

export default function DemosPage() {
  return (
    <div className="demos">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12 md:mb-16">
          <p className="text-sm font-medium tracking-[0.18em] uppercase text-[#FACC15] mb-3">
            Design demos
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">ROI Labs — landing page designs</h1>
          <p className="text-lg max-w-2xl">
            A live index of the landing-page designs in this project. Click any card to open the
            full page. Everything here runs on the dev server.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DESIGNS.map((d) => (
            <a
              key={d.href}
              href={d.href}
              className="card block rounded-2xl border border-white/10 bg-[#101015] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-[#C9C9D0] border border-white/10">
                  {d.tag}
                </span>
                <span className="text-[#FACC15] text-lg" aria-hidden>
                  →
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{d.title}</h3>
              <p className="text-sm">{d.desc}</p>
              <p className="mt-4 text-xs font-mono text-[#7A7A84]">{d.href}</p>
            </a>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-white/10 text-sm text-[#7A7A84]">
          Internal preview · not indexed · ROI Labs
        </footer>
      </div>
    </div>
  );
}
