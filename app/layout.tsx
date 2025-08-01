import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { AnalyticsProvider } from './components/Analytics';
import ErrorBoundary from './components/ErrorBoundary';
import StructuredData from "./components/StructuredData";
import WebVitals from "./components/WebVitals";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Improve font loading performance
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap', // Improve font loading performance
});

export const metadata: Metadata = {
  title: "SiteGrade Expert Website Appraisals and Reviews",
  description: "Get your website professionally reviewed based on 7 core pillars. Performance, Design, SEO, Security analysis. Free reviews featured on TikTok.",
  keywords: "website review, website appraisal, web design analysis, SEO audit, performance testing, website grading, TikTok reviews",
  authors: [{ name: "SiteGrade Team" }],
  creator: "SiteGrade",
  publisher: "SiteGrade",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sitegrade.co.uk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SiteGrade Expert Website Appraisals and Reviews",
    description: "Get your website professionally reviewed based on 7 core pillars. Free reviews featured on TikTok.",
    url: 'https://sitegrade.co.uk',
    siteName: 'SiteGrade',
    images: [
      {
        url: 'https://sitegrade.co.uk/SITEGRADE-logo.png',
        width: 1200,
        height: 1200,
        alt: 'SiteGrade Logo - Professional Website Reviews',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SiteGrade Expert Website Appraisals and Reviews",
    description: "Get your website professionally reviewed based on 7 core pillars. Free reviews featured on TikTok.",
    images: ['https://sitegrade.co.uk/SITEGRADE-logo.png'],
    creator: '@sitegradeuk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" dir="ltr">
      <head>
        {/* SEO meta tags */}
        <meta name="description" content="Get your website professionally reviewed based on 7 core pillars. Performance, Design, SEO, Security analysis. Free reviews featured on TikTok." />
        <meta name="keywords" content="website review, website appraisal, web design analysis, SEO audit, performance testing, website grading, TikTok reviews" />
        <meta name="author" content="SiteGrade Team" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://sitegrade.co.uk/" />
        
        {/* Accessibility and SEO meta tags */}
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#fbbf24" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/SITEGRADE-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Viewport and mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Performance and security */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* DNS prefetch for external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://analytics.google.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Prefetch likely next pages */}
        <link rel="prefetch" href="/privacy" />
        
        {/* Resource hints for better performance */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Structured data */}
        <StructuredData />
      </head>
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {/* Skip navigation for keyboard users */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-slate-900 focus:rounded focus:font-medium"
        >
          Skip to main content
        </a>
        
        <ErrorBoundary>
          <AnalyticsProvider>
            <WebVitals />
            {children}
          </AnalyticsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
