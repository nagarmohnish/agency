import type { NextConfig } from "next";

// Set NEXT_BUILD_MODE=export before `next build` to produce a static
// downloadable site in /out (used for the "downloadable HTML" deliverable).
// Leave the env var unset for normal dev / Vercel deploys.
const isStaticExport = process.env.NEXT_BUILD_MODE === "export";

// Set NEXT_BASE_PATH=/agency (etc.) when serving the static export from a
// non-root path like GitHub Pages. Leave unset for root deploys (Vercel /
// roilabs.in apex).
const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  // Expose basePath to the client so manually-routed asset URLs (e.g. raw
  // <img> / <Image unoptimized />) can prepend it. Stays an empty string
  // for production root deploys.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
