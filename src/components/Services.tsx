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
      {/* PERFORMANCE MARKETING */}
      <ProductSection
        id="performance"
        pre={<span><span className="text-white">ROI Labs</span> Performance</span>}
        title="Paid media that pays back."
        description="Revenue-focused paid media across Meta, Google, LinkedIn, and Snap — executed by the same team that writes the creative brief and reads the P&L. No handoffs, no theater."
        cards={performanceCards}
        ctaHref="/#contact"
        ctaLabel="Explore Performance"
      />

      {/* AI AUTOMATION */}
      <ProductSection
        id="ai"
        pre={<span><span className="text-white">ROI Labs</span> AI</span>}
        title="Custom AI, built for your workflow."
        description="Bespoke AI systems for brands that need more than a chatbot. We scope, build, and deploy custom automation that sits inside your stack — not next to it."
        cards={aiCards}
        ctaHref="/#contact"
        ctaLabel="Explore AI Automation"
      />
    </>
  );
}

function ProductSection({
  id,
  pre,
  title,
  description,
  cards,
  ctaHref,
  ctaLabel,
}: {
  id: string;
  pre: React.ReactNode;
  title: string;
  description: string;
  cards: { title: string; desc: string; icon: React.ReactNode }[];
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section id={id} className="py-24 md:py-32 border-b border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-sm text-[var(--accent-green)] font-medium mb-4">
            {pre}
          </p>
          <h2 className="text-headline text-white mb-6">{title}</h2>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 mb-14">
          {cards.map((c) => (
            <div
              key={c.title}
              className="glass-card p-7 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-md bg-[var(--color-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-green)]">
                {c.icon}
              </div>
              <h3 className="text-lg font-semibold text-white m-0">{c.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed m-0">
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href={ctaHref} className="btn-primary">
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
