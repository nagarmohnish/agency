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

  // First pass: build white-on-transparent buffer (we'll re-tint LABS later
  // once we know the gap rows).
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

  // 3. After horizontal crop: detect the empty band between ROI and LABS rows
  //    inside the cropped region, then shrink that band so the wordmark sits
  //    tighter (closer to a typical wordmark stack).
  const rowHasOpaqueInCrop = (y) => {
    for (let x = cropX; x <= rightCrop; x++) if (isOpaque(x, y)) return true;
    return false;
  };

  // Find the gap: walk down from cropY, find first transparent row after the
  // first opaque region (= bottom of ROI), then find next opaque row (= top
  // of LABS). The gap is between them.
  let gapStart = -1, gapEnd = -1;
  let inFirst = false;
  for (let y = cropY; y <= maxY; y++) {
    const op = rowHasOpaqueInCrop(y);
    if (op) {
      if (gapStart !== -1 && gapEnd === -1) {
        gapEnd = y - 1; // last transparent row
        break;
      }
      inFirst = true;
    } else if (inFirst && gapStart === -1) {
      gapStart = y;
    }
  }

  // Compose output: ROI rows in brand yellow, LABS rows in white.
  const TARGET_GAP = 30; // close to original (50px) with a slight tightening
  const ROI_COLOR  = { r: 250, g: 204, b: 21 };  // #FACC15 brand yellow
  const LABS_COLOR = { r: 255, g: 255, b: 255 }; // white
  const fullW = cropW;
  let outBuf, outH;
  const recolorRow = (srcRowStart, dstRowStart, color) => {
    for (let x = 0; x < fullW; x++) {
      const sa = out[srcRowStart + x * 4 + 3];
      outBuf[dstRowStart + x * 4] = color.r;
      outBuf[dstRowStart + x * 4 + 1] = color.g;
      outBuf[dstRowStart + x * 4 + 2] = color.b;
      outBuf[dstRowStart + x * 4 + 3] = sa;
    }
  };
  if (gapStart > 0 && gapEnd > gapStart) {
    const roiTop = cropY;
    const roiBot = gapStart - 1;
    const labsTop = gapEnd + 1;
    const labsBot = maxY;
    const roiH = roiBot - roiTop + 1;
    const labsH = labsBot - labsTop + 1;
    outH = roiH + TARGET_GAP + labsH;
    outBuf = Buffer.alloc(fullW * outH * 4);

    // ROI rows → yellow
    for (let y = 0; y < roiH; y++) {
      const srcRow = (roiTop + y) * width * 4 + cropX * 4;
      const dstRow = y * fullW * 4;
      recolorRow(srcRow, dstRow, ROI_COLOR);
    }
    // Gap rows zero-filled by Buffer.alloc (transparent).
    // LABS rows → white
    for (let y = 0; y < labsH; y++) {
      const srcRow = (labsTop + y) * width * 4 + cropX * 4;
      const dstRow = (roiH + TARGET_GAP + y) * fullW * 4;
      recolorRow(srcRow, dstRow, LABS_COLOR);
    }
    console.log(`gap: ${gapStart}..${gapEnd} (${gapEnd - gapStart + 1}px) → ${TARGET_GAP}px`);
    console.log(`ROI → #FACC15 (yellow), LABS → #FFFFFF (white)`);
    console.log(`final: ${fullW}x${outH}`);
  } else {
    // Fallback: no gap detected, just crop normally
    outBuf = Buffer.alloc(fullW * cropH * 4);
    for (let y = 0; y < cropH; y++) {
      const srcRow = (cropY + y) * width * 4 + cropX * 4;
      const dstRow = y * fullW * 4;
      out.copy(outBuf, dstRow, srcRow, srcRow + fullW * 4);
    }
    outH = cropH;
  }

  await sharp(outBuf, { raw: { width: fullW, height: outH, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  console.log("wrote", OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
