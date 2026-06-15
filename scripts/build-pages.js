const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const STAGE = process.argv[2] || "/tmp/gh-pages-stage";

fs.mkdirSync(STAGE, { recursive: true });

const home = fs.readFileSync(path.join(ROOT, "design/pages/roi-labs-home.html"), "utf8")
  .replace(/href="roi-labs-about\.html"/g, 'href="about.html"');

const about = fs.readFileSync(path.join(ROOT, "design/pages/roi-labs-about.html"), "utf8")
  .replace(/href="roi-labs-home\.html#contact"/g, 'href="./#contact"')
  .replace(/href="roi-labs-home\.html#platforms"/g, 'href="./#platforms"')
  .replace(/href="roi-labs-home\.html"/g, 'href="./"');

fs.writeFileSync(path.join(STAGE, "index.html"), home);
fs.writeFileSync(path.join(STAGE, "about.html"), about);
fs.writeFileSync(path.join(STAGE, ".nojekyll"), "");

console.log("Staged:", STAGE);
console.log("  index.html", `(${(home.length / 1024).toFixed(1)} KB)`);
console.log("  about.html", `(${(about.length / 1024).toFixed(1)} KB)`);
