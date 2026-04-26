"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/#platforms", label: "Platforms" },
    { href: "/#process", label: "Process" },
    { href: "/about", label: "About" },
    { href: "/calculator", label: "Calculator" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          scrolled || isOpen
            ? "bg-[var(--color-base)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]"
            : "bg-transparent"
        }`}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center text-white group" aria-label="ROI Labs">
            <Logo size={48} />
          </Link>

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="link-glow text-sm font-medium whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/#contact" className="btn-primary text-sm">
              Talk to us
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--color-elevated)] hover:bg-[var(--color-subtle)] transition-colors text-white"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "opacity-0 scale-0" : ""}`} />
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </div>
          </button>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="pt-6 pb-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block py-3 px-4 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--color-elevated)] transition-all"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#contact"
              onClick={() => setIsOpen(false)}
              className="block mt-3 btn-primary text-center"
            >
              Talk to us
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
