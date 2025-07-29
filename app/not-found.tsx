import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Header title="SITEGRADE" />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-mono font-bold text-yellow-400 mb-4">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Page Not Found
            </h2>
            <p className="text-slate-300 mb-8">
              Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/"
              className="button-3d inline-block"
              aria-label="Go back to homepage"
            >
              <span className="button_top">
                Back to Home
              </span>
            </Link>
            
            <div className="text-sm text-slate-400">
              <p>Need help? Contact us at{' '}
                <a 
                  href="mailto:hello@sitegrade.co.uk" 
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  hello@sitegrade.co.uk
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}