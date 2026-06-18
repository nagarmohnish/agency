"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// Scales the fixed-size x-ray canvas (default 1080×620) DOWN to fit narrow
// viewports as a single unit. scale === 1 at >= w px, so desktop is pixel-identical
// to before; below that the whole annotated composition shrinks together instead of
// the absolutely-positioned notes/connectors clipping or detaching. Uses a
// ResizeObserver on the full-width frame (no window math, scrollbar-safe).
//
// `children` may be a render-prop: it receives { mobile } so the consumer can swap
// to a phone-only layout below `mobileBelow` px (where the full annotated stage would
// shrink the callout text to an unreadable size). SSR-safe: scale starts at 1 and
// mobile starts false, so the server renders the desktop composition.
export default function XrayScaler({
  w = 1080,
  h = 620,
  top = 0,
  mobileBelow = 640,
  children,
}: {
  w?: number;
  h?: number;
  top?: number;
  mobileBelow?: number;
  children: ReactNode | ((state: { mobile: boolean }) => ReactNode);
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Single measurement reads clientWidth then commits state — no write-back into
    // the observed element, so the ResizeObserver can't feed back on itself / thrash.
    const update = () => {
      const cw = el.clientWidth;
      setScale(Math.min(1, cw / w));
      setMobile(cw < mobileBelow);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, mobileBelow]);

  // Mobile: drop the fixed-canvas scale wrapper entirely and let the consumer render a
  // fluid, phone-centric layout that flows with the frame width.
  if (mobile) {
    return (
      <div ref={ref} style={{ width: "100%", marginTop: top, position: "relative" }}>
        {typeof children === "function" ? children({ mobile: true }) : children}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ width: "100%", marginTop: top, height: h * scale, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", width: w, height: h, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center" }}>
        {typeof children === "function" ? children({ mobile: false }) : children}
      </div>
    </div>
  );
}
