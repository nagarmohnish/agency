export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Diagonal dotted texture backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage:
            "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.9), transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.9), transparent 70%)",
        }}
      />

      {/* Soft green-tinted wash behind the headline */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "min(900px, 90vw)",
          height: 500,
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.12), rgba(34,197,94,0.04) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 pt-36 pb-28 lg:pt-44 lg:pb-36 text-center">
        <h1 className="text-display text-white mb-8 max-w-4xl mx-auto">
          Performance marketing and AI automation for{" "}
          <span className="text-[var(--accent-green)]">ambitious brands</span>
        </h1>

        <p className="text-body-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-14">
          We help growth-stage companies scale paid media and build custom AI
          systems — measured in real revenue, not vanity metrics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-6">
          <div className="flex flex-col items-center gap-2">
            <a href="/#performance" className="btn-dark">
              Performance Marketing
            </a>
            <span className="text-xs text-[var(--text-muted)]">Grow with paid media</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <a href="/#ai" className="btn-primary">
              AI Automation
            </a>
            <span className="text-xs text-[var(--text-muted)]">Custom AI systems</span>
          </div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-px bg-[var(--border-subtle)]" />
      </div>
    </section>
  );
}
