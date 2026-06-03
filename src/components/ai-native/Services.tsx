// AI-native service architecture. Three co-equal PRIMARY pillars — Paid Media,
// AI Search & Answer Visibility (AEO/GEO), and Content & Creative — run in-house
// end to end. A row of ADD-ON channels sits below. Then "How we work": the five
// capabilities that make the growth work. Buyers don't just search anymore —
// they ask. We make you the answer wherever the decision happens.

const primary = [
  {
    name: "Paid Media",
    chip: "Primary",
    headline: "META · GOOGLE · PAID SEARCH · PAID SOCIAL",
    description:
      "Full-funnel paid media across Meta and Google, run end to end. AI in the loop for targeting, budget allocation, and creative testing — discipline on top, so spend tracks to revenue, not ROAS theater.",
    capabilities: [
      "Conversion & lead-gen campaigns",
      "Advantage+ & Performance Max",
      "Reels & YouTube creative",
      "Pixel, CAPI & server-side",
      "Catalog & shopping",
      "AI-driven budget pacing",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14zm0 3a4 4 0 100 8 4 4 0 000-8zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
      </svg>
    ),
  },
  {
    name: "AI Search & Answer Visibility",
    chip: "Primary",
    headline: "CHATGPT · PERPLEXITY · GEMINI · AI OVERVIEWS · COPILOT",
    description:
      "When someone asks an AI instead of Googling, we make sure you're the cited answer — not your competitor. Content structured for extraction, schema, and entity authority, with citation tracking so you can see it working.",
    capabilities: [
      "Answer-ready content & schema",
      "Entity & authority building",
      "Citation & share-of-model monitoring",
      "AI Overviews & AI Mode",
      "Source-trust signals (E-E-A-T)",
      "Prompt & query mapping",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M11 3l1.8 4.2L17 9l-4.2 1.8L11 15l-1.8-4.2L5 9l4.2-1.8L11 3zm7 9l1 2.3 2.3 1-2.3 1L18 21l-1-2.3-2.3-1 2.3-1L18 12z" />
      </svg>
    ),
  },
  {
    name: "Content & Creative",
    chip: "Primary",
    headline: "AD CREATIVE · UGC · VIDEO · EDITORIAL",
    description:
      "The fuel for paid and AI search both. AI-accelerated production, human-edited — static, motion, UGC, and answer-structured content, shipped weekly and tested at the asset level.",
    capabilities: [
      "Static & motion ad creative",
      "UGC-style video",
      "Answer-structured articles",
      "Landing & lifecycle copy",
      "On-brand at volume",
      "Weekly creative testing",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M4 5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm6 4v6l5-3-5-3z" />
      </svg>
    ),
  },
];

const secondary = [
  {
    name: "SEO",
    desc: "Traditional rankings still feed AI citations. Technical SEO and content that earns the trust signals AI engines pull from.",
  },
  {
    name: "Lifecycle & CRM",
    desc: "Email, SMS, and retention flows that turn acquired traffic into repeat revenue. Segmented, automated, tested.",
  },
  {
    name: "Other channels",
    desc: "LinkedIn, Snapchat, and programmatic — added when the math says they earn it.",
  },
];

const capabilities = [
  {
    n: "01",
    title: "Strategy & Growth",
    desc: "Positioning, channel mix, and budget allocation grounded in margin math and growth modeling — not vanity ROAS.",
  },
  {
    n: "02",
    title: "Creative",
    desc: "AI-accelerated production with human editorial judgment. Built and shipped weekly, tested at the asset level, not the campaign level.",
  },
  {
    n: "03",
    title: "Landing pages & CRO",
    desc: "High-converting pages for ad and AI-referred traffic — fast, mobile-first, A/B-ready.",
  },
  {
    n: "04",
    title: "Measurement",
    desc: "GA4, server-side tracking, attribution, and AI-answer visibility. Weekly reporting on revenue and where you're being found — not just clicks.",
  },
  {
    n: "05",
    title: "AI Automation & Systems",
    desc: "We build the agents and workflows that run reporting, creative ops, and optimization — so the work compounds instead of repeating.",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-yellow)] mb-5 font-medium">
              <span className="text-white/40 mr-3">01</span>Services
            </p>
            <h2 className="text-headline text-white">
              The full AI-native stack.
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] max-w-md">
            Buyers don&apos;t just search anymore — they ask. We make you the answer
            on Google, on Meta, and inside the AI tools people now trust to decide.
            Run in-house, end to end. Other channels added when they earn it.
          </p>
        </div>

        {/* Primary pillars — Paid Media + AI Search + Content */}
        <div className="grid md:grid-cols-3 gap-px bg-[var(--card-border)] border border-[var(--card-border)] rounded-2xl overflow-hidden mb-6">
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

        {/* Add-on channels — small row */}
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

        {/* How we work — the capabilities that make the growth work */}
        <div id="how-we-work" className="mt-28">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-yellow)] mb-5 font-medium">
                <span className="text-white/40 mr-3">02</span>How we work
              </p>
              <h2 className="text-headline text-white">
                Everything that makes the growth work.
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[var(--card-border)] border border-[var(--card-border)] rounded-xl overflow-hidden">
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
