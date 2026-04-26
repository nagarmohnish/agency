// Pipeline: read original cream-backed wordmark PNG, threshold dark text into
// a binary alpha mask (cream → transparent, ink → white), then auto-trim the
// transparent margins. Finally crop horizontally to drop the [ ] brackets,
// leaving just the "ROI / LABS" wordmark in the original typeface.

const sharp = require("sharp");

const SRC = "C:/Users/mohni/AppData/Local/Temp/roi-design-v2/roi/project/assets/roi-logo.png";
const OUT = "c:/Library/Projects/agency/public/roi-logo.png";

async function main() {
  // 1. Read raw RGBA, build white-on-transparent buffer
  const raw = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const { width, height, channels } = info;
  const out = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = (r + g + b) / 3;
    let alpha;
    if (lum < 80) alpha = 255;
    else if (lum > 230) alpha = 0;
    else alpha = Math.round(255 * (1 - (lum - 80) / 150));
    out[i] = 255;
    out[i + 1] = 255;
    out[i + 2] = 255;
    out[i + 3] = alpha;
  }

  // 2. Find bracket-free inner content by scanning columns of opaque pixels
  //    Brackets sit as narrow tall regions at the left and right edges; the
  //    ROI/LABS glyphs occupy the centre. We detect bracket columns as
  //    those with significant opacity in the upper third only.
  const isOpaque = (x, y) => out[(y * width + x) * 4 + 3] > 32;

  // Find leftmost/rightmost opaque column overall (bounding box)
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isOpaque(x, y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Inset horizontally to skip the bracket columns. The brackets typically
  // span ~15-20% of the cropped width on each side. Find first column from
  // the left that has a significant opaque run in the lower half too — that
  // marks the start of "L" in LABS or the body of ROI (brackets are top-only? no,
  // they're full-height). Better strategy: the brackets are SEPARATED from
  // the ROI by a clear transparent gutter. Walk columns left → right looking
  // for a fully-transparent column after the first opaque region.

  const colHasOpaque = (x) => {
    for (let y = 0; y < height; y++) if (isOpaque(x, y)) return true;
    return false;
  };

  // Walk from minX rightward: find first transparent gutter, then next opaque
  let leftCrop = minX;
  let inFirstRegion = false;
  for (let x = minX; x <= maxX; x++) {
    if (colHasOpaque(x)) inFirstRegion = true;
    else if (inFirstRegion) {
      // Hit a gutter after the bracket; consume the gutter then start at next opaque
      while (x <= maxX && !colHasOpaque(x)) x++;
      leftCrop = x;
      break;
    }
  }

  // Mirror from right
  let rightCrop = maxX;
  let inLastRegion = false;
  for (let x = maxX; x >= minX; x--) {
    if (colHasOpaque(x)) inLastRegion = true;
    else if (inLastRegion) {
      while (x >= minX && !colHasOpaque(x)) x--;
      rightCrop = x;
      break;
    }
  }

  const cropX = leftCrop;
  const cropY = minY;
  const cropW = rightCrop - leftCrop + 1;
  const cropH = maxY - minY + 1;

  console.log(`bbox: x=${minX}..${maxX}, y=${minY}..${maxY}`);
  console.log(`crop (no brackets): x=${cropX}, y=${cropY}, w=${cropW}, h=${cropH}`);

  await sharp(out, { raw: { width, height, channels: 4 } })
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  console.log("wrote", OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
