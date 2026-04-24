const performanceCards = [
  {
    title: "Platform expertise",
    desc: "Meta, Google, LinkedIn, and Snap ads managed end-to-end. From targeting to creative testing and bid strategy.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Creative studio",
    desc: "Performance-first ad creative, UGC video production, high-converting landing pages, and brand systems.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    title: "Measurement & reporting",
    desc: "Attribution modeling, incrementality testing, and real-time dashboards that show what's actually working.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
];

const aiCards = [
  {
    title: "AI agents & workflows",
    desc: "Autonomous multi-step agents that handle research, outreach, and internal ops across your tool stack.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
      </svg>
    ),
  },
  {
    title: "Custom chatbots",
    desc: "Branded LLM assistants trained on your knowledge base — for sales, support, and internal productivity.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Marketing automation",
    desc: "AI-driven ad copy, creative iteration, audience scoring, and campaign optimization at scale.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <>
      {/* === CHAPTER 01: PERFORMANCE === */}
      <ProductSection
        id="performance"
        index="01"
        chapter="ROI Labs / Performance"
        title="Paid media that pays back."
        description="Revenue-focused paid media across Meta, Google, LinkedIn, and Snap — executed by the same team that writes the creative brief and reads the P&L. No handoffs, no theater."
        cards={performanceCards}
        iconStyle="filled"
        ctaHref="/#contact"
        ctaLabel="Explore Performance"
      />

      {/* === YELLOW TRANSITION BAND === */}
      <TransitionBand />

      {/* === CHAPTER 02: AI === */}
      <ProductSection
        id="ai"
        index="02"
        chapter="ROI Labs / AI"
        title="Custom AI, built for your workflow."
        description="Bespoke AI systems for brands that need more than a chatbot. We scope, build, and deploy custom automation that sits inside your stack — not next to it."
        cards={aiCards}
        iconStyle="outlined"
        ctaHref="/#contact"
        ctaLabel="Explore AI"
      />
    </>
  );
}

function ProductSection({
  id,
  index,
  chapter,
  title,
  description,
  cards,
  iconStyle,
  ctaHref,
  ctaLabel,
}: {
  id: string;
  index: string;
  chapter: string;
  title: string;
  description: string;
  cards: { title: string; desc: string; icon: React.ReactNode }[];
  iconStyle: "filled" | "outlined";
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section
      id={id}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Massive background chapter number */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -top-6 md:-top-10 right-[-20px] md:right-[-10px] text-[14rem] md:text-[22rem] leading-none font-bold"
        style={{
          color: "transparent",
          WebkitTextStroke: "1px rgba(250,204,21,0.12)",
        }}
      >
        {index}
      </span>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="text-xs md:text-sm font-mono tracking-[0.18em] uppercase text-[var(--accent-yellow)] mb-6">
            <span className="text-white/40 mr-2">{index}</span>
            / {chapter}
          </p>
          <h2 className="text-headline text-white mb-6">{title}</h2>
          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 mb-14">
          {cards.map((c) => (
            <div
              key={c.title}
              className="glass-card p-7 flex flex-col gap-4"
            >
              <IconTile icon={c.icon} variant={iconStyle} />
              <h3 className="text-lg font-semibold text-white m-0">{c.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed m-0">
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        <a href={ctaHref} className="btn-primary">
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}

function IconTile({
  icon,
  variant,
}: {
  icon: React.ReactNode;
  variant: "filled" | "outlined";
}) {
  if (variant === "filled") {
    // Performance style — solid yellow tile with black icon
    return (
      <div
        className="w-11 h-11 rounded-md flex items-center justify-center text-black"
        style={{ background: "var(--accent-yellow)" }}
      >
        {icon}
      </div>
    );
  }
  // AI style — outlined tile with yellow icon
  return (
    <div
      className="w-11 h-11 rounded-md flex items-center justify-center text-[var(--accent-yellow)]"
      style={{
        background: "transparent",
        border: "1px solid rgba(250,204,21,0.45)",
      }}
    >
      {icon}
    </div>
  );
}

function TransitionBand() {
  return (
    <div className="relative overflow-hidden" style={{ background: "var(--accent-yellow)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <p className="text-xs md:text-sm font-mono tracking-[0.18em] uppercase text-black/70 m-0">
          01 → 02
        </p>
        <h3 className="text-3xl md:text-5xl font-bold text-black tracking-tight m-0 md:text-right leading-tight">
          We also build <span className="italic font-serif">custom AI</span> systems.
        </h3>
      </div>
    </div>
  );
}
