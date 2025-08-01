export default function GradeCalculatorStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SiteGrade Website Grade Calculator",
    description:
      "Interactive tool to calculate your website's overall grade based on 7 core pillars: Performance, Design, Responsiveness, SEO, Security, Compliance, and Analytics.",
    url: "https://sitegrade.co.uk/grade-calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    creator: {
      "@type": "Organization",
      name: "SiteGrade",
      url: "https://sitegrade.co.uk",
    },
    featureList: [
      "Website Performance Grading",
      "Design Quality Assessment",
      "Mobile Responsiveness Evaluation",
      "SEO Score Calculation",
      "Security Assessment",
      "Compliance Checking",
      "Analytics Implementation Review",
    ],
    browserRequirements: "Requires JavaScript. Works with all modern browsers.",
    softwareVersion: "1.0",
    datePublished: "2025-01-27",
    inLanguage: "en-GB",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
