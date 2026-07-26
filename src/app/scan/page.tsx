import type { Metadata } from "next";
import { ScanPageClient } from "@/components/ScanPageClient";

export const metadata: Metadata = {
  title: "Activity scan · GrokfMRI",
  description:
    "Full-page activity scan of Grok memory events over time (local, read-only).",
};

export default function ScanPage() {
  return <ScanPageClient />;
}
