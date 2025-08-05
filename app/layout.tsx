import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AnalyticsProvider } from "./components/Analytics";
import ErrorBoundary from "./components/ErrorBoundary";
import StructuredData from "./components/StructuredData";
import WebVitals from "./components/WebVitals";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Improve font loading performance
  weight: ["400", "600", "700"], // Only load needed weights
  preload: true, // Preload for critical text
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap", // Improve font loading performance
  preload: false, // Don't preload since it's only used in typewriter component
});

export const metadata: Metadata = {
  title: "SiteGrade - Instant Website Audit & Performance Report",
  description:
    "Get an instant website audit. We analyze your site's Performance, SEO, Security & more across 7 key pillars to give you an actionable report. Grade your website now.",
  keywords:
    "free website audit, website performance check, improve website speed, website security scan, SEO checker, technical SEO audit, website report card",
  authors: [{ name: "SiteGrade Team" }],
  creator: "SiteGrade",
  publisher: "SiteGrade",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sitegrade.co.uk"),
  alternates: {
    canonical: "https://sitegrade.co.uk/",
  },
  openGraph: {
    title: "SiteGrade - Instant Website Audit & Performance Report",
    description:
      "Get an instant website audit. We analyze your site's Performance, SEO, Security & more across 7 key pillars to give you an actionable report. Grade your website now.",
    url: "https://sitegrade.co.uk",
    siteName: "SiteGrade",
    images: [
      {
        url: "https://sitegrade.co.uk/SITEGRADE-logo.png",
        width: 1200,
        height: 1200,
        alt: "SiteGrade Logo - Instant Website Audits & Reports",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteGrade - Instant Website Audit & Performance Report",
    description:
      "Get an instant website audit. We analyze your site's Performance, SEO, Security & more across 7 key pillars to give you an actionable report. Grade your website now.",
    images: ["https://sitegrade.co.uk/SITEGRADE-logo.png"],
    creator: "@sitegradeuk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
        {/* Essential meta tags for better SEO tool compatibility */}
        <meta
          name="description"
          content="Get an instant website audit. We analyze your site's Performance, SEO, Security & more across 7 key pillars to give you an actionable report. Grade your website now."
        />
        <link rel="canonical" href="https://sitegrade.co.uk/" />

        {/* Open Graph meta tags */}
        <meta
          property="og:title"
          content="SiteGrade - Instant Website Audit & Performance Report"
        />
        <meta
          property="og:description"
          content="Get an instant website audit. We analyze your site's Performance, SEO, Security & more across 7 key pillars to give you an actionable report. Grade your website now."
        />
        <meta property="og:url" content="https://sitegrade.co.uk" />
        <meta property="og:site_name" content="SiteGrade" />
        <meta
          property="og:image"
          content="https://sitegrade.co.uk/SITEGRADE-logo.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta
          property="og:image:alt"
          content="SiteGrade Logo - Instant Website Audits & Reports"
        />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:type" content="website" />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sitegradeuk" />
        <meta name="twitter:creator" content="@sitegradeuk" />
        <meta
          name="twitter:title"
          content="SiteGrade - Instant Website Audit & Performance Report"
        />
        <meta
          name="twitter:description"
          content="Get an instant website audit. We analyze your site's Performance, SEO, Security & more across 7 key pillars to give you an actionable report. Grade your website now."
        />
        <meta
          name="twitter:image"
          content="https://sitegrade.co.uk/SITEGRADE-logo.png"
        />

        {/* Additional meta tags */}
        <meta name="published" content="2025-08-05" />
        <meta name="modified" content="2025-08-05" />
        <meta name="article:published_time" content="2025-08-05T00:00:00Z" />
        <meta name="article:modified_time" content="2025-08-05T00:00:00Z" />

        {/* Accessibility and SEO meta tags */}
        <meta name="color-scheme" content="dark light" />
        <meta
          name="theme-color"
          content="#fbbf24"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0f172a"
          media="(prefers-color-scheme: dark)"
        />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/SITEGRADE-logo.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Viewport and mobile optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Performance and security */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* DNS prefetch for external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

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
