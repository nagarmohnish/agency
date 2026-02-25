import Calculator from "@/components/Calculator";
import Link from "next/link";

export const metadata = {
  title: "ROAS vs ROI Calculator | Honey & Lemon",
  description:
    "Free ROAS vs ROI calculator. Enter your ad spend, revenue, and costs to discover whether your campaigns are actually profitable. Multi-currency support included.",
  keywords: [
    "ROAS calculator",
    "ROI calculator",
    "ad spend calculator",
    "return on ad spend",
    "return on investment",
    "advertising ROI",
    "paid ads calculator",
  ],
};

export default function CalculatorPage() {
  return (
    <div className="relative min-h-screen bg-[var(--color-base)]">
      {/* Back link */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 pt-32">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-small text-[var(--text-muted)] hover:text-[var(--accent-green)] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Back to home
        </Link>
      </div>

      {/* Calculator */}
      <Calculator />

      {/* Explanation section */}
      <section className="relative pb-20 bg-[var(--color-base)]">
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
          <div className="section-gradient-divider mb-16" />

          <div className="grid md:grid-cols-2 gap-10">
            {/* ROAS explanation */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)] border-[3px] border-[var(--card-border)] flex items-center justify-center shadow-[2px_3px_0_rgba(0,0,0,0.1)]">
                  <span className="text-white font-black text-xs">R</span>
                </div>
                <h3 className="text-subhead text-[var(--text-primary)]">What is ROAS?</h3>
              </div>
              <p className="text-body text-[var(--text-secondary)] mb-4">
                <strong className="text-[var(--text-primary)]">Return on Ad Spend</strong> measures how
                much revenue you earn for every dollar spent on advertising.
              </p>
              <div className="glass-card-static p-4 mb-4">
                <p className="text-small font-bold text-[var(--accent-blue)] text-center">
                  ROAS = Revenue &divide; Ad Spend
                </p>
              </div>
              <p className="text-small text-[var(--text-muted)]">
                A 4x ROAS means you earn $4 in revenue for every $1 spent on ads. Sounds great — but
                it doesn&apos;t account for product costs, shipping, returns, or agency fees.
              </p>
            </div>

            {/* ROI explanation */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-green)] border-[3px] border-[var(--card-border)] flex items-center justify-center shadow-[2px_3px_0_rgba(0,0,0,0.1)]">
                  <span className="text-white font-black text-xs">$</span>
                </div>
                <h3 className="text-subhead text-[var(--text-primary)]">What is ROI?</h3>
              </div>
              <p className="text-body text-[var(--text-secondary)] mb-4">
                <strong className="text-[var(--text-primary)]">Return on Investment</strong> measures
                your actual profit after all costs are deducted.
              </p>
              <div className="glass-card-static p-4 mb-4">
                <p className="text-small font-bold text-[var(--accent-green)] text-center">
                  ROI = (Profit &divide; Total Investment) &times; 100
                </p>
              </div>
              <p className="text-small text-[var(--text-muted)]">
                ROI tells you whether you&apos;re actually making money. A campaign with 5x ROAS can
                still have negative ROI if your margins are thin.
              </p>
            </div>
          </div>

          {/* Why it matters */}
          <div className="glass-card-glow p-8 md:p-10 mt-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-[2px] bg-gradient-to-r from-[var(--accent-orange)] to-transparent" />
              <span className="text-micro text-[var(--accent-orange)]">Why This Matters</span>
            </div>
            <h3 className="text-subhead text-[var(--text-primary)] mb-4">
              ROAS lies. <span className="text-gradient">ROI tells the truth.</span>
            </h3>
            <div className="space-y-4 text-body text-[var(--text-secondary)]">
              <p>
                Most agencies report ROAS because it always looks impressive. A 4x ROAS sounds like a
                home run — until you factor in product costs, shipping, returns, and agency fees and
                realize you&apos;re actually losing money.
              </p>
              <p>
                At Honey &amp; Lemon, we optimize for ROI because that&apos;s what actually hits your
                bank account. Our clients know exactly how much profit their ad spend generates.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/#contact" className="btn-primary inline-flex">
                Get your free audit
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
