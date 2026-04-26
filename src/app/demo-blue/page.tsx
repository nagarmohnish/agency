"use client";

// Demo route — same as the homepage but with the brand accent overridden
// from yellow to steel blue. Implementation: a useEffect on mount sets the
// shared --accent-yellow / --accent-yellow-dim / --accent-glow custom
// properties on document.documentElement; cleanup restores the originals
// when the visitor navigates away. Every component that reads these
// variables (Hero, Numbers, Services, Process, WhyUs, WhichPath, Contact,
// Navbar button, footer LinkedIn pill, etc.) flips automatically.
//
// Note: the logo PNG (yellow ROI) is a baked asset and stays as-is. If the
// blue palette gets the green-light, we re-run scripts/process-logo.js
// with the new color and the logo flips too.

import { useEffect } from "react";
import Hero from "@/components/Hero";
import Numbers from "@/components/Numbers";
import Services from "@/components/Services";
import Process from "@/components/Process";
import WhyUs from "@/components/WhyUs";
import WhichPath from "@/components/WhichPath";
import Contact from "@/components/Contact";

// Lively, "high-graphics" steel blue (#3B82F6) — same family as classic
// steel blue but higher chroma, more SaaS/Vercel energy.
const STEEL_BLUE = "#3B82F6";
const STEEL_BLUE_DIM = "#2563EB";
const STEEL_BLUE_GLOW = "rgba(59, 130, 246, 0.32)";

export default function DemoBluePage() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = {
      yellow: root.style.getPropertyValue("--accent-yellow"),
      dim: root.style.getPropertyValue("--accent-yellow-dim"),
      glow: root.style.getPropertyValue("--accent-glow"),
    };

    root.style.setProperty("--accent-yellow", STEEL_BLUE);
    root.style.setProperty("--accent-yellow-dim", STEEL_BLUE_DIM);
    root.style.setProperty("--accent-glow", STEEL_BLUE_GLOW);

    return () => {
      const restore = (prop: keyof typeof previous, varName: string) => {
        if (previous[prop]) root.style.setProperty(varName, previous[prop]);
        else root.style.removeProperty(varName);
      };
      restore("yellow", "--accent-yellow");
      restore("dim", "--accent-yellow-dim");
      restore("glow", "--accent-glow");
    };
  }, []);

  return (
    <>
      {/* Floating tag so the visitor knows this is the demo */}
      <div
        className="fixed top-4 right-4 z-[300] px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide border"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: STEEL_BLUE,
          borderColor: STEEL_BLUE,
        }}
      >
        Demo · steel blue
      </div>

      <Hero />
      <Numbers />
      <Services />
      <Process />
      <WhyUs />
      <WhichPath />
      <Contact />
    </>
  );
}
