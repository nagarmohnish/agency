const services = [
  {
    category: "Marketing Services",
    description: "Performance-driven marketing that delivers measurable results and sustainable growth.",
    color: "orange",
    items: [
      {
        title: "Paid Advertising",
        description:
          "Strategic paid campaigns across Google, Meta, LinkedIn, and programmatic channels. We optimize for ROAS and scale what works.",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "Social Media Marketing",
        description:
          "Full-funnel social strategies from brand awareness to conversion. Content creation, community management, and influencer partnerships.",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        ),
      },
      {
        title: "SEO & Content",
        description:
          "Data-driven SEO strategies and content that ranks. Technical optimization, keyword research, and content that converts visitors to customers.",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
      },
      {
        title: "Brand Strategy",
        description:
          "Positioning, messaging, and visual identity that differentiates. We help you own your market position and communicate value effectively.",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        ),
      },
    ],
  },
  {
    category: "Tech Services",
    description: "Intelligent systems and automation that scale your operations and unlock new capabilities.",
    color: "violet",
    items: [
      {
        title: "AI Automation",
        description:
          "Automate repetitive workflows with intelligent systems. From lead scoring to customer support, we build bots that work 24/7.",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        title: "Data Processing & Pipelines",
        description:
          "ETL pipelines, data warehousing, and real-time processing. Turn raw data into actionable insights with scalable infrastructure.",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        ),
      },
      {
        title: "Custom AI Solutions",
        description:
          "Purpose-built AI applications for your unique challenges. LLM integrations, computer vision, NLP, and recommendation systems.",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ),
      },
      {
        title: "Analytics & BI",
        description:
          "Dashboards, reporting, and predictive analytics that drive decisions. We connect your data sources and surface insights that matter.",
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wider">
            What We Do
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Two Verticals, One Mission
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We help businesses grow through performance marketing and scale through intelligent technology.
            Choose one vertical or combine both for maximum impact.
          </p>
        </div>

        {/* Services grid */}
        <div className="space-y-20">
          {services.map((category) => (
            <div key={category.category}>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-3 ${category.color === "orange" ? "bg-gradient-to-br from-orange-500 to-pink-500" : "bg-gradient-to-br from-violet-600 to-indigo-600"}`} />
                    {category.category}
                  </h3>
                  <p className="text-gray-600 max-w-xl">{category.description}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.items.map((service) => (
                  <div
                    key={service.title}
                    className={`group p-6 rounded-2xl bg-gray-50 hover:bg-gradient-to-br transition-all duration-300 cursor-pointer ${
                      category.color === "orange"
                        ? "hover:from-orange-500 hover:to-pink-500"
                        : "hover:from-violet-600 hover:to-indigo-600"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      category.color === "orange"
                        ? "bg-orange-100 text-orange-600 group-hover:bg-white/20 group-hover:text-white"
                        : "bg-violet-100 text-violet-600 group-hover:bg-white/20 group-hover:text-white"
                    }`}>
                      {service.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-gray-600 group-hover:text-white/80 text-sm leading-relaxed transition-colors">
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Not sure which vertical fits?</h3>
              <p className="text-gray-600">Let&apos;s discuss your goals and find the right solution.</p>
            </div>
            <a
              href="#contact"
              className="whitespace-nowrap bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              Book a Call
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
