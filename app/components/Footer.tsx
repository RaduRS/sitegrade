import Link from "next/link";
import { siteData } from "../data/siteData";

export default function Footer() {
  const sections = [
    ...siteData.footer.sections.slice(0, 1), // Services
    {
      title: "Legal",
      items: [
        <Link key="privacy" href="/privacy" className="hover:text-amber-400 transition-colors">
          Privacy Policy
        </Link>,
        <Link key="cookies" href="/privacy/cookies" className="hover:text-amber-400 transition-colors">
          Cookie Policy
        </Link>,
        <Link key="terms" href="/privacy/terms" className="hover:text-amber-400 transition-colors">
          Terms of Service
        </Link>
      ]
    },
    ...siteData.footer.sections.slice(1) // Contact
  ];

  return (
    <footer className="w-full py-16 border-t border-slate-700">
      <div
        style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
        className="px-4"
      >
        {/* Centered branding section */}
        <div className="text-center mb-12">
          <h3 className="text-xl font-bold text-yellow-400 font-retro mb-4">
            {siteData.brand.name}
          </h3>
          <p className="text-slate-300 text-sm">{siteData.brand.description}</p>
        </div>
        
        {/* Three column layout for sections */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Copyright section */}
        <div className="mt-12 text-center">
          <div className="flex justify-center mb-8">
            <hr className="w-1/2 border-slate-700" />
          </div>
          <p className="text-slate-400 text-sm">{siteData.footer.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
