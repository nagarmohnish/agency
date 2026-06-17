// Build a single, self-contained HTML file of the tenant cockpit (with the
// /t/preview sample data) — every element + metric in one shareable file.
// Logos are inlined as base64; React + Babel load from CDN; the cockpit code is
// the REAL component source (transformed so it runs standalone), so it stays
// faithful. Output: cockpit-astrotime.html at the repo root.
//
//   node scripts/build-cockpit-html.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

// ── inline the logos as data URIs ───────────────────────────────────────────
const LOGO_FILES = ["google1.webp", "meta.png", "shopify.svg", "razorpay.png", "upi.webp", "stripe.png", "paypal.svg", "astrotime.png", "roi-mark.png"];
const mime = (f) => f.endsWith(".svg") ? "image/svg+xml" : f.endsWith(".webp") ? "image/webp" : (f.endsWith(".jpg") || f.endsWith(".jpeg")) ? "image/jpeg" : "image/png";
const LOGOS = {};
for (const f of LOGO_FILES) {
  const buf = readFileSync(join(ROOT, "public/logos", f));
  LOGOS[`/logos/${f}`] = `data:${mime(f)};base64,${buf.toString("base64")}`;
}

// ── pull in the real component + sample, transform to run standalone ─────────
function stripModule(src) {
  return src
    .replace(/^\s*"use client";\s*$/m, "")
    .replace(/^\s*import\s+.*?;\s*$/gm, ""); // drop ES imports (single-line)
}

let cockpit = stripModule(readFileSync(join(ROOT, "src/app/t/[slug]/TenantCockpit.tsx"), "utf8"));
cockpit = cockpit
  .replace('const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";', "")          // BP unused after logo swap
  .replace("src={`${BP}${src}`}", "src={LOGOS[src]}")                          // SrcLogo
  .replace("src={`${BP}/logos/${p.file}`}", 'src={LOGOS["/logos/" + p.file]}') // PayChip
  .replace("src={`${BP}/logos/${slug}.png`}", 'src={LOGOS["/logos/" + slug + ".png"]}') // BrandAvatar
  .replace("src={`${BP}/logos/roi-mark.png`}", 'src={LOGOS["/logos/roi-mark.png"]}')    // Rail mark
  .replace("export default function TenantCockpit", "function TenantCockpit");

let sample = stripModule(readFileSync(join(ROOT, "src/app/t/preview/sample.ts"), "utf8"))
  .replace("export function buildSample", "function buildSample");

const appCode = `
const { useState, useEffect } = React;
const LOGOS = ${JSON.stringify(LOGOS)};
${sample}
${cockpit}
ReactDOM.createRoot(document.getElementById("root")).render(
  <TenantCockpit data={buildSample()} role="admin" slug="astrotime" />
);
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ROI Engine — The Astro Time</title>
<style>
  html, body { margin: 0; padding: 0; background: #F3F5F9; }
  #root { min-height: 100vh; }
  #loading { font-family: system-ui, sans-serif; color: #8B93A7; padding: 40px; }
</style>
</head>
<body>
<div id="root"><div id="loading">Loading cockpit…</div></div>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
<script type="text/babel" data-presets="react,typescript">
${appCode}
</script>
</body>
</html>
`;

const out = join(ROOT, "cockpit-astrotime.html");
writeFileSync(out, html);
console.log(`Wrote ${out} (${(html.length / 1024).toFixed(0)} KB) · ${LOGO_FILES.length} logos inlined`);
