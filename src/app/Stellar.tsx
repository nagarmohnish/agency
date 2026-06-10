"use client";

// Stellar.ai landing hero — design exploration at /stellar. White, Inter font,
// Lucide icons, staggered fade-in, auto-cycling tab bar over a looping video.
// Scoped under .stellar so it never touches the dark global theme.

import { useEffect, useState } from "react";
import {
  Star,
  ChevronDown,
  BarChart3,
  BookOpen,
  Users,
  Rocket,
  Check,
} from "lucide-react";

type TabId = "analyse" | "train" | "testing" | "deploy";

const TABS: { id: TabId; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "analyse", label: "Analyse", Icon: BarChart3 },
  { id: "train", label: "Train", Icon: BookOpen },
  { id: "testing", label: "Testing", Icon: Users },
  { id: "deploy", label: "Deploy", Icon: Rocket },
];

const ORDER: TabId[] = ["analyse", "train", "testing", "deploy"];

export default function Stellar() {
  const [activeTab, setActiveTab] = useState<TabId>("analyse");

  // Auto-cycle tabs every 4s.
  useEffect(() => {
    const t = setInterval(() => {
      setActiveTab((prev) => ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length]);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const TabButton = ({ id, label, Icon }: (typeof TABS)[number]) => (
    <button
      onClick={() => setActiveTab(id)}
      className={
        "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors " +
        (activeTab === id ? "bg-white text-black shadow-sm" : "text-gray-600")
      }
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="stellar bg-white">
      {/* NAVIGATION */}
      <nav
        className="animate-fade-in-up px-6 py-4 flex items-center justify-between max-w-7xl mx-auto"
        style={{ opacity: 0, animationDelay: "0.1s" }}
      >
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-black" />
          <span className="text-lg font-semibold">Stellar.ai</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="flex items-center gap-1 text-sm text-gray-700 hover:text-black">
            Solutions <ChevronDown className="w-4 h-4" />
          </a>
          <a href="#" className="flex items-center gap-1 text-sm text-gray-700 hover:text-black">
            For Teams <ChevronDown className="w-4 h-4" />
          </a>
          <a href="#" className="text-sm text-gray-700 hover:text-black">About Us</a>
          <a href="#" className="text-sm text-gray-700 hover:text-black">Learn Hub</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-gray-700 hover:text-black">Login</a>
          <button className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            Get started free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 pt-24 pb-32 max-w-7xl mx-auto text-center">
        {/* Reviews badge */}
        <div
          className="animate-fade-in-up inline-flex items-center gap-2 mb-8"
          style={{ opacity: 0, animationDelay: "0.2s" }}
        >
          <span className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center">
            <Star className="w-3.5 h-3.5 fill-black" />
          </span>
          <span className="text-sm font-medium text-black">4.9 rating from 18.3K+ users</span>
        </div>

        {/* Heading */}
        <h1
          className="animate-fade-in-up text-6xl md:text-7xl lg:text-[80px] font-normal leading-[1.1] tracking-tight mb-5"
          style={{ opacity: 0, animationDelay: "0.3s" }}
        >
          Work Smarter. Move Faster.
          <br />
          <span className="bg-gradient-to-r from-black via-gray-500 to-gray-400 bg-clip-text text-transparent">
            AI Powers You Up.
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="animate-fade-in-up text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          style={{ opacity: 0, animationDelay: "0.4s" }}
        >
          Intelligent automation syncs with the tools you love to streamline tasks, boost output, and save time.
        </p>

        {/* CTA */}
        <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "0.5s" }}>
          <button className="bg-black text-white px-8 py-3 rounded-full text-base font-medium hover:bg-gray-800 transition-colors mb-12">
            Begin Free Trial
          </button>
        </div>

        {/* Tab bar */}
        <div
          className="animate-fade-in-up flex justify-center mb-10"
          style={{ opacity: 0, animationDelay: "0.6s" }}
        >
          <div className="bg-gray-100 rounded-lg p-1">
            {/* Mobile: 2x2 grid */}
            <div className="md:hidden grid grid-cols-2 gap-1">
              {TABS.map((t) => (
                <TabButton key={t.id} {...t} />
              ))}
            </div>
            {/* Desktop: row with dividers */}
            <div className="hidden md:flex items-center">
              {TABS.map((t, i) => (
                <div key={t.id} className="flex items-center">
                  <TabButton {...t} />
                  {i < TABS.length - 1 && <span className="w-px h-5 bg-gray-300" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video + overlay */}
        <div
          className="animate-fade-in-up relative rounded-3xl overflow-hidden h-[400px] md:h-[500px] w-full"
          style={{ opacity: 0, animationDelay: "0.7s" }}
        >
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <Overlay key={activeTab} tab={activeTab} />
        </div>

        {/* Company logos */}
        <div
          className="animate-fade-in-up mt-24 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-gray-400"
          style={{ opacity: 0, animationDelay: "0.8s" }}
        >
          <span className="text-lg font-semibold tracking-[0.2em]">INTERSCOPE</span>
          <span className="text-xl font-bold tracking-tight">SPOTIFY</span>
          <span className="flex items-center gap-2">
            <span className="grid grid-cols-2 gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-gray-400" />
              ))}
            </span>
            <span className="text-lg font-medium">Nexera</span>
          </span>
          <span className="font-serif italic text-2xl">M3</span>
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-semibold">
              LC
            </span>
            <span className="text-sm font-semibold tracking-[0.15em]">LAURA COLE</span>
          </span>
          <span className="flex items-center gap-1 text-lg font-medium">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            </span>
            vertex
          </span>
        </div>
      </section>
    </div>
  );
}

/* ---------- Overlays (one per tab) ---------- */

function Overlay({ tab }: { tab: TabId }) {
  return (
    <div className="animate-fade-in-overlay absolute inset-0 bg-black/10 backdrop-blur-[1px]">
      <div className="animate-slide-up-overlay absolute left-1/2 top-1/2 w-[340px] md:w-[420px] bg-white rounded-2xl shadow-2xl p-6 text-left">
        {tab === "analyse" && <AnalyseCard />}
        {tab === "train" && <TrainCard />}
        {tab === "testing" && <TestingCard />}
        {tab === "deploy" && <DeployCard />}
      </div>
    </div>
  );
}

function AnalyseCard() {
  const steps = [
    "Connect your data sources",
    "Configure AI models",
    "Set automation rules",
    "Review & launch",
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold">Set Up Your AI Workspace</h3>
        <span className="text-xs font-medium text-gray-500">Step 1 of 4</span>
      </div>
      <p className="text-sm text-gray-500 mb-4">Get your workspace ready in a few quick steps.</p>
      <div className="h-2 bg-gray-200 rounded-full mb-5">
        <div className="h-2 rounded-full bg-purple-600" style={{ width: "25%" }} />
      </div>
      <ul className="space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span
              className={
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold " +
                (i === 0 ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500")
              }
            >
              {i + 1}
            </span>
            <span className={"text-sm " + (i === 0 ? "text-black font-medium" : "text-gray-500")}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrainCard() {
  const metrics = [
    { k: "Accuracy", v: "94.2%" },
    { k: "Loss", v: "0.082" },
    { k: "Learning rate", v: "0.001" },
    { k: "Time left", v: "12m" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold">AI Model Training</h3>
        <span className="text-xs font-medium text-orange-600">Epoch 67/100</span>
      </div>
      <p className="text-sm text-gray-500 mb-4">Optimizing weights on your dataset.</p>
      <div className="h-2 bg-gray-200 rounded-full mb-5">
        <div className="h-2 rounded-full bg-orange-500" style={{ width: "67%" }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.k} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">{m.k}</div>
            <div className="text-lg font-semibold">{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestingCard() {
  const suites = ["Unit tests", "Integration", "End-to-end", "Performance"];
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">Test Suite Results</h3>
          <p className="text-sm text-green-600 font-medium">All tests passed · 127 / 127</p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {suites.map((s) => (
          <li key={s} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-600" />
              {s}
            </span>
            <span className="text-xs font-medium text-green-600">Passed</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeployCard() {
  const checks = ["Build optimized", "All tests passed", "Security scan clean", "Staging verified"];
  return (
    <div>
      <h3 className="text-lg font-semibold mb-1">Deploy to Production</h3>
      <p className="text-sm text-gray-500 mb-4">Everything looks good. Ready to ship.</p>
      <ul className="space-y-2.5 mb-5">
        {checks.map((c) => (
          <li key={c} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </span>
            <span className="text-sm text-gray-700">{c}</span>
          </li>
        ))}
      </ul>
      <button className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
        <Rocket className="w-4 h-4" />
        Deploy Now
      </button>
    </div>
  );
}
