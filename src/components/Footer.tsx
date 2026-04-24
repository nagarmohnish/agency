import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 bg-[var(--color-navy)] text-white">
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center mb-6" aria-label="ROI Labs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/roi-logo.png"
                alt="ROI Labs"
                className="h-12 w-auto"
                style={{ filter: "invert(1) brightness(1.05)" }}
              />
            </Link>
            <p className="text-body text-white/60 max-w-sm mb-6">
              Performance marketing agency specializing in paid social advertising across Meta, Google, LinkedIn, and Snapchat.
            </p>
            <a href="mailto:support@roilabs.in" className="inline-flex items-center gap-2 text-[var(--accent-yellow)] font-bold hover:text-white transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              support@roilabs.in
            </a>
            <div className="flex items-start gap-2 text-small text-white/40">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>3rd Floor, Garuda BHIVE Workspace, BTM Layout Campus, BMTC Complex, Outer Ring Rd, BTM Layout, Bengaluru, Karnataka 560076</span>
            </div>
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
              {[{ label: "About", href: "/about" }, { label: "Calculator", href: "/calculator" }, { label: "Contact", href: "/#contact" }].map((item) => (
                <li key={item.label}><a href={item.href} className="text-small text-white/50 hover:text-[var(--accent-yellow)] transition-colors font-medium">{item.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="h-[2px] mb-8 opacity-20" style={{ background: "repeating-linear-gradient(90deg, white 0px, white 6px, transparent 6px, transparent 12px)" }} />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-small text-white/40">&copy; {currentYear} ROIlabs. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-small text-white/40 hover:text-[var(--accent-yellow)] transition-colors">Privacy Policy</a>
            <a href="#" className="text-small text-white/40 hover:text-[var(--accent-yellow)] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
