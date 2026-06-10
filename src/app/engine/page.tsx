import type { Metadata } from "next";
import Dashboard from "./Dashboard";
import "./engine.css";

export const metadata: Metadata = {
  title: "ROI Labs — Engine",
  robots: { index: false, follow: false }, // internal ops tool, never indexed
};

export default function EnginePage() {
  return <Dashboard />;
}
