import type { Metadata } from "next";
import Variant1 from "./_v1";
import Variant2 from "./_v2";
import Variant3 from "./_v3";

export const metadata: Metadata = { title: "Transparent AI — variants", robots: { index: false, follow: false } };

// Dev comparison page: 3 visual takes on "see why every ad was created", stacked.
function Label({ n, name }: { n: number; name: string }) {
  return (
    <div style={{ background: "#070605", color: "rgba(255,255,255,.55)", fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: 12, letterSpacing: "2.5px", padding: "22px 44px", borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#FACC15" }}>VARIANT {n}</span>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,.3)" }} />
      <span>{name}</span>
    </div>
  );
}

export default function TransparentVariants() {
  return (
    <div style={{ background: "#070605" }}>
      <Label n={1} name="HORIZONTAL PIPELINE" />
      <Variant1 />
      <Label n={2} name="REASONING TRACE / INSPECTOR" />
      <Variant2 />
      <Label n={3} name="RADIAL REASONING CORE" />
      <Variant3 />
    </div>
  );
}
