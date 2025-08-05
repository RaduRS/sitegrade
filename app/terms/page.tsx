import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - SiteGrade",
  description:
    "Terms of service for SiteGrade instant website audit service. Understand your rights when getting your website performance report.",
  metadataBase: new URL("https://sitegrade.co.uk"),
  alternates: {
    canonical: "https://sitegrade.co.uk/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header title="SITEGRADE" />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <div>
            <h1 className="heading-xl text-amber-400 mb-4 font-retro">
              Terms of Service
            </h1>
            <p className="text-gray-300 text-sm">
              Last updated: {new Date().toLocaleDateString("en-GB")}
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              1. What We Do
            </h2>
            <p className="text-gray-300 leading-relaxed">
              SiteGrade provides automated website analysis and reports. We
              evaluate websites based on 7 core pillars: Performance, Design,
              Responsiveness, SEO, Security, Compliance, and Analytics. All
              submissions receive a detailed report via email. We may showcase
              selected reports and websites in educational content on social
              media.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              2. When You Submit a Website
            </h2>
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded">
              <p className="text-amber-200 font-semibold mb-2">
                By submitting your website, you agree that:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li>You own the website or have permission to submit it</li>
                <li>
                  You provide a valid email address to receive your analysis
                  report
                </li>
                <li>
                  Your website and our review may appear in public educational
                  content on TikTok, Instagram, YouTube, X (Twitter), and other
                  social media platforms
                </li>
                <li>
                  We may use your website URL for review and educational
                  purposes
                </li>
                <li>
                  All submissions receive an automated analysis report via email
                </li>
                <li>
                  We may feature selected reports and websites in our social
                  media content at our discretion
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              3. What You Can&apos;t Do
            </h2>
            <p className="text-gray-300">You must not:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>
                Submit websites you don&apos;t own or lack permission to submit
              </li>
              <li>Submit malicious, illegal, or inappropriate content</li>
              <li>Spam our service with multiple submissions</li>
              <li>Use our service to harm others or violate any laws</li>
              <li>
                Attempt to reverse engineer or copy our analysis methodology
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              4. Educational Analysis Reports and Disclaimer
            </h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                Our analysis reports are educational opinions based on our
                expertise and industry best practices. Analysis reports may
                include:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li>
                  Constructive criticism about website performance, design, or
                  functionality
                </li>
                <li>
                  Technical assessments that may highlight areas for improvement
                </li>
                <li>
                  Honest evaluations that could range from positive to negative
                  feedback
                </li>
                <li>
                  Educational commentary intended to help others learn web
                  development best practices
                </li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                We provide no warranties about the accuracy or completeness of
                our analysis reports. Our assessments are subjective opinions
                for educational purposes. Use our feedback at your own
                discretion. We are not liable for any decisions you make based
                on our analysis reports, nor for any business impact resulting
                from public reports.
              </p>
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded mt-3">
                <p className="text-red-200 text-sm">
                  <strong>Important:</strong> By submitting your website, you
                  acknowledge that analysis reports may be critical and will be
                  publicly visible on social media platforms. You waive any
                  claims related to defamation, business harm, or reputational
                  damage arising from honest educational analysis reports.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">5. UK Law</h2>
            <p className="text-gray-300">
              These terms are governed by English law. If you have questions,
              please contact us at:{" "}
              <a
                href="mailto:hello@sitegrade.co.uk"
                className="text-amber-400 hover:text-amber-300"
              >
                hello@sitegrade.co.uk
              </a>
            </p>
          </section>

          <div className="mt-12 flex justify-center">
            <Link href="/" className="button-3d">
              <span className="button_top">← Grade My Site</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
