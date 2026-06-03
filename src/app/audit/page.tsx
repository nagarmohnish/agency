import type { Metadata } from "next";
import "../aurora.css";
import AuditPage from "../AuditPage";

export const metadata: Metadata = {
  title: "Free AI Ad Audit — graded PDF report | ROI Labs",
  description:
    "Run the ROI Labs AI Auditor: it scores your Meta & Google measurement, strategy, landing pages, and creative, tears down your competitors, and emails you a branded PDF report in minutes.",
  alternates: { canonical: "/audit" },
  openGraph: {
    url: "/audit",
    title: "Free AI Ad Audit — graded PDF report | ROI Labs",
    description:
      "Score your Meta & Google account across measurement, strategy, landing pages, and creative — and get a branded PDF report in minutes.",
  },
};

export default function AuditRoute() {
  return <AuditPage />;
}
