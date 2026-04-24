"use client";

import { useRef } from "react";

const testimonials = [
  {
    quote:
      "After eight months of working with ROI Labs, we've come to really value the partnership — not just for the outcomes, but for how easy and collaborative it has been. It's rare to find a partner who delivers both strong results and a genuinely supportive working relationship.",
    name: "Priya Mehta",
    title: "Founder, Skincare D2C",
    initials: "PM",
    metric: "4.1x",
    metricLabel: "ROAS",
  },
  {
    quote:
      "Honestly, I couldn't believe what they claimed was even possible until I saw it firsthand. Within the first three months, ROI Labs almost doubled our revenue. The only thing stronger than their strategy is their execution. Can't recommend them enough.",
    name: "Rahul Sharma",
    title: "CMO, EdTech Platform",
    initials: "RS",
    metric: "2.5x",
    metricLabel: "Revenue growth",
  },
  {
    quote:
      "Our LinkedIn lead gen was a black box. ROI Labs set up proper attribution, refined our ICP targeting, and our pipeline from paid went from ₹12L to ₹38L a month. They're the only agency I've worked with who actually reads the P&L.",
    name: "Ananya Iyer",
    title: "Head of Growth, B2B SaaS",
    initials: "AI",
    metric: "3.2x",
    metricLabel: "Pipeline growth",
  },
  {
    quote:
      "We engaged ROI Labs for a custom AI agent that handles our outbound research. Deployed in six weeks, saving two full-time equivalents of manual work. The scoping was tight, the build was cleaner than our internal work.",
    name: "Vikram Patel",
    title: "COO, SaaS Company",
    initials: "VP",
    metric: "2 FTE",
    metricLabel: "Automated",
  },
];

export default function Testimonials() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (direction: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-card]")?.getBoundingClientRect().width ?? 320;
    el.scrollBy({ left: (cardWidth + 20) * direction, behavior: "smooth" });
  };

  return (
    <section className="py-24 md:py-28 border-b border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <h2 className="text-headline text-white m-0">Testimonials</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="w-10 h-10 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-white hover:bg-[var(--color-elevated)] transition"
              aria-label="Previous"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="w-10 h-10 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-white hover:bg-[var(--color-elevated)] transition"
              aria-label="Next"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex overflow-x-auto gap-5 snap-x snap-mandatory pb-4 -mx-6 px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              data-card
              className="glass-card p-8 md:p-9 min-w-[85%] sm:min-w-[520px] flex flex-col justify-between snap-start"
            >
              <p className="text-[var(--text-body)] leading-relaxed mb-10 text-[0.975rem]">
                {t.quote}
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-semibold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white m-0">{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)] m-0">{t.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[var(--accent-yellow)] m-0 leading-none">{t.metric}</p>
                  <p className="text-xs text-[var(--text-muted)] m-0 mt-1">{t.metricLabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
