import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from 'next/font/google';
import "./globals.css";

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
  authors: [{ name: "SiteGrade" }],
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
        url: 'https://sitegrade.co.uk/og-image.svg',
        width: 1200,
        height: 630,
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
    images: ['https://sitegrade.co.uk/og-image.svg'],
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
