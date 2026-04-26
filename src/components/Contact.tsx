"use client";

import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    budget: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "contact" }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section relative bg-[var(--color-subtle)]">
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Left */}
          <div>
            <span className="badge mb-8 inline-block">
              <span className="dot" />
              Contact
            </span>
            <h2 className="text-headline text-[var(--text-primary)] mb-6">
              Let&apos;s talk about your{" "}
              <span className="text-gradient">growth</span>
            </h2>
            <p className="text-body-lg text-[var(--text-secondary)] mb-12">
              Tell us about your business and goals. We&apos;ll respond with a clear read
              and a shortlist of fixes within 24 hours.
            </p>

            {/* What's included */}
            <div className="glass-card-glow p-8 mb-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-[2px] bg-gradient-to-r from-[var(--accent-green)] to-transparent" />
                <span className="text-micro text-[var(--accent-green)]">What&apos;s Included</span>
              </div>
              <ul className="space-y-5">
                {[
                  "Audit of current advertising",
                  "Competitive landscape analysis",
                  "Custom strategy recommendations",
                  "Transparent pricing proposal",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[var(--accent-green)] flex-shrink-0" />
                    <span className="text-body text-[var(--text-secondary)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Email & Address */}
            <div className="flex items-center gap-4">
              <span className="text-small text-[var(--text-muted)]">Or email us directly:</span>
              <a href="mailto:mohnish@roilabs.in" className="link-glow text-[var(--accent-green)]">
                mohnish@roilabs.in
              </a>
            </div>
          </div>

          {/* Right - Form */}
          <div>
            <div className="glass-card-glow p-8 md:p-10 relative">
              <div className="relative z-10">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center mx-auto mb-8 shadow-[3px_4px_0_rgba(0,0,0,0.1)]">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-subhead text-[var(--text-primary)] mb-3">Message received!</h3>
                    <p className="text-body text-[var(--text-secondary)] mb-8">We&apos;ll get back to you within 24 hours.</p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: "", email: "", company: "", budget: "", message: "" });
                      }}
                      className="link-glow text-[var(--accent-green)]"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-small text-[var(--text-muted)] mb-3">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="input-dark"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-small text-[var(--text-muted)] mb-3">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="input-dark"
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="company" className="block text-small text-[var(--text-muted)] mb-3">
                          Company
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="input-dark"
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <label htmlFor="budget" className="block text-small text-[var(--text-muted)] mb-3">
                          Monthly budget
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="input-dark cursor-pointer"
                        >
                          <option value="">Select range</option>
                          <option value="under-5k">Under $5,000</option>
                          <option value="5k-15k">$5,000 - $15,000</option>
                          <option value="15k-50k">$15,000 - $50,000</option>
                          <option value="50k-plus">$50,000+</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-small text-[var(--text-muted)] mb-3">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="input-dark resize-none"
                        placeholder="Tell us about your goals..."
                      />
                    </div>

                    {error && (
                      <p className="text-small text-red-600">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        "Send"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
