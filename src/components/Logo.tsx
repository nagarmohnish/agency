"use client";

// ROI Labs wordmark. Reads the route to decide which color variant of the
// pre-generated PNG to render — yellow on the live site, blue on /demo-blue.
// Both variants are produced by scripts/process-logo.js with different
// LOGO_ROI env values.

import { usePathname } from "next/navigation";

type Props = {
  className?: string;
  size?: number;
};

const ASPECT = 144 / 122;

export default function Logo({ className = "", size = 56 }: Props) {
  const pathname = usePathname();
  const src = pathname?.startsWith("/demo-blue")
    ? "/roi-logo-blue.png"
    : "/roi-logo.png";

  const width = Math.round(size * ASPECT);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="ROI Labs"
      width={width}
      height={size}
      className={className}
      style={{ display: "block", height: size, width: "auto" }}
    />
  );
}
