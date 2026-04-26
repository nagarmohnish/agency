// Three-step methodology section. Modern agency staple — communicates how the
// engagement actually works without padding it with corporate vagueness.

const steps = [
  {
    n: "01",
    title: "Audit",
    label: "Week 1",
    desc: "We pull your last 90 days from Meta and Google, map spend to actual revenue, and identify the highest-leverage fixes — usually wasted spend, broken tracking, or weak creative.",
    points: ["Account audit", "Tracking review", "Competitive landscape"],
  },
  {
    n: "02",
    title: "Build",
    label: "Weeks 2-4",
    desc: "Restructure campaigns around what's actually working. Ship fresh creative the same week. Stand up proper measurement so we can read what's happening daily — not in a monthly report.",
    points: ["Campaign restructure", "Creative production", "GA4 + server-side tracking"],
  },
  {
    n: "03",
    title: "Scale",
    label: "Month 2 onward",
    desc: "Weekly creative iteration. Holdout-tested incrementality. Ruthless budget reallocation toward what compounds. Reporting that ties paid spend back to bank-account revenue.",
    points: ["Weekly creative", "Incrementality testing", "P&L-anchored reporting"],
  },
];

export default function Process() {
  return (
    <section id="process" className="relative py-28 md:py-36 border-t border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-yellow)] mb-5 font-medium">
              <span className="text-white/40 mr-3">03</span>Process
            </p>
            <h2 className="text-headline text-white">
              How the first 60 days run.
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] max-w-md">
            No discovery month, no kickoff theater. Audit in week one, ship in
            week two, scale from week three onward.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-[var(--card-border)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
          {steps.map((s) => (
            <div key={s.n} className="bg-[var(--card-bg)] p-8 md:p-10 flex flex-col">
              <div className="flex items-baseline justify-between mb-8">
                <span
                  className="text-[3rem] leading-none text-[var(--accent-yellow)] italic"
                  style={{ fontFamily: "var(--font-logo-serif), 'DM Serif Display', Georgia, serif", fontWeight: 400 }}
                >
                  {s.n}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {s.label}
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-white mb-4">{s.title}</h3>
              <p className="text-[var(--text-secondary)] text-[0.925rem] leading-relaxed mb-8">
                {s.desc}
              </p>

              <ul className="space-y-1.5 mt-auto pt-6 border-t border-[var(--border-subtle)]">
                {s.points.map((p) => (
                  <li key={p} className="text-xs text-[var(--text-muted)] tracking-wide">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
