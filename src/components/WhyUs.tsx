const reasons = [
  {
    title: "Proven playbooks",
    desc: "Battle-tested frameworks for paid media and AI deployment. We've already made the mistakes you'd otherwise fund.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="2" y1="8.5" x2="12" y2="15" />
        <line x1="22" y1="8.5" x2="12" y2="15" />
        <line x1="12" y1="22" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    title: "Integrated tech stack",
    desc: "Media buying, creative, measurement, and AI built on a single foundation so signal and spend stay in sync.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "Long-term mindset",
    desc: "We optimize for compounding revenue and contribution margin — not short-term performance spikes that cost you later.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
];

export default function WhyUs() {
  return (
    <section className="relative py-24 md:py-28 border-t border-b border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-yellow)] mb-5 font-medium">
            <span className="text-white/40 mr-3">04</span>Why ROI Labs
          </p>
          <h2 className="text-headline text-white max-w-3xl">
            Why growth-stage brands choose us.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-14 max-w-5xl mx-auto">
          {reasons.map((r) => (
            <div key={r.title}>
              <div className="flex items-center gap-3 text-[var(--accent-yellow)] mb-4">
                {r.icon}
                <h3 className="text-lg font-semibold text-white m-0">
                  {r.title}
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
