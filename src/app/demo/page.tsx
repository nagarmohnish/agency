import type { Metadata } from "next";
import "../demo.css";
import Demo from "../Demo";

export const metadata: Metadata = {
  title: "ROI Labs — demo design",
  robots: { index: false, follow: false },
};

export default function DemoRoute() {
  return <Demo />;
}
