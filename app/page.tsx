import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import AboutSection from "./components/AboutSection";
import GradingPillars from "./components/GradingPillars";
import Footer from "./components/Footer";
import { siteData } from "./data/siteData";

// Route Segment Config for bfcache optimization
export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export default function Home() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
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
          items={siteData.pillars.items}
        />

        <AboutSection
          title={siteData.about.title}
          content={siteData.about.content}
        />
      </main>

      <Footer />
    </div>
  );
}
