const stats = [
  {
    value: "$8M+",
    label: "Ad spend managed across client portfolio.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="7" y1="15" x2="10" y2="15" />
      </svg>
    ),
  },
  {
    value: "4.2x",
    label: "Average ROI delivered across campaigns.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    value: "45+",
    label: "Brands partnered with since 2019.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: "$34M",
    label: "Revenue generated for clients.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export default function Numbers() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs md:text-sm font-serif tracking-[0.18em] uppercase text-[var(--accent-yellow)] mb-5">
            ROI Labs in Numbers
          </p>
          <h2 className="text-headline text-white mb-0">
            Performance marketing at real scale
          </h2>
          <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl mx-auto mt-6">
            Powered by a full-stack offering across paid media, creative, AI
            automation, and measurement infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--card-border)] border border-[var(--card-border)] rounded-xl overflow-hidden">
          {stats.map((s) => (
            <div
              key={s.label}
              className="card-gridded p-6 md:p-7 flex flex-col items-start gap-4"
            >
              <div className="w-10 h-10 rounded-md bg-[var(--color-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-yellow)]">
                {s.icon}
              </div>
              <div>
                <p className="stat-number text-white mb-2">{s.value}</p>
                <p className="text-sm text-[var(--text-muted)] leading-snug max-w-[24ch]">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
