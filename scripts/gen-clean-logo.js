// Generate a high-res clean PNG of the ROI Labs logo from the small on-site PNG.
//
// The source (public/roi-logo.png, 144x122) has soft anti-aliased edges. Just
// upscaling it amplifies that softness. Instead we:
//   1. Threshold alpha to binary (kills AA in the source mask).
//   2. Snap each opaque pixel to the brand color it belongs to (yellow ROI vs
//      white LABS) based on the source RGB.
//   3. Upscale the clean binary RGBA buffer with lanczos3 — fresh AA gets
//      generated at the high resolution, which looks much crisper.
//   4. Apply a tiny sharpening pass to compensate for residual softness.

const fs = require("fs");
const sharp = require("sharp");

const SRC = "c:/Library/Projects/agency/public/roi-logo.png";
const OUT = "c:/Library/Projects/agency/roi-labs-logo.png";
const SCALE = 16;          // 144 → 2304 wide
const ALPHA_THRESHOLD = 96; // pixels with source alpha > this become opaque
const YELLOW = { r: 0xFA, g: 0xCC, b: 0x15 };
const WHITE  = { r: 0xFF, g: 0xFF, b: 0xFF };

async function main() {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // Build clean binary RGBA buffer at source size.
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a <= ALPHA_THRESHOLD) {
      out[i] = 0; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 0;
      continue;
    }
    // Decide yellow vs white by saturation / hue: yellow has high R+G, low B.
    // White has all three high. Threshold on (R+G)/2 - B.
    const yellowness = (r + g) / 2 - b;
    const target = yellowness > 60 ? YELLOW : WHITE;
    out[i] = target.r;
    out[i + 1] = target.g;
    out[i + 2] = target.b;
    out[i + 3] = 255;
  }

  const outW = w * SCALE;
  const outH = h * SCALE;

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .resize({ width: outW, height: outH, kernel: "lanczos3" })
    .sharpen({ sigma: 0.6 })  // gentle crisping
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  const stat = fs.statSync(OUT);
  console.log(`wrote ${OUT}`);
  console.log(`  ${outW}x${outH} · ${(stat.size / 1024).toFixed(1)} KB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
