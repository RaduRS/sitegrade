import { headers } from 'next/headers';

export default async function StructuredData() {
  const headersList = await headers();
  const nonce = headersList.get('X-Nonce');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SiteGrade",
    "url": "https://sitegrade.co.uk",
    "logo": "https://sitegrade.co.uk/SITEGRADE-logo.png",
    "description": "Expert website appraisals and reviews based on 7 core pillars: Performance, Design, Responsiveness, SEO, Security, Compliance, and Analytics.",
    "email": "hello@sitegrade.co.uk",
    "sameAs": [
      "https://tiktok.com/@sitegrade"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "hello@sitegrade.co.uk",
      "availableLanguage": "English"
    },
    "areaServed": "Worldwide",
    "serviceType": "Website Review and Analysis"
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce || undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}