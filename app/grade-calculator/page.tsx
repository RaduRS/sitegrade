import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GradeCalculator from "../components/GradeCalculator";
import GradeCalculatorStructuredData from "../components/GradeCalculatorStructuredData";
import { siteData } from "../data/siteData";

export const metadata: Metadata = {
  title: "Grade Calculator - SiteGrade Website Assessment Tool",
  description:
    "Calculate your website's overall grade based on our 7 core pillars: Performance, Design, Responsiveness, SEO, Security, Compliance, and Analytics. Free interactive grading tool.",
  keywords:
    "website grade calculator, website assessment tool, web performance calculator, SEO grade calculator, website scoring system, site evaluation tool",
  authors: [{ name: "SiteGrade Team" }],
  creator: "SiteGrade",
  publisher: "SiteGrade",
  metadataBase: new URL("https://sitegrade.co.uk"),
  alternates: {
    canonical: "https://sitegrade.co.uk/grade-calculator",
  },
  openGraph: {
    title: "Grade Calculator - SiteGrade Website Assessment Tool",
    description:
      "Calculate your website's overall grade based on our 7 core pillars. Free interactive grading tool for website performance assessment.",
    url: "https://sitegrade.co.uk/grade-calculator",
    siteName: "SiteGrade",
    images: [
      {
        url: "https://sitegrade.co.uk/SITEGRADE-logo.png",
        width: 1200,
        height: 1200,
        alt: "SiteGrade Grade Calculator - Website Assessment Tool",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grade Calculator - SiteGrade Website Assessment Tool",
    description:
      "Calculate your website's overall grade based on our 7 core pillars. Free interactive grading tool.",
    images: ["https://sitegrade.co.uk/SITEGRADE-logo.png"],
    creator: "@sitegradeuk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function GradeCalculatorPage() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <GradeCalculatorStructuredData />
      <Header title="SITEGRADE" />

      <main id="main-content" className="w-full" role="main">
        <GradeCalculator pillars={siteData.pillars.items} />
      </main>

      <Footer />
    </div>
  );
}
