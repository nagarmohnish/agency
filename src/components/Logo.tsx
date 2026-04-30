"use client";

// ROI Labs wordmark. Reads the route to decide which color variant of the
// pre-generated PNG to render — yellow on the live site, blue on /demo-blue.
// Both variants are produced by scripts/process-logo.js with different
// LOGO_ROI env values.

import Image from "next/image";
import { usePathname } from "next/navigation";

type Props = {
  className?: string;
  size?: number;
};

const ASPECT = 144 / 122;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Logo({ className = "", size = 56 }: Props) {
  const pathname = usePathname();
  const file = pathname?.startsWith("/demo-blue")
    ? "/roi-logo-blue.png"
    : "/roi-logo.png";
  const src = `${BASE_PATH}${file}`;

  const width = Math.round(size * ASPECT);
  return (
    <Image
      src={src}
      alt="ROI Labs"
      width={width}
      height={size}
      className={className}
      style={{ display: "block", height: size, width: "auto" }}
      priority
    />
  );
}
