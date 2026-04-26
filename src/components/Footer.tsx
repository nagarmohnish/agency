import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="py-10 md:py-12 border-t border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <Link href="/" aria-label="ROI Labs" className="text-white inline-flex">
            <Logo size={56} />
          </Link>

          <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
            {[
              { label: "Home", href: "/" },
              { label: "Platforms", href: "/#platforms" },
              { label: "Process", href: "/#process" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/#contact" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--color-elevated)] border border-[var(--border-subtle)] text-white text-sm hover:border-[rgba(255,255,255,0.3)] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-xs text-[var(--text-muted)]">
          <p className="m-0">© 2026 ROI Labs. All rights reserved.</p>
          <p className="m-0">
            <a href="mailto:support@roilabs.in" className="hover:text-white transition-colors">
              support@roilabs.in
            </a>
            {" · Bengaluru, India"}
          </p>
        </div>
      </div>
    </footer>
  );
}
