export default function WhichPath() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--accent-yellow)" }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20 md:py-24 text-center">
        <p className="text-xs font-serif tracking-[0.18em] uppercase text-black/60 mb-5">
          Start a conversation
        </p>
        <h2 className="text-4xl md:text-6xl text-black tracking-tight mb-4" style={{ fontFamily: "var(--font-logo-serif), 'DM Serif Display', Georgia, serif", fontWeight: 400, lineHeight: 1.05 }}>
          Not sure which is right for you?
        </h2>
        <p className="text-black/70 mb-10 text-base md:text-lg">
          Tell us about your business and we&apos;ll recommend the path that fits.
        </p>
        <a
          href="/#contact"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-black text-white text-sm font-semibold tracking-wide hover:bg-neutral-900 transition-colors"
        >
          Book a call
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
