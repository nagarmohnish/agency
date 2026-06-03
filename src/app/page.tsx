import type { Metadata } from "next";
import "./aurora.css";
import AuroraHome from "./AuroraHome";

export const metadata: Metadata = {
  title: "ROI Labs | AI-Native Paid Media Agency",
  description:
    "ROI Labs is the AI-native paid media agency. AI agents draft and test creative at a volume no human team can match; senior operators own the strategy and the number that matters — revenue. We run Meta and Google end-to-end.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "ROI Labs | AI-Native Paid Media Agency",
    description:
      "AI agents draft and test creative at a volume no human team can match; senior operators own the strategy and the number that matters — revenue. We run Meta and Google end-to-end.",
  },
};

export default function Home() {
  return <AuroraHome />;
}
