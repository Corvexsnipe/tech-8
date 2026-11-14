import type { Metadata } from "next";
import { Landing } from "@/components/landing";
import { landingData } from "@/lib/landing-data";
import "./landing.css";

export const metadata: Metadata = {
  title: { absolute: "Review Matters — Real Reviews. Real Reputation." },
  description: "Discover businesses, share genuine experiences, and make better decisions with transparent customer reviews and A+ to D reputation grades.",
  alternates: { canonical: "/" },
  openGraph: { title: "Review Matters — Real Reviews. Real Reputation.", description: "Real experiences. Transparent letter grades. A clearer picture of business reputation." },
};
export default async function HomePage() {
  return <Landing data={await landingData()} />;
}
