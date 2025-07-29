import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header title="SITEGRADE" />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-400 mb-4">Terms of Service</h1>
            <p className="text-gray-300 text-sm">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-400">1. What We Do</h2>
            <p className="text-gray-300 leading-relaxed">
              SiteGrade reviews websites based on 7 pillars: Performance, Design, Responsiveness, SEO, Security, 
              Compliance, and Analytics. We create educational content about these reviews for TikTok and other platforms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-400">2. When You Submit a Website</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded">
              <p className="text-amber-200 font-semibold mb-2">By submitting a website URL, you agree that:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>You own the website or have permission to submit it</li>
                <li>We may review it and create educational content about it</li>
                <li>We can&apos;t guarantee every website will be reviewed</li>
                <li>Our reviews are our professional opinion, not guarantees</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-400">3. What You Can&apos;t Do</h2>
            <p className="text-gray-300">Please don&apos;t:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Submit websites you don&apos;t own or have permission for</li>
              <li>Submit illegal or harmful content</li>
              <li>Spam our service with multiple submissions</li>
              <li>Try to break our website</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-400">4. Disclaimer</h2>
            <p className="text-gray-300">
              Our reviews are educational opinions based on our expertise. We&apos;re not responsible for any 
              consequences if you act on our suggestions. Use your own judgment!
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-400">5. UK Law</h2>
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