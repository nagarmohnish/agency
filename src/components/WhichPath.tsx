// Subtle dark CTA — replaces the previous full-bleed yellow block. Yellow stays
// as accent color only.

export default function WhichPath() {
  return (
    <section className="relative py-24 md:py-32 border-t border-[var(--border-subtle)]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-yellow)] mb-6 font-medium">
          Get started
        </p>
        <h2 className="text-headline text-white mb-5">
          Want to know what your media is{" "}
          <span className="italic text-[var(--accent-yellow)]">actually</span> doing?
        </h2>
        <p className="text-[var(--text-secondary)] mb-10 text-base md:text-lg max-w-xl mx-auto">
          Send us your last 90 days. We&apos;ll come back with a clear read and a
          shortlist of fixes.
        </p>
        <a href="/#contact" className="btn-primary">
          Talk to us
        </a>
      </div>
    </section>
  );
}
