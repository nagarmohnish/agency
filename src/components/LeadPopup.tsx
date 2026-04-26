"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SHOW_AFTER_MS = 10_000;
const STORAGE_KEY = "lead-popup-dismissed";

export default function LeadPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Schedule the popup 10s after the user lands. Once dismissed (close or
  // submit), we set a sessionStorage flag so it doesn't pop again in this tab.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !message.trim()) {
      setError("Email and a short message are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "—",
          email: email.trim(),
          message: message.trim(),
          source: "popup",
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      setSubmitted(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      setError("Something went wrong. Try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contact us"
      className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fade-in"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl animate-scale-in">
        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-white hover:bg-[var(--color-elevated)] transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-7 md:p-9">
          {submitted ? (
            <div className="py-4 text-center">
              <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center rounded-full bg-[var(--accent-yellow)]/15 text-[var(--accent-yellow)]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Got it.</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                We&apos;ll get back to you within 24 hours.
              </p>
              <button
                type="button"
                onClick={dismiss}
                className="text-sm text-[var(--accent-yellow)] hover:underline"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-yellow)] mb-4 font-medium">
                Contact us
              </p>
              <h3 className="text-2xl font-semibold text-white mb-2 leading-tight">
                Let&apos;s talk.
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Drop your email and what you&apos;d like to talk about. We&apos;ll
                reply within 24 hours.
              </p>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="lp-name" className="block text-xs text-[var(--text-muted)] mb-1.5">
                    Name <span className="text-[var(--text-muted)]">(optional)</span>
                  </label>
                  <input
                    id="lp-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-dark"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="lp-email" className="block text-xs text-[var(--text-muted)] mb-1.5">
                    Email
                  </label>
                  <input
                    id="lp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-dark"
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="lp-message" className="block text-xs text-[var(--text-muted)] mb-1.5">
                    Your query
                  </label>
                  <textarea
                    id="lp-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={3}
                    className="input-dark resize-none"
                    placeholder="A line about your business and what you'd like help with"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending…" : "Contact us"}
                </button>

                <p className="text-[11px] text-center text-[var(--text-muted)] pt-1">
                  Or email us at{" "}
                  <a href="mailto:mohnish@roilabs.in" className="text-[var(--text-secondary)] hover:text-white">
                    mohnish@roilabs.in
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
