const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const APP = path.join(ROOT, "src/app");
const SOURCE = path.join(PUBLIC, "roi-logo.png");

const BG = { r: 10, g: 10, b: 10, alpha: 1 };

async function main() {
  const logoBuf = fs.readFileSync(SOURCE);
  const meta = await sharp(logoBuf).metadata();
  console.log(`Source: ${SOURCE} (${meta.width}x${meta.height})`);

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: BG },
  })
    .composite([{ input: await sharp(logoBuf).resize({ width: 360, fit: "inside" }).png().toBuffer(), gravity: "center" }])
    .png()
    .toFile(path.join(PUBLIC, "icon-512.png"));

  await sharp({
    create: { width: 192, height: 192, channels: 4, background: BG },
  })
    .composite([{ input: await sharp(logoBuf).resize({ width: 140, fit: "inside" }).png().toBuffer(), gravity: "center" }])
    .png()
    .toFile(path.join(PUBLIC, "icon-192.png"));

  await sharp({
    create: { width: 180, height: 180, channels: 4, background: BG },
  })
    .composite([{ input: await sharp(logoBuf).resize({ width: 130, fit: "inside" }).png().toBuffer(), gravity: "center" }])
    .png()
    .toFile(path.join(PUBLIC, "apple-touch-icon.png"));

  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: BG },
  })
    .composite([{ input: await sharp(logoBuf).resize({ width: 320, fit: "inside" }).png().toBuffer(), gravity: "center" }])
    .png()
    .toFile(path.join(PUBLIC, "og-image.png"));

  await sharp({
    create: { width: 32, height: 32, channels: 4, background: BG },
  })
    .composite([{ input: await sharp(logoBuf).resize({ width: 26, fit: "inside" }).png().toBuffer(), gravity: "center" }])
    .png()
    .toFile(path.join(PUBLIC, "icon-32.png"));

  console.log("Wrote: icon-512.png, icon-192.png, apple-touch-icon.png, og-image.png, icon-32.png");

  await fs.promises.copyFile(path.join(PUBLIC, "icon-32.png"), path.join(APP, "icon.png"));
  await fs.promises.copyFile(path.join(PUBLIC, "apple-touch-icon.png"), path.join(APP, "apple-icon.png"));
  console.log("Copied app/icon.png and app/apple-icon.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
