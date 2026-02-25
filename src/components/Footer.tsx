import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 bg-[var(--color-navy)] text-white">
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-[var(--accent-green)] rounded-xl border-2 border-white/20 shadow-[2px_3px_0_rgba(0,0,0,0.3)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-sm">H&L</span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-white uppercase tracking-tight">honey&lemon</span>
            </Link>
            <p className="text-body text-white/60 max-w-sm mb-6">
              Performance marketing agency specializing in paid social advertising across Meta, Google, LinkedIn, and Snapchat.
            </p>
            <a href="mailto:hello@honeyandlemon.co" className="inline-flex items-center gap-2 text-[var(--accent-yellow)] font-bold hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              hello@honeyandlemon.co
            </a>
          </div>
          <div>
            <h4 className="text-micro text-[var(--accent-green)] mb-6">Services</h4>
            <ul className="space-y-4">
              {["Meta Ads", "Google Ads", "Snapchat Ads", "LinkedIn Ads", "Media Buying"].map((item) => (
                <li key={item}><a href="/#services" className="text-small text-white/50 hover:text-[var(--accent-yellow)] transition-colors font-medium">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-micro text-[var(--accent-orange)] mb-6">Company</h4>
            <ul className="space-y-4">
              {[{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Calculator", href: "/calculator" }, { label: "Contact", href: "/#contact" }].map((item) => (
                <li key={item.label}><a href={item.href} className="text-small text-white/50 hover:text-[var(--accent-yellow)] transition-colors font-medium">{item.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="h-[2px] mb-8 opacity-20" style={{ background: "repeating-linear-gradient(90deg, white 0px, white 6px, transparent 6px, transparent 12px)" }} />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-small text-white/40">&copy; {currentYear} honey&lemon. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-small text-white/40 hover:text-[var(--accent-yellow)] transition-colors">Privacy Policy</a>
            <a href="#" className="text-small text-white/40 hover:text-[var(--accent-yellow)] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
