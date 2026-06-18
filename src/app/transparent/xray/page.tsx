import type { Metadata } from "next";
import Variant4Xray from "../_v4xray";

export const metadata: Metadata = { title: "Transparent AI — annotated ad", robots: { index: false, follow: false } };

// Dev preview of the annotated-ad "X-ray" direction.
export default function TransparentXray() {
  return <Variant4Xray />;
}
