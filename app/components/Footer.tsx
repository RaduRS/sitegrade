interface FooterSection {
  title: string;
  items: string[];
}

interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  sections?: FooterSection[];
  copyrightText?: string;
}

export default function Footer({ 
  brandName = "SITEGRADE",
  brandDescription = "Professional website reviews for the modern web",
  sections = [],
  copyrightText = "© 2024 SiteGrade. All rights reserved."
}: FooterProps) {
  return (
    <footer className="w-full py-16 border-t border-slate-700">
      <div
        style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
        className="px-4"
      >
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold text-yellow-400 font-retro mb-4">
              {brandName}
            </h3>
            <p className="text-slate-300 text-sm">
              {brandDescription}
            </p>
          </div>
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
        <div className="mt-12 pt-8 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}