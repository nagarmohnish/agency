"use client";

const principles = [
  {
    number: "01",
    title: "Performance-driven",
    description: "Every decision is backed by data. We optimize for outcomes that matter to your bottom line.",
  },
  {
    number: "02",
    title: "Transparent",
    description: "No black boxes. You see exactly what we do and what results it produces.",
  },
  {
    number: "03",
    title: "Agile",
    description: "Markets move fast. We adapt strategies weekly based on real-time data.",
  },
  {
    number: "04",
    title: "Partnership",
    description: "We're an extension of your team, invested in your long-term success.",
  },
];

const stats = [
  { value: "$8M+", label: "Budget handled", color: "text-[var(--accent-green)]" },
  { value: "4.2x", label: "Avg. ROI delivered", color: "text-[var(--accent-orange)]" },
  { value: "45+", label: "Brands worked with", color: "text-[var(--accent-blue)]" },
  { value: "$34M", label: "Revenue generated", color: "text-[var(--accent-purple)]" },
];

export default function About() {
  return (
    <section id="about" className="section relative bg-[var(--color-subtle)]">
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-24">
          {/* Left */}
          <div>
            <span className="badge mb-8 inline-block">
              <span className="dot" />
              About Us
            </span>
            <h2 className="text-headline text-[var(--text-primary)] mb-8">
              A focused team that{" "}
              <span className="text-gradient">delivers</span>
            </h2>
            <div className="space-y-5 text-body-lg mb-10">
              <p className="text-[var(--text-secondary)]">
                We&apos;re a boutique performance marketing agency. We don&apos;t try to do
                everything—we specialize in paid social advertising and the creative
                that makes it work.
              </p>
              <p className="text-[var(--text-muted)]">
                Our team has managed millions in ad spend across Meta, Google, LinkedIn,
                and Snapchat. We know what moves the needle.
              </p>
            </div>
            <a href="#contact" className="btn-primary">
              Work with us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Right - Stats */}
          <div className="glass-card-glow p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-[2px] bg-gradient-to-r from-[var(--accent-green)] to-transparent" />
              <span className="text-micro text-[var(--accent-green)]">By The Numbers</span>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, i) => (
                <div key={stat.label} className="relative">
                  <p className={`stat-number mb-2 ${stat.color}`}>{stat.value}</p>
                  <p className="text-small text-[var(--text-muted)]">{stat.label}</p>
                  {i < stats.length - 2 && (
                    <div className="absolute -bottom-4 left-0 right-0 divider-gradient" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Principles */}
        <div>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-[2px] bg-gradient-to-r from-[var(--accent-green)] to-transparent" />
            <span className="text-micro text-[var(--accent-green)]">How We Work</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="glass-card p-8 group"
              >
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
        </div>
      </div>
    </section>
  );
}
