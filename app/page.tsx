"use client";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import { siteData } from "./data/siteData";

export default function Home() {
  const handleFormSubmit = (url: string) => {
    // TODO: Implement form submission logic
    console.log("Submitted URL:", url);
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header title={siteData.brand.name} />
      
      <main className="w-full">
        <HeroSection
          title={siteData.hero.title}
          typewriterWords={siteData.hero.typewriterWords}
          onFormSubmit={handleFormSubmit}
        />
        
        <HowItWorks
          title={siteData.howItWorks.title}
          steps={siteData.howItWorks.steps}
        />
      </main>

      <Footer />
    </div>
  );
}
