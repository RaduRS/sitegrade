import Link from "next/link";
import { siteData } from "../data/siteData";
import { Mail, Music, Instagram, Youtube, X } from "lucide-react";

export default function Footer() {
  // Create combined contact and follow section
  const contactAndFollowSection = {
    title: "Contact",
    items: [
      <a 
        key="email" 
        href="mailto:hello@sitegrade.co.uk" 
        className="hover:text-amber-400 transition-colors flex items-center gap-2 justify-center mb-6"
      >
        <Mail className="w-4 h-4" />
        hello@sitegrade.co.uk
      </a>,
      <div key="follow-title" className="mb-4">
        <h6 className="text-lg font-semibold text-white font-retro">Follow Us</h6>
      </div>,
      <div key="social" className="flex justify-center items-center gap-4">
        <a 
          href="https://www.tiktok.com/@sitegradeuk" 
          className="hover:text-amber-400 transition-colors p-2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on TikTok"
        >
          <Music className="w-5 h-5" />
        </a>
        <a 
          href="https://www.instagram.com/sitegradeuk/" 
          className="hover:text-amber-400 transition-colors p-2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Instagram"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <a 
          href="https://www.youtube.com/@sitegradeuk" 
          className="hover:text-amber-400 transition-colors p-2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on YouTube"
        >
          <Youtube className="w-5 h-5" />
        </a>
        <a 
          href="https://x.com/sitegradeuk" 
          className="hover:text-amber-400 transition-colors p-2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on X"
        >
          <X className="w-5 h-5" />
        </a>
      </div>
    ]
  };

  const sections = [
    ...siteData.footer.sections.slice(0, 1), // Services
    {
      title: "Legal",
      items: [
        <Link key="privacy" href="/privacy" className="hover:text-amber-400 transition-colors">
          Privacy Policy
        </Link>,
        <Link key="cookies" href="/cookies" className="hover:text-amber-400 transition-colors">
          Cookie Policy
        </Link>,
        <Link key="terms" href="/terms" className="hover:text-amber-400 transition-colors">
          Terms of Service
        </Link>
      ]
    },
    contactAndFollowSection
  ];

  return (
    <footer 
      className="w-full py-16 border-t border-slate-700"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div
        style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
        className="px-4"
      >
        {/* Centered branding section */}
        <div className="text-center mb-12">
          <h4 className="text-xl font-bold text-yellow-400 font-retro mb-4">
            {siteData.brand.name}
          </h4>
          <p className="text-slate-300 text-sm">{siteData.brand.description}</p>
        </div>
        
        {/* Three column layout for sections */}
        <nav 
          className="grid md:grid-cols-3 gap-8 text-center"
          aria-label="Footer navigation"
        >
          {sections.map((section, index) => (
            <div key={index}>
              <h5 className="text-lg font-semibold text-white mb-4 font-retro">
                {section.title}
              </h5>
              <ul 
                className="space-y-2 text-slate-300 text-sm"
                role="list"
              >
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} role="listitem">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        
        {/* Copyright section */}
        <div className="mt-12 text-center">
          <div className="flex justify-center mb-8">
            <hr 
              className="w-1/2 border-slate-700" 
              role="separator"
              aria-hidden="true"
            />
          </div>
          <p className="text-slate-400 text-sm">{siteData.footer.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
