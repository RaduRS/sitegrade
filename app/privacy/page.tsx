import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - SiteGrade",
  description:
    "Privacy policy for SiteGrade instant website audit service. Learn how we protect your data when you get your website performance report.",
  metadataBase: new URL("https://sitegrade.co.uk"),
  alternates: {
    canonical: "https://sitegrade.co.uk/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header title="SITEGRADE" />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <div>
            <h1 className="heading-xl text-amber-400 mb-4 font-retro">
              Privacy Policy
            </h1>
            <p className="text-gray-300 text-sm">
              Last updated: {new Date().toLocaleDateString("en-GB")}
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              1. Who We Are
            </h2>
            <p className="text-gray-300 leading-relaxed">
              SiteGrade (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
              operates the website sitegrade.co.uk. We provide automated website
              analysis and reports based on 7 core pillars: Performance, Design,
              Responsiveness, SEO, Security, Compliance, and Analytics.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              2. Information We Collect
            </h2>
            <div className="space-y-3">
              <h3 className="heading-md text-white font-retro">Website URLs</h3>
              <p className="text-gray-300">
                When you submit a website for analysis, we collect the website
                URL you provide. This is stored securely so we can analyze your
                website and create educational content.
              </p>

              <h3 className="heading-md text-white font-retro">
                Email Addresses
              </h3>
              <p className="text-gray-300">
                We collect your email address when you submit a website for
                analysis. This is required to send you the completed website
                analysis report and is the primary reason for collection. We
                will not sell, rent, or share your email address with third
                parties for marketing purposes.
              </p>

              <h3 className="heading-md text-white font-retro">
                Analytics Data
              </h3>
              <p className="text-gray-300">
                We use Google Analytics to understand how visitors use our
                website. This helps us improve our service. You can choose to
                accept or reject analytics tracking when you visit our site.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-300">
              We use the information you provide as follows:
            </p>

            <h3 className="heading-md text-white font-retro mt-4">
              Website URLs:
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>
                Analyze your website based on our 7 pillars (Performance,
                Design, Responsiveness, SEO, Security, Compliance, Analytics)
              </li>
              <li>
                Create educational content for TikTok, Instagram, YouTube, X
                (Twitter), and other social media platforms
              </li>
              <li>Help others learn about web development best practices</li>
            </ul>

            <h3 className="heading-md text-white font-retro mt-4">
              Email Addresses:
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Send you the completed website analysis report</li>
              <li>Provide updates about your submitted website analysis</li>
              <li>Contact you if we have questions about your submission</li>
            </ul>

            <p className="text-gray-300 mt-4">
              We use analytics data to understand how people use our website and
              improve our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              4. Public Reports and Content
            </h2>
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded">
              <p className="text-amber-200 font-semibold mb-2">
                Important Notice:
              </p>
              <p className="text-gray-300">
                When you submit your website for analysis, you understand and
                consent that:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2 ml-4">
                <li>
                  Your website URL and our analysis report may be featured in
                  public content on TikTok, Instagram, YouTube, X (Twitter), and
                  other social media platforms
                </li>
                <li>
                  Analysis reports are educational and may include constructive
                  criticism
                </li>
                <li>
                  All submitted websites receive an automated analysis report
                </li>
                <li>
                  We may feature selected analysis reports and websites in our
                  social media content at our discretion
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              5. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-300">
              We do not sell, trade, or rent your personal information. We may
              share information only:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>With your explicit consent</li>
              <li>To comply with legal requirements</li>
              <li>To protect our rights and safety</li>
              <li>
                With service providers who assist in our operations (under
                strict confidentiality)
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              6. Data Retention
            </h2>
            <p className="text-gray-300">
              We retain your information only as long as necessary for the
              purposes outlined in this policy. Website URLs submitted for
              analysis may be retained indefinitely for reference purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              7. Your Rights
            </h2>
            <p className="text-gray-300">
              Since we collect website URLs and email addresses for analysis
              purposes, you can contact us at hello@sitegrade.co.uk if you want
              us to remove your website from our records or if you have any
              questions about our process.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              8. Security
            </h2>
            <p className="text-gray-300">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              9. International Transfers
            </h2>
            <p className="text-gray-300">
              Your data may be processed outside the UK/EEA by our service
              providers (such as Google Analytics). We ensure appropriate
              safeguards are in place for such transfers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              10. Changes to This Policy
            </h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page with an updated date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">
              11. Contact Us
            </h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please
              contact us at:{" "}
              <a
                href="mailto:hello@sitegrade.co.uk"
                className="text-amber-400 hover:text-amber-300"
              >
                hello@sitegrade.co.uk
              </a>
            </p>
          </section>

          <div className="pt-8">
            <div className="flex justify-center">
              <Link href="/" className="button-3d">
                <span className="button_top">← Grade My Site</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
