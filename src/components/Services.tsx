"use client";

const platforms = [
  {
    name: "Meta Ads",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
    description: "Facebook, Instagram, and Messenger campaigns with precision targeting and creative optimization.",
    capabilities: ["Conversion campaigns", "Lead generation", "Dynamic retargeting", "Catalog sales"],
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    name: "Google Ads",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
    ),
    description: "Search, Display, YouTube, and Performance Max campaigns.",
    capabilities: ["Search campaigns", "Performance Max", "YouTube ads", "Shopping"],
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    name: "Snapchat Ads",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
      </svg>
    ),
    description: "Reach Gen Z and Millennials with immersive AR experiences.",
    capabilities: ["AR lens campaigns", "Story ads", "Spotlight", "Collection ads"],
    gradient: "from-yellow-400 to-pink-400",
  },
  {
    name: "LinkedIn Ads",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    description: "B2B advertising targeting decision-makers.",
    capabilities: ["Sponsored content", "Lead gen forms", "InMail", "ABM"],
    gradient: "from-sky-500 to-indigo-500",
  },
  {
    name: "Media Buying",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    description: "Strategic planning across programmatic.",
    capabilities: ["Programmatic", "Native ads", "Direct deals"],
    gradient: "from-pink-500 to-orange-400",
  },
];

const creative = [
  { name: "Ad Creative", description: "Static and video ads designed for performance" },
  { name: "Video Production", description: "UGC-style content and motion graphics" },
  { name: "Landing Pages", description: "High-converting pages for ad traffic" },
  { name: "Brand Identity", description: "Logo and visual systems" },
];

export default function Services() {
  return (
    <section id="services" className="section relative bg-[var(--color-base)]">
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="badge mb-6 inline-block">
            <span className="dot" />
            Services
          </span>
          <h2 className="text-headline mb-6">
            Full-funnel{" "}
            <span className="text-gradient">advertising</span>
          </h2>
          <p className="text-body-lg text-[var(--text-secondary)]">
            From awareness to conversion, we build campaigns that drive measurable
            growth across all major platforms.
          </p>
        </div>

        {/* Platform expertise label */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-[2px] bg-gradient-to-r from-[var(--accent-green)] to-transparent" />
          <span className="text-micro text-[var(--text-muted)]">Platform Expertise</span>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 mb-20">
          {platforms.map((platform, index) => (
            <div
              key={platform.name}
              className={`glass-card-glow p-8 ${
                index < 3 ? "lg:col-span-2" : "lg:col-span-3"
              }`}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center mb-6 text-white shadow-[3px_4px_0_rgba(0,0,0,0.12)]`}>
                {platform.icon}
              </div>

              <h3 className="text-subhead text-[var(--text-primary)] mb-3">{platform.name}</h3>
              <p className="text-body text-[var(--text-secondary)] mb-6">{platform.description}</p>

              {/* Capabilities */}
              <ul className="space-y-2">
                {platform.capabilities.map((cap) => (
                  <li key={cap} className="flex items-center gap-3 text-small">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
                    <span className="text-[var(--text-muted)]">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Creative Studio */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-[2px] bg-gradient-to-r from-[var(--accent-green)] to-transparent" />
          <span className="text-micro text-[var(--text-muted)]">Creative Studio</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {creative.map((service, index) => (
            <div key={service.name} className="glass-card p-6 group shine-on-hover">
              <span className="text-5xl font-black text-[var(--accent-orange)] opacity-50 group-hover:opacity-80 transition-opacity">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h4 className="font-semibold text-[var(--text-primary)] mt-4 mb-2 group-hover:text-[var(--accent-orange)] transition-colors">
                {service.name}
              </h4>
              <p className="text-small text-[var(--text-muted)]">{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="glass-card-glow p-10 md:p-14 relative">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h3 className="text-headline text-[var(--text-primary)] mb-3">
                Ready to <span className="text-gradient">scale</span>?
              </h3>
              <p className="text-body-lg text-[var(--text-secondary)]">
                Get a free audit of your current campaigns.
              </p>
            </div>
            <a href="#contact" className="btn-primary whitespace-nowrap">
              Get free audit
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
