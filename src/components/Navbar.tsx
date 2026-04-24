"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/#services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/calculator", label: "Calculator" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          scrolled || isOpen
            ? "bg-[var(--color-base)]/95 backdrop-blur-xl border-b-[3px] border-[var(--card-border)] shadow-[0_4px_0_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center group" aria-label="ROI Labs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/roi-logo.png"
              alt="ROI Labs"
              className="h-11 w-auto"
              style={{ mixBlendMode: "multiply" }}
            />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="link-glow text-sm font-bold uppercase tracking-wide">
                {link.label}
              </a>
            ))}
            <a href="/#contact" className="btn-primary py-3 px-6 text-sm">
              Get started
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border-[3px] border-[var(--card-border)] bg-white hover:bg-[var(--accent-yellow)] transition-colors shadow-[2px_3px_0_rgba(0,0,0,0.1)]"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${isOpen ? "opacity-0 scale-0" : ""}`} />
              <span className={`block h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </div>
          </button>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-500 ${isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="pt-6 pb-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block py-3 px-4 rounded-xl text-[var(--text-body)] font-bold uppercase hover:text-[var(--accent-green)] hover:bg-white/60 transition-all"
              >
                {link.label}
              </a>
            ))}
            <a href="/#contact" onClick={() => setIsOpen(false)} className="block mt-4 btn-primary text-center">
              Get started
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
