import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { AnalyticsProvider } from './components/Analytics';
import ErrorBoundary from './components/ErrorBoundary';
import StructuredData from "./components/StructuredData";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: "SiteGrade - Expert Website Appraisals & Reviews",
  description: "Get your website professionally reviewed based on 7 core pillars: Performance, Design, Responsiveness, SEO, Security, Compliance, and Analytics. Free website grading with TikTok reviews.",
  keywords: ["website review", "site audit", "web performance", "SEO analysis", "website grading", "site appraisal", "web design review"],
  authors: [{ name: "SiteGrade", url: "https://sitegrade.co.uk" }],
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
    description: "Get your website professionally reviewed based on 7 core pillars. Free grading with TikTok reviews.",
    url: 'https://sitegrade.co.uk',
    siteName: 'SiteGrade',
    images: [
      {
        url: 'https://sitegrade.co.uk/SITEGRADE-logo.png',
        width: 1200,
        height: 1200,
        alt: 'SiteGrade - Expert Website Appraisals & Reviews',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SiteGrade - Expert Website Appraisals & Reviews",
    description: "Get your website professionally reviewed based on 7 core pillars. Free grading with TikTok reviews.",
    creator: '@sitegrade',
    images: ['https://sitegrade.co.uk/SITEGRADE-logo.png'],
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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/SITEGRADE-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fbbf24" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <StructuredData />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ErrorBoundary>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
