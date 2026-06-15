const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "out");

const homepage = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
const about = fs.readFileSync(path.join(OUT, "about/index.html"), "utf8");

// Find the current Next-generated CSS file (hash changes on every build).
const cssDir = path.join(OUT, "_next/static/chunks");
const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
if (cssFiles.length === 0) {
  throw new Error("No CSS file found in " + cssDir);
}
// If multiple, concatenate (rare — usually just one).
const cssRaw = cssFiles
  .map((f) => fs.readFileSync(path.join(cssDir, f), "utf8"))
  .join("\n");

const css = cssRaw
  .replace(/@font-face\s*\{[^}]*url\(\.\.\/media\/[^)]*\)[^}]*\}/g, "")
  .replace(/url\(["']?data:image\/svg\+xml,[^)]*\)/g, (m) => m);

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Instrument+Serif:ital@0;1&family=Montserrat:wght@300;400;500;600;700&display=swap');`;

const fontVarOverrides = `
:root {
  --font-poppins: "Poppins", system-ui, sans-serif;
  --font-dm-sans: "DM Sans", system-ui, sans-serif;
  --font-serif: "Instrument Serif", Georgia, serif;
  --font-logo-serif: "DM Serif Display", Georgia, serif;
  --font-montserrat: "Montserrat", system-ui, sans-serif;
  --font-mono: "Montserrat", system-ui, sans-serif;
  --font-geist-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
`;

function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  return m ? { className: html.match(/<body([^>]*)>/)[1], inner: m[1] } : null;
}

function stripNextScripts(inner) {
  return inner
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<div hidden=""><!--\$--><!--\/\$--><\/div>/g, "")
    .replace(/<!--\$-->/g, "")
    .replace(/<!--\/\$-->/g, "");
}

function extractMain(inner) {
  const m = inner.match(/<main>([\s\S]*?)<\/main>/);
  return m ? m[1] : "";
}

function extractNav(inner) {
  const m = inner.match(/<nav class="fixed[\s\S]*?<\/nav>/);
  return m ? m[0] : "";
}

function extractFooter(inner) {
  const m = inner.match(/<footer[\s\S]*?<\/footer>/);
  return m ? m[0] : "";
}

const homeBody = extractBody(homepage);
const aboutBody = extractBody(about);
const homeInner = stripNextScripts(homeBody.inner);
const aboutInner = stripNextScripts(aboutBody.inner);

const nav = extractNav(homeInner);
const homeMain = extractMain(homeInner);
const aboutMain = extractMain(aboutInner);
const footer = extractFooter(homeInner);

let aboutSection = aboutMain
  .replace(
    /<a class="inline-flex items-center gap-2 text-small[^"]*"[^>]*href="\/"[^>]*>[\s\S]*?<\/a>/,
    "",
  )
  .replace(/href="\/"/g, 'href="#top"')
  .replace(/href="\/#contact"/g, 'href="#contact"');

const homeMainFixed = homeMain
  .replace(/href="\/about"/g, 'href="#about"')
  .replace(/href="\/#platforms"/g, 'href="#platforms"')
  .replace(/href="\/#contact"/g, 'href="#contact"')
  .replace(/href="\/"/g, 'href="#top"');

const navFixed = nav
  .replace(/href="\/about"/g, 'href="#about"')
  .replace(/href="\/#platforms"/g, 'href="#platforms"')
  .replace(/href="\/#contact"/g, 'href="#contact"')
  .replace(/href="\/"/g, 'href="#top"');

const footerFixed = footer
  .replace(/href="\/about"/g, 'href="#about"')
  .replace(/href="\/#platforms"/g, 'href="#platforms"')
  .replace(/href="\/#contact"/g, 'href="#contact"')
  .replace(/href="\/"/g, 'href="#top"');

const logoPath = path.join(OUT, "roi-logo.png");
const logoB64 = fs.readFileSync(logoPath).toString("base64");
const logoDataUri = `data:image/png;base64,${logoB64}`;

const navWithInlineLogo = navFixed.replace(/src="\/roi-logo\.png"/g, `src="${logoDataUri}"`);
const footerWithInlineLogo = footerFixed.replace(/src="\/roi-logo\.png"/g, `src="${logoDataUri}"`);

const sharedHead = `<style>
${fontImport}
${fontVarOverrides}
${css}

.poppins_68c37264-module__DTUCFW__variable { --font-poppins: "Poppins", system-ui, sans-serif; }
.dm_sans_81a33cc5-module___RQdfW__variable { --font-dm-sans: "DM Sans", system-ui, sans-serif; }
.geist_mono_8d43a2aa-module__8Li5zG__variable { --font-geist-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.instrument_serif_9fef074a-module__WViDWq__variable { --font-serif: "Instrument Serif", Georgia, serif; }
.dm_serif_display_de8b9d8d-module__Wk6Dmq__variable { --font-logo-serif: "DM Serif Display", Georgia, serif; }
.montserrat_ae4835d8-module__LXpBCa__variable { --font-montserrat: "Montserrat", system-ui, sans-serif; }
</style>`;

const sharedScript = `<script>
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var href = a.getAttribute('href');
      if (href.length > 1) {
        var el = document.querySelector(href);
        if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
    });
  });
  var btn = document.querySelector('nav button[aria-label="Toggle menu"]');
  if (btn) {
    var menu = btn.closest('nav').querySelector('.md\\\\:hidden.overflow-hidden');
    btn.addEventListener('click', function(){
      if (!menu) return;
      var open = menu.classList.contains('open');
      if (open) {
        menu.classList.remove('open');
        menu.style.maxHeight = '0';
        menu.style.opacity = '0';
      } else {
        menu.classList.add('open');
        menu.style.maxHeight = '24rem';
        menu.style.opacity = '1';
      }
    });
  }
  var form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'Sent — we will be in touch'; btn.disabled = true; }
    });
  }
})();
</script>`;

const homeNav = navWithInlineLogo
  .replace(/href="#about"/g, 'href="roi-labs-about.html"');
const homeFooter = footerWithInlineLogo
  .replace(/href="#about"/g, 'href="roi-labs-about.html"');

const homeHtml = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ROI Labs | Performance Marketing Agency</title>
<meta name="description" content="Performance marketing agency. We run Meta and Google ads end-to-end — strategy, creative, and measurement focused on revenue, not vanity metrics." />
<meta name="keywords" content="paid ads,Meta ads,Google ads,performance marketing,paid social,PPC agency,ROI" />
${sharedHead}
</head>
<body${homeBody.className} id="top">
${homeNav}
<main>
${homeMainFixed}
</main>
${homeFooter}
${sharedScript}
</body>
</html>
`;

const aboutNav = navWithInlineLogo
  .replace(/href="#top"/g, 'href="roi-labs-home.html"')
  .replace(/href="#platforms"/g, 'href="roi-labs-home.html#platforms"')
  .replace(/href="#contact"/g, 'href="roi-labs-home.html#contact"')
  .replace(/href="#about"/g, 'href="#top"');
const aboutFooter = footerWithInlineLogo
  .replace(/href="#top"/g, 'href="roi-labs-home.html"')
  .replace(/href="#platforms"/g, 'href="roi-labs-home.html#platforms"')
  .replace(/href="#contact"/g, 'href="roi-labs-home.html#contact"')
  .replace(/href="#about"/g, 'href="#top"');

const aboutSectionFixed = aboutSection
  .replace(/href="#contact"/g, 'href="roi-labs-home.html#contact"');

const aboutHtml = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>About Us | ROI Labs</title>
<meta name="description" content="We're a boutique performance marketing agency specializing in paid social advertising. Meet the team behind $8M+ in managed ad spend and $34M in revenue generated." />
<meta name="keywords" content="about roilabs,performance marketing agency,paid social agency,advertising team,marketing experts" />
${sharedHead}
</head>
<body${aboutBody.className} id="top">
${aboutNav}
<main>
${aboutSectionFixed}
</main>
${aboutFooter}
${sharedScript}
</body>
</html>
`;

const homePath = path.join(ROOT, "design/pages/roi-labs-home.html");
const aboutPath = path.join(ROOT, "design/pages/roi-labs-about.html");
fs.writeFileSync(homePath, homeHtml);
fs.writeFileSync(aboutPath, aboutHtml);
console.log("Wrote", homePath, `(${(homeHtml.length / 1024).toFixed(1)} KB)`);
console.log("Wrote", aboutPath, `(${(aboutHtml.length / 1024).toFixed(1)} KB)`);

const oldBundle = path.join(ROOT, "roi-labs-standalone.html");
if (fs.existsSync(oldBundle)) {
  fs.unlinkSync(oldBundle);
  console.log("Removed", oldBundle);
}
