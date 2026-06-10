import type { Metadata } from "next";
import "../stellar.css";
import Stellar from "../Stellar";

export const metadata: Metadata = {
  title: "Stellar.ai — Work Smarter. Move Faster.",
  robots: { index: false, follow: false },
};

export default function StellarPage() {
  return <Stellar />;
}
