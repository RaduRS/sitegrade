import { 
  Zap, 
  Palette, 
  Smartphone, 
  Search, 
  Shield, 
  CheckCircle, 
  BarChart3 
} from "lucide-react";

export const siteData = {
  brand: {
    name: "SITEGRADE",
    description: "Professional website reviews for the modern web"
  },
  
  hero: {
    title: "We grade sites for",
    typewriterWords: [
      "Performance",
      "Design", 
      "Responsiveness",
      "SEO",
      "Security",
      "Compliance",
      "Analytics"
    ]
  },

  pillars: {
    title: "Our 7 Grading Pillars",
    subtitle: "Every website review is evaluated across these core areas to give you a comprehensive assessment",
    items: [
      {
        name: "Performance",
        description: "Loading speed, Core Web Vitals, and overall site optimization for the best user experience.",
        icon: Zap
      },
      {
        name: "Design",
        description: "Visual appeal, user interface quality, and overall aesthetic that engages your visitors.",
        icon: Palette
      },
      {
        name: "Responsiveness",
        description: "How well your site adapts across devices - mobile, tablet, and desktop compatibility.",
        icon: Smartphone
      },
      {
        name: "SEO",
        description: "Search engine optimization, meta tags, structure, and discoverability factors.",
        icon: Search
      },
      {
        name: "Security",
        description: "HTTPS implementation, security headers, and protection against common vulnerabilities.",
        icon: Shield
      },
      {
        name: "Compliance",
        description: "Accessibility standards, GDPR compliance, and legal requirements adherence.",
        icon: CheckCircle
      },
      {
        name: "Analytics",
        description: "Data tracking setup, conversion optimization, and performance measurement capabilities.",
        icon: BarChart3
      }
    ]
  },

  howItWorks: {
    title: "How It Works",
    steps: [
      {
        stepNumber: "01",
        title: "Submit Your Site",
        description: "You enter your URL and we'll get started on your comprehensive review"
      },
      {
        stepNumber: "02", 
        title: "We Review It",
        description: "We conduct a professional appraisal based on our 7 core pillars"
      },
      {
        stepNumber: "03",
        title: "Watch on TikTok", 
        description: "We post the review on our TikTok channel for everyone to learn from"
      }
    ]
  },

  footer: {
    sections: [
      {
        title: "Services",
        items: [
          "Performance Analysis",
          "SEO Optimization", 
          "Design Review",
          "Security Audit"
        ]
      },
      {
        title: "Contact",
        items: [
          "hello@sitegrade.co.uk",
          "https://sitegrade.co.uk",
          "TikTok: @sitegrade",
          "Professional Reviews"
        ]
      }
    ],
    copyrightText: "© 2025 SiteGrade. All rights reserved."
  }
};