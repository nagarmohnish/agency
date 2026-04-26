export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Faint grain texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage:
            "radial-gradient(ellipse at 50% 35%, rgba(0,0,0,1) 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 35%, rgba(0,0,0,1) 0%, transparent 75%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 pt-44 pb-32 lg:pt-52 lg:pb-40">
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-yellow)] mb-8 font-medium">
            Performance marketing agency
          </p>

          <h1 className="text-display text-white mb-10">
            Paid media,
            <br />
            measured in <span className="text-[var(--accent-yellow)] italic">revenue</span>.
          </h1>

          <p className="text-body-lg text-[var(--text-secondary)] max-w-xl mb-12">
            We run Meta and Google ads end-to-end — strategy, creative, and
            measurement under one roof, optimized for what hits your bank account,
            not your dashboard.
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
            <a href="/#contact" className="btn-primary">
              Talk to us
            </a>
            <a
              href="/#platforms"
              className="inline-flex items-center gap-2 px-1 py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Or see how we work
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
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
