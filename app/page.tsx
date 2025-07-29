"use client";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import GradingPillars from "./components/GradingPillars";
import Footer from "./components/Footer";
import { siteData } from "./data/siteData";

export default function Home() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-slate-900 focus:rounded focus:font-semibold focus:no-underline"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      <Header title={siteData.brand.name} />
      
      <main id="main-content" className="w-full" role="main">
        <HeroSection
          title={siteData.hero.title}
          typewriterWords={siteData.hero.typewriterWords}
        />
        
        <HowItWorks
          title={siteData.howItWorks.title}
          steps={siteData.howItWorks.steps}
        />

        <GradingPillars
          title={siteData.pillars.title}
          subtitle={siteData.pillars.subtitle}
          pillars={siteData.pillars.items}
        />
      </main>

      <Footer />
    </div>
  );
}
