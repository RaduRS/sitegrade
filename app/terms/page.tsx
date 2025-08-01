import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Route Segment Config for bfcache optimization
export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header title="SITEGRADE" />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <div>
            <h1 className="heading-xl text-amber-400 mb-4 font-retro">Terms of Service</h1>
            <p className="text-gray-300 text-sm">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">1. What We Do</h2>
            <p className="text-gray-300 leading-relaxed">
              SiteGrade provides professional website reviews and appraisals. We evaluate websites based on 7 core pillars: 
              Performance, Design, Responsiveness, SEO, Security, Compliance, and Analytics. Our reviews may be featured 
              in educational content on social media platforms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">2. When You Submit a Website</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded">
              <p className="text-amber-200 font-semibold mb-2">By submitting your website, you agree that:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li>You own the website or have permission to submit it</li>
                <li>Your website and our review may appear in public educational content</li>
                <li>We may use your website URL for review and educational purposes</li>
                <li>Reviews are conducted at our discretion and availability</li>
                <li>We cannot guarantee every submission will be reviewed</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">3. What You Can&apos;t Do</h2>
            <p className="text-gray-300">You must not:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Submit websites you don&apos;t own or lack permission to submit</li>
              <li>Submit malicious, illegal, or inappropriate content</li>
              <li>Spam our service with multiple submissions</li>
              <li>Use our service to harm others or violate any laws</li>
              <li>Attempt to reverse engineer or copy our review methodology</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">4. Educational Reviews and Disclaimer</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                Our reviews are educational opinions based on our expertise and industry best practices. Reviews may include:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li>Constructive criticism about website performance, design, or functionality</li>
                <li>Technical assessments that may highlight areas for improvement</li>
                <li>Honest evaluations that could range from positive to negative feedback</li>
                <li>Educational commentary intended to help others learn web development best practices</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                We provide no warranties about the accuracy or completeness of our reviews. Our assessments are subjective 
                opinions for educational purposes. Use our feedback at your own discretion. We are not liable for any 
                decisions you make based on our reviews, nor for any business impact resulting from public reviews.
              </p>
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded mt-3">
                <p className="text-red-200 text-sm">
                  <strong>Important:</strong> By submitting your website, you acknowledge that reviews may be critical 
                  and will be publicly visible on social media platforms. You waive any claims related to defamation, 
                  business harm, or reputational damage arising from honest educational reviews.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg text-amber-400 font-retro">5. UK Law</h2>
            <p className="text-gray-300">
              These terms are governed by English law. If you have questions, please contact us at: <a href="mailto:hello@sitegrade.co.uk" className="text-amber-400 hover:text-amber-300">hello@sitegrade.co.uk</a>
            </p>
          </section>

          <div className="mt-12 flex justify-center">
            <Link 
              href="/" 
              className="button-3d"
            >
              <span className="button_top">← Grade My Site</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}