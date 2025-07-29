import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { AnalyticsProvider } from './components/Analytics';
import ErrorBoundary from './components/ErrorBoundary';
import StructuredData from "./components/StructuredData";

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
  title: "SiteGrade - Expert Website Appraisals & Reviews",
  description: "Get your website professionally reviewed based on 7 core pillars: Performance, Design, Responsiveness, SEO, Security, Compliance, and Analytics. Submit your site for a free review featured on TikTok.",
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
    title: "SiteGrade - Expert Website Appraisals & Reviews",
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
    title: "SiteGrade - Expert Website Appraisals & Reviews",
    description: "Get your website professionally reviewed based on 7 core pillars. Free reviews featured on TikTok.",
    images: ['https://sitegrade.co.uk/SITEGRADE-logo.png'],
    creator: '@sitegrade',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured data */}
        <StructuredData />
      </head>
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
