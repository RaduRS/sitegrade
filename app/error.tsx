'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col">
      <Header title="SITEGRADE" />
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="heading-xl text-yellow-400 font-retro mb-4">
          Oops!
        </h1>
        <h2 className="heading-lg text-white mb-4 font-retro">
              Something went wrong!
            </h2>
            <p className="text-slate-300 mb-8">
              We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working to fix it.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={reset}
              className="button-3d w-full"
            >
              <span className="button_top">Try Again</span>
            </button>
            
            <Link href="/" className="block">
              <button className="button-3d w-full">
                <span className="button_top">Go Home</span>
              </button>
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-slate-400">
            <p>Need help? Contact us at:</p>
            <a 
              href="mailto:hello@sitegrade.co.uk" 
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              hello@sitegrade.co.uk
            </a>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-yellow-400 mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-red-300 overflow-auto bg-slate-800 p-4 rounded">
                {error.message}
                {error.stack && (
                  <>
                    {'\n\nStack trace:\n'}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}