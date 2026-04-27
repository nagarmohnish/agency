import type { NextConfig } from "next";

// Set NEXT_BUILD_MODE=export before `next build` to produce a static
// downloadable site in /out (used for the "downloadable HTML" deliverable).
// Leave the env var unset for normal dev / Vercel deploys.
const isStaticExport = process.env.NEXT_BUILD_MODE === "export";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
