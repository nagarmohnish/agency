"use client";

const brands = [
  { name: "Luxora", initials: "LX" },
  { name: "Vortex Media", initials: "VM" },
  { name: "Pulse Fitness", initials: "PF" },
  { name: "NovaTech", initials: "NT" },
  { name: "ZenCart", initials: "ZC" },
  { name: "Bloom Beauty", initials: "BB" },
  { name: "Apex Finance", initials: "AF" },
  { name: "Drift Studio", initials: "DS" },
  { name: "Skyline Real Estate", initials: "SR" },
  { name: "Ember Kitchen", initials: "EK" },
  { name: "Vela Health", initials: "VH" },
  { name: "Iron & Oak", initials: "IO" },
];

export default function BrandMarquee() {
  return (
    <section className="relative py-16 overflow-hidden bg-[var(--color-surface)]">
      <div className="relative z-10">
        <p className="text-center text-micro text-[var(--text-muted)] mb-10">
          Trusted by forward-thinking brands
        </p>

        <div className="marquee">
          <div className="marquee-content gap-12 md:gap-16">
            {brands.map((brand) => (
              <div key={brand.name} className="flex items-center gap-3 flex-shrink-0 group">
                <div className="w-10 h-10 rounded-xl bg-white border-[3px] border-[var(--card-border)] shadow-[2px_3px_0_rgba(0,0,0,0.08)] flex items-center justify-center group-hover:border-[var(--accent-green)] transition-colors">
                  <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] transition-colors">
                    {brand.initials}
                  </span>
                </div>
                <span className="text-sm font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors whitespace-nowrap">
                  {brand.name}
                </span>
              </div>
            ))}
            {brands.map((brand) => (
              <div key={`dup-${brand.name}`} className="flex items-center gap-3 flex-shrink-0 group">
                <div className="w-10 h-10 rounded-xl bg-white border-[3px] border-[var(--card-border)] shadow-[2px_3px_0_rgba(0,0,0,0.08)] flex items-center justify-center group-hover:border-[var(--accent-green)] transition-colors">
                  <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] transition-colors">
                    {brand.initials}
                  </span>
                </div>
                <span className="text-sm font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors whitespace-nowrap">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edge fades */}
      <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-[var(--color-surface)] to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[var(--color-surface)] to-transparent z-20 pointer-events-none" />
    </section>
  );
}
