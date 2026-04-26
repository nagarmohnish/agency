// Two-tier platform showcase: Meta + Google get hero treatment as the primary
// channels we run. Secondary platforms sit in a smaller row below. Then a row
// of cross-channel capabilities (creative, landing, measurement, reporting).

const primary = [
  {
    name: "Meta Ads",
    chip: "Primary",
    headline: "Facebook · Instagram · Messenger · Reels",
    description:
      "Full-funnel paid social — from cold prospecting to retargeting and catalog sales. Creative-led campaigns built around what converts on platform.",
    capabilities: [
      "Conversion campaigns",
      "Lead generation",
      "Catalog & dynamic ads",
      "Reels-native creative",
      "Advantage+ Shopping",
      "Pixel & CAPI setup",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94z" />
      </svg>
    ),
  },
  {
    name: "Google Ads",
    chip: "Primary",
    headline: "Search · Performance Max · YouTube · Demand Gen",
    description:
      "Search intent + visual demand, run together. Tightly structured campaigns, real keyword discipline, and Performance Max that doesn't burn your budget.",
    capabilities: [
      "Search & shopping",
      "Performance Max",
      "YouTube ads",
      "Demand Gen",
      "Tag manager & GA4",
      "Negative-keyword discipline",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.19-1.79 4.13-1.15 1.15-2.93 2.4-6.05 2.4-4.83 0-8.6-3.89-8.6-8.72s3.77-8.72 8.6-8.72c2.6 0 4.5 1.03 5.91 2.35l2.31-2.31C18.75 1.44 16.13 0 12.48 0 5.87 0 .31 5.39.31 12s5.56 12 12.17 12c3.57 0 6.27-1.17 8.37-3.36 2.16-2.16 2.84-5.21 2.84-7.67 0-.76-.05-1.47-.17-2.05H12.48z" />
      </svg>
    ),
  },
];

const secondary = [
  {
    name: "LinkedIn Ads",
    desc: "B2B targeting, ABM lists, lead gen forms.",
  },
  {
    name: "Snapchat Ads",
    desc: "Gen Z reach, AR lenses, creative-first formats.",
  },
  {
    name: "Programmatic",
    desc: "Display, native, and direct deal placements.",
  },
];

const capabilities = [
  {
    n: "01",
    title: "Strategy",
    desc: "Channel mix, audience architecture, budget allocation grounded in margin math — not vanity ROAS.",
  },
  {
    n: "02",
    title: "Creative",
    desc: "Static, motion, and UGC-style ad creative built and shipped weekly. Tested at the asset level, not the campaign level.",
  },
  {
    n: "03",
    title: "Landing pages",
    desc: "High-converting pages designed for ad traffic — fast, mobile-first, A/B-ready.",
  },
  {
    n: "04",
    title: "Measurement",
    desc: "GA4, server-side tracking, attribution modeling, and weekly reporting that shows revenue, not just clicks.",
  },
];

export default function Services() {
  return (
    <section id="platforms" className="relative py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-yellow)] mb-5 font-medium">
              <span className="text-white/40 mr-3">01</span>Platforms
            </p>
            <h2 className="text-headline text-white">
              Two channels. Done properly.
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] max-w-md">
            Meta and Google are 90% of the work for most brands we run.
            We run them in-house, end to end. Other channels added when they earn it.
          </p>
        </div>

        {/* Primary platforms — Meta + Google */}
        <div className="grid md:grid-cols-2 gap-px bg-[var(--card-border)] border border-[var(--card-border)] rounded-2xl overflow-hidden mb-6">
          {primary.map((p) => (
            <div key={p.name} className="bg-[var(--card-bg)] p-8 md:p-10 flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-yellow)]">
                  {p.icon}
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] border border-[var(--border-subtle)] px-2 py-1 rounded">
                  {p.chip}
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-white mb-2">{p.name}</h3>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)] mb-5">
                {p.headline}
              </p>
              <p className="text-[var(--text-secondary)] text-[0.95rem] leading-relaxed mb-8">
                {p.description}
              </p>

              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mt-auto">
                {p.capabilities.map((cap) => (
                  <li key={cap} className="flex items-center gap-2 text-[0.825rem] text-[var(--text-secondary)]">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent-yellow)] flex-shrink-0" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Secondary platforms — small row */}
        <div className="grid md:grid-cols-3 gap-3">
          {secondary.map((s) => (
            <div
              key={s.name}
              className="px-5 py-4 border border-[var(--border-subtle)] rounded-lg bg-[var(--color-base)] flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-white m-0">{s.name}</p>
                <p className="text-xs text-[var(--text-muted)] m-0 mt-0.5">{s.desc}</p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Add-on
              </span>
            </div>
          ))}
        </div>

        {/* Capabilities — wrap-around services */}
        <div className="mt-28">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-yellow)] mb-5 font-medium">
                <span className="text-white/40 mr-3">02</span>Capabilities
              </p>
              <h2 className="text-headline text-white">
                Everything that makes the ads work.
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--card-border)] border border-[var(--card-border)] rounded-xl overflow-hidden">
            {capabilities.map((c) => (
              <div key={c.title} className="bg-[var(--card-bg)] p-7">
                <p className="text-xs text-[var(--text-muted)] tracking-wider mb-5">
                  {c.n}
                </p>
                <h4 className="text-base font-semibold text-white mb-3">{c.title}</h4>
                <p className="text-[0.85rem] text-[var(--text-secondary)] leading-relaxed m-0">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
