// Generate a clean, transparent, high-res ROI Labs wordmark PNG from vector text.
// ROI (brand yellow) stacked over letter-spaced black LABS.
const sharp = require("sharp");

const W = 1800, H = 1080;
const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="${W / 2}" y="600" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="560" letter-spacing="-10" fill="#FACC15">ROI</text>
  <text x="${W / 2 + 35}" y="850" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="180" letter-spacing="70" fill="#16130B">LABS</text>
</svg>`;

sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile("design/logos/roi-labs-logo-wordmark.png")
  .then((i) => console.log("wrote design/logos/roi-labs-logo-wordmark.png", i.width + "x" + i.height, (i.size / 1024).toFixed(1) + "KB"))
  .catch((e) => { console.error(e); process.exit(1); });
