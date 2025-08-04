import { headers } from 'next/headers';

export default async function StructuredData() {
  const headersList = await headers();
  const nonce = headersList.get('X-Nonce');

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SiteGrade",
    url: "https://sitegrade.co.uk",
    logo: "https://sitegrade.co.uk/SITEGRADE-logo.png",
    description:
      "Expert website appraisals and reviews based on 7 core pillars: Performance, Design, Responsiveness, SEO, Security, Compliance, and Analytics. Free reviews featured across social media platforms including TikTok, Instagram, and YouTube.",
    email: "hello@sitegrade.co.uk",
    sameAs: [
      "https://www.tiktok.com/@sitegradeuk",
      "https://www.instagram.com/sitegradeuk/",
      "https://www.youtube.com/@sitegradeuk",
      "https://x.com/sitegradeuk",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hello@sitegrade.co.uk",
      availableLanguage: "English",
    },
    areaServed: "Worldwide",
    serviceType: "Website Review and Analysis",
    foundingDate: "2025",
    knowsAbout: [
      "Website Performance Optimization",
      "SEO Analysis",
      "Web Security Auditing",
      "Responsive Design Testing",
      "Web Accessibility Compliance",
      "Core Web Vitals",
      "Website Analytics",
    ],
  };

  const serviceData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Professional Website Review and Analysis",
    description:
      "Comprehensive website evaluation covering performance, design, SEO, security, compliance, and analytics with expert recommendations.",
    provider: {
      "@type": "Organization",
      name: "SiteGrade",
      url: "https://sitegrade.co.uk",
    },
    serviceType: "Website Analysis",
    areaServed: "Worldwide",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Website Review Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Performance Analysis",
            description:
              "Core Web Vitals assessment and page speed optimization recommendations",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "SEO Audit",
            description:
              "Search engine optimization analysis and improvement strategies",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Security Assessment",
            description:
              "Website security evaluation and vulnerability analysis",
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce || undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData, null, 0) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce || undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceData, null, 0) }}
      />
    </>
  );
}
