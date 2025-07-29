import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header title="SITEGRADE" />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-amber-400 mb-4">Cookie Policy</h1>
              <p className="text-gray-300 text-sm">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-400">1. What Are Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                understanding how you use our site.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-400">2. How We Use Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies only for essential functionality and analytics (with your consent). 
                We do not use cookies for advertising or tracking across other websites.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-400">3. What Cookies We Use</h2>
              <p className="text-gray-300">
                We only use Google Analytics to understand how visitors use our website. This helps us improve our service.
              </p>
              <p className="text-gray-300">
                You can choose to accept or reject these cookies when you visit our site.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-400">4. Third-Party Cookies</h2>
              <p className="text-gray-300">
                Google Analytics may set cookies to track website usage. For more information about Google&apos;s privacy practices, 
                visit <a href="https://policies.google.com/privacy" className="text-amber-400 hover:text-amber-300 underline" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-400">5. Managing Your Preferences</h2>
              <p className="text-gray-300">
                You can accept or reject analytics cookies using the banner that appears when you first visit our website. 
                You can also disable cookies in your browser settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-400">6. Updates to This Policy</h2>
              <p className="text-gray-300">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page 
                with an updated date. If we make significant changes, we may ask for your consent again.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-400">7. Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about our use of cookies, please contact us at: <a href="mailto:hello@sitegrade.co.uk" className="text-amber-400 hover:text-amber-300">hello@sitegrade.co.uk</a>
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