const values = [
  {
    title: "Performance Obsessed",
    description:
      "Every dollar spent and every line of code written is optimized for results. We measure everything and improve constantly.",
  },
  {
    title: "Full Transparency",
    description:
      "Real-time dashboards, clear reporting, and honest communication. You always know exactly where your investment is going.",
  },
  {
    title: "Speed to Market",
    description:
      "We move fast without breaking things. Rapid iteration, quick wins, and continuous deployment of improvements.",
  },
  {
    title: "Integrated Thinking",
    description:
      "Marketing and tech work better together. We connect the dots between acquisition and operations for compounding returns.",
  },
];

const capabilities = [
  {
    vertical: "Marketing",
    color: "orange",
    skills: ["Google Ads", "Meta Ads", "LinkedIn", "TikTok", "SEO", "Content Strategy", "Email Marketing", "CRO"],
  },
  {
    vertical: "Tech",
    color: "violet",
    skills: ["Python", "Node.js", "AWS", "OpenAI", "LangChain", "PostgreSQL", "Snowflake", "Retool"],
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Left side - Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-1">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                <div className="text-center p-8 w-full">
                  <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Derivative Labs
                  </div>
                  <div className="text-gray-500 text-sm mb-8">
                    Marketing + Tech, Under One Roof
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-6">
                    {capabilities.map((cap) => (
                      <div key={cap.vertical} className="text-left">
                        <div className={`text-sm font-semibold mb-2 ${cap.color === "orange" ? "text-orange-600" : "text-violet-600"}`}>
                          {cap.vertical}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cap.skills.map((skill) => (
                            <span
                              key={skill}
                              className={`px-2 py-1 rounded text-xs ${
                                cap.color === "orange"
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-violet-50 text-violet-700"
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-violet-200 rounded-full -z-10 blur-2xl opacity-60" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-200 rounded-full -z-10 blur-2xl opacity-60" />
          </div>

          {/* Right side - Content */}
          <div>
            <span className="text-violet-600 font-semibold text-sm uppercase tracking-wider">
              About Derivative Labs
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              Built Different
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Most agencies are either marketing shops that outsource tech, or dev shops that don&apos;t
              understand growth. We&apos;re both under one roof. This means your marketing campaigns
              feed directly into automated systems, and your data infrastructure powers smarter
              targeting.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We started Derivative Labs because we saw too many businesses paying for disconnected
              services. Your ad spend generates data. That data should train models. Those models
              should improve targeting. It&apos;s a loop, and we build the whole thing.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you need to scale customer acquisition, automate operations, or both—we&apos;re
              built to deliver outcomes, not just outputs.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center text-violet-600 font-semibold hover:text-violet-700 transition-colors"
            >
              Let&apos;s talk about your goals
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900">How We Work</h3>
            <p className="text-gray-600 mt-2">The principles that drive everything we do</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={value.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 font-bold flex items-center justify-center mx-auto mb-4">
                  {index + 1}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h4>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Both */}
        <div className="bg-white rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Why Marketing + Tech Together?
            </h3>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div>
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Faster Feedback Loops</h4>
                <p className="text-gray-600 text-sm">
                  Marketing insights flow directly into product and automation. No telephone game between agencies.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Data Ownership</h4>
                <p className="text-gray-600 text-sm">
                  Your data stays yours. We build infrastructure you own, not black boxes you rent.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Better Unit Economics</h4>
                <p className="text-gray-600 text-sm">
                  One team, one invoice, compounding results. No coordination tax between vendors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
