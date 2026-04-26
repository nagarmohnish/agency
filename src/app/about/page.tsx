import Link from "next/link";

export const metadata = {
  title: "About Us | ROIlabs",
  description:
    "We're a boutique performance marketing agency specializing in paid social advertising. Meet the team behind $8M+ in managed ad spend and $34M in revenue generated.",
  keywords: [
    "about roilabs",
    "performance marketing agency",
    "paid social agency",
    "advertising team",
    "marketing experts",
  ],
};

const principles = [
  {
    number: "01",
    title: "Performance-driven",
    description:
      "Every decision is backed by data. We optimize for outcomes that matter to your bottom line — not vanity metrics.",
  },
  {
    number: "02",
    title: "Transparent",
    description:
      "No black boxes. You see exactly what we do, what we spend, and what results it produces. Full visibility, always.",
  },
  {
    number: "03",
    title: "Agile",
    description:
      "Markets move fast. We adapt strategies weekly based on real-time data, not quarterly reports that arrive too late.",
  },
  {
    number: "04",
    title: "Partnership",
    description:
      "We're an extension of your team, invested in your long-term success — not just the next invoice.",
  },
];

const stats = [
  { value: "$8M+", label: "Ad budget managed", color: "text-[var(--accent-green)]" },
  { value: "4.2x", label: "Average ROI delivered", color: "text-[var(--accent-orange)]" },
  { value: "45+", label: "Brands partnered with", color: "text-[var(--accent-blue)]" },
  { value: "$34M", label: "Revenue generated", color: "text-[var(--accent-purple)]" },
];

const capabilities = [
  "Meta Ads (Facebook, Instagram, Messenger)",
  "Google Ads (Search, Display, YouTube, PMax)",
  "Snapchat Ads (AR, Stories, Spotlight)",
  "LinkedIn Ads (Sponsored, InMail, ABM)",
  "Creative production & landing pages",
  "Full-funnel strategy & reporting",
];

export default function AboutPage() {
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

      {/* Hero */}
      <section className="section relative bg-[var(--color-base)]">
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="badge mb-6 inline-block">
              <span className="dot" />
              About Us
            </span>
            <h1 className="text-headline mb-6">
              A focused team that{" "}
              <span className="text-gradient">delivers</span>
            </h1>
            <p className="text-body-lg text-[var(--text-secondary)]">
              We&apos;re a boutique performance marketing agency. We don&apos;t try to do
              everything — we specialize in paid social advertising and the creative
              that makes it work.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <p className={`stat-number mb-2 ${stat.color}`}>{stat.value}</p>
                <p className="text-small text-[var(--text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="section-gradient-divider" />
        </div>
      </section>

      {/* Story */}
      <section className="relative pb-20 bg-[var(--color-base)]">
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
            {/* Left — Story */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-[2px] bg-gradient-to-r from-[var(--accent-green)] to-transparent" />
                <span className="text-micro text-[var(--accent-green)]">Our Story</span>
              </div>
              <div className="space-y-5 text-body-lg">
                <p className="text-[var(--text-secondary)]">
                  ROIlabs was born from a simple frustration: most agencies report ROAS
                  because it always looks impressive — even when their clients are losing money.
                </p>
                <p className="text-[var(--text-secondary)]">
                  We saw brands celebrating 4x ROAS while quietly bleeding cash once they factored in
                  product costs, shipping, returns, and agency fees. It didn&apos;t add up.
                </p>
                <p className="text-[var(--text-secondary)]">
                  So we built an agency that optimizes for what actually matters:{" "}
                  <strong className="text-[var(--text-primary)]">ROI</strong>. Real profit that hits your
                  bank account — not vanity metrics that look good on a slide deck.
                </p>
                <p className="text-[var(--text-muted)]">
                  Our team has managed millions in ad spend across Meta, Google, LinkedIn, and Snapchat.
                  We know what moves the needle — and what doesn&apos;t.
                </p>
              </div>
            </div>

            {/* Right — Capabilities */}
            <div className="glass-card-glow p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-[2px] bg-gradient-to-r from-[var(--accent-orange)] to-transparent" />
                <span className="text-micro text-[var(--accent-orange)]">What We Do</span>
              </div>
              <ul className="space-y-5">
                {capabilities.map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[var(--accent-green)] flex-shrink-0" />
                    <span className="text-body text-[var(--text-secondary)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="section-gradient-divider" />
      </div>

      {/* Principles */}
      <section className="section relative bg-[var(--color-base)]">
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-[2px] bg-gradient-to-r from-[var(--accent-green)] to-transparent" />
            <span className="text-micro text-[var(--accent-green)]">How We Work</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
            {principles.map((principle) => (
              <div key={principle.title} className="glass-card p-8 group">
                <span className="text-[var(--accent-green)] text-sm font-bold mb-5 block opacity-60 group-hover:opacity-100 transition-opacity">
                  {principle.number}
                </span>
                <h4 className="text-[var(--text-primary)] font-semibold mb-3 group-hover:text-[var(--accent-orange)] transition-colors">
                  {principle.title}
                </h4>
                <p className="text-small text-[var(--text-muted)] group-hover:text-[var(--text-body)] transition-colors">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="glass-card-glow p-8 md:p-10">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <h3 className="text-subhead text-[var(--text-primary)] mb-3">
                  Ready to work with a team that{" "}
                  <span className="text-gradient">cares about your profit</span>?
                </h3>
                <p className="text-body text-[var(--text-secondary)]">
                  Send your last 90 days of campaigns. We&apos;ll come back with a clear read.
                </p>
              </div>
              <Link href="/#contact" className="btn-primary whitespace-nowrap">
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
