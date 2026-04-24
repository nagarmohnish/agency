"use client";

function Sparkle({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[var(--color-base)]" />

      {/* Diagonal deco lines */}
      <div className="absolute top-[20%] left-0 w-full h-[2px] bg-[var(--accent-green)] opacity-[0.06] -rotate-3 pointer-events-none" />
      <div className="absolute top-[50%] left-0 w-full h-[1px] bg-[var(--accent-orange)] opacity-[0.05] rotate-2 pointer-events-none" />
      <div className="absolute bottom-[25%] left-0 w-full h-[1px] bg-[var(--accent-blue)] opacity-[0.04] -rotate-1 pointer-events-none" />

      {/* Sparkles */}
      <Sparkle className="absolute top-28 right-[18%] text-[var(--accent-yellow)] sparkle opacity-70" size={18} />
      <Sparkle className="absolute top-44 left-[10%] text-[var(--accent-green)] sparkle opacity-50" size={12} />
      <Sparkle className="absolute bottom-[28%] right-[12%] text-[var(--accent-pink)] sparkle opacity-60 hidden md:block" size={14} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-32">
        <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            <div className="mb-8">
              <span className="badge">
                <span className="dot" />
                Performance Marketing
              </span>
            </div>

            <div className="mb-6 flex justify-center lg:justify-start">
              <div className="ribbon-badge bg-[var(--accent-yellow)] text-[var(--text-primary)]" style={{ "--ribbon-rotate": "-3deg" } as React.CSSProperties}>
                <Sparkle size={10} className="text-[var(--accent-orange)]" />
                Growth Trajectory
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-display"><span className="text-[var(--accent-green)]">ROAS</span> looks good on paper.</h1>
              <h1 className="text-display mt-3"><span className="text-[var(--accent-green)]">ROI</span> looks good <span className="text-[var(--accent-orange)]">in your bank.</span></h1>
            </div>

            <p className="text-subhead text-[var(--text-body)] max-w-xl mx-auto lg:mx-0 mb-4">
              That&apos;s why we focus on <span className="text-[var(--accent-green)] font-extrabold">ROI</span> — not ROAS.
            </p>
            <p className="text-body-lg text-[var(--text-secondary)] max-w-lg mx-auto lg:mx-0 mb-10">
              Performance marketing and custom AI automation — built around
              what actually moves your business forward.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mb-14">
              <a href="#contact" className="btn-primary">
                Get your free audit
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#services" className="btn-glass">Explore services</a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 max-w-md mx-auto lg:mx-0">
            {[
              { value: "$8M+", label: "Budget handled", color: "text-[var(--accent-green)]", bg: "bg-[var(--accent-green)]" },
              { value: "4.2x", label: "Avg. ROI", color: "text-[var(--accent-orange)]", bg: "bg-[var(--accent-orange)]" },
              { value: "45+", label: "Brands", color: "text-[var(--accent-blue)]", bg: "bg-[var(--accent-blue)]" },
              { value: "$34M", label: "Revenue", color: "text-[var(--accent-purple)]", bg: "bg-[var(--accent-purple)]" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5 pt-8 text-center relative">
                <div className={`w-9 h-9 ${stat.bg} rounded-full border-[3px] border-[var(--card-border)] mx-auto absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center shadow-[2px_3px_0_rgba(0,0,0,0.1)]`}>
                  <Sparkle size={10} className="text-white" />
                </div>
                <p className={`stat-number ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">{stat.label}</p>
              </div>
            ))}
            <div className="col-span-2 flex justify-center mt-1">
              <span className="pill-badge-green border-2 border-[var(--accent-green)] rounded-full px-4 py-1.5 shadow-[2px_3px_0_rgba(0,0,0,0.06)] flex items-center gap-2 font-bold">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Performance is stable!
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        <span className="text-micro text-[var(--text-muted)]">Scroll to explore</span>
        <div className="w-7 h-11 border-[3px] border-[var(--card-border)] rounded-full flex justify-center p-2 bg-white shadow-[2px_3px_0_rgba(0,0,0,0.08)]">
          <div className="w-1.5 h-2.5 bg-[var(--accent-green)] rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
