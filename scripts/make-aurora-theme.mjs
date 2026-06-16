import fs from "fs";
const root = "C:/Library/Projects/agency/src/app/engine/";
let s = fs.readFileSync(root + "v3.tsx", "utf8");

// header note + function rename
s = s.replace(
  '// ROI Engine — redesigned cockpit (Claude Design handoff "ROI Engine.dc.html").',
  '// ROI Engine — AURORA themed variant (roilabs.in look: cream/white, warm ink, brand\n// yellow/gold, Sora + Manrope). Generated from v3.tsx via a palette remap; route /engine/aurora.'
);
s = s.replace("export default function EngineV3(", "export default function EngineAurora(");

// fonts → Aurora (Sora display, Manrope body; keep JetBrains Mono for tabular data)
s = s.split("'Space Grotesk'").join("'Sora'");
s = s.split("'Hanken Grotesk'").join("'Manrope'");

// palette map: Atlas (indigo/cool) → Aurora (gold/warm). Brand+source+status kept.
const MAP = {
  // ink / neutrals (warm)
  "#15171C": "#1A1710", "#6B7280": "#6A6456", "#9CA0A8": "#9C968A", "#B7BAC2": "#B3AC9A",
  "#8C89B4": "#A89F86", "#A6A3CC": "#C9C2B0", "#C9C7E6": "#D8D0BC", "#E8E7F4": "#EDE6D5",
  "#5E5A8C": "#9A9078", "#3F3A86": "#6E5206", "#312C72": "#7A5A06",
  // surfaces / fills
  "#F4F5F7": "#FAF7F0", "#F6F7FB": "#FBF6E6", "#F1F2F6": "#F0EBDD", "#F2F3F6": "#F1ECDF",
  "#F4F5F8": "#F4EFE3", "#EFF0F4": "#EFEADB", "#E7E9F0": "#EAE4D5", "#FBFAFF": "#FFFDF4",
  "#F4F4FB": "#FBF1D2",
  // borders
  "#ECEDF1": "#ECE7DA", "#E1E4EA": "#E3DCCB", "#D9DBE2": "#D8D1C0", "#D9DCFB": "#F0E3B8",
  "#C7C2F5": "#E6D6A0",
  // accent (indigo) + graded ramp → gold
  "#4F46E5": "#AA7C09", "#EEF0FE": "#FBF1D2", "#6366F1": "#C2890B", "#818CF8": "#D9A52A",
  "#A5B4FC": "#E8C25C", "#C7CBE8": "#F0D88E", "#DDE0EE": "#F5E6B8", "#7C73F0": "#C99A1F",
  "#CBD0DA": "#CFC8B6", "#94A3B8": "#B0A892",
  // dark sidebar / strip
  "#1A1712": "#1A1710", "#15123A": "#262017",
  // status (warm-shift)
  "#16A34A": "#1E9E6A", "#DC2626": "#CC4A3F", "#FCEBEA": "#FBEAE6",
};
for (const [oldC, newC] of Object.entries(MAP)) {
  s = s.replace(new RegExp(oldC, "gi"), newC);
}

fs.writeFileSync(root + "v3aurora.tsx", s);
console.log("wrote v3aurora.tsx (" + s.length + " chars)");
// report any residual indigo that slipped through
const left = (s.match(/#4F46E5|#1E1B4B|Space Grotesk|Hanken Grotesk/gi) || []).length;
console.log("residual Atlas tokens:", left);
