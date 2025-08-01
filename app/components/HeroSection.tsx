import dynamic from "next/dynamic";
import SubmissionForm from "./SubmissionForm";

// Dynamically import TypewriterText to reduce initial bundle size
const TypewriterText = dynamic(() => import("./TypewriterText"), {
  loading: () => <div className="h-20 md:h-24 lg:h-32 flex items-center justify-center" />
});

interface HeroSectionProps {
  title: string;
  typewriterWords: string[];
}

export default function HeroSection({ 
  title, 
  typewriterWords
}: HeroSectionProps) {
  return (
    <section 
      className="flex flex-col items-center justify-center px-4 text-center" 
      style={{ minHeight: 'calc(100vh - 120px)' }}
      aria-labelledby="hero-title"
      role="region"
      aria-label="Website submission form"
    >
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Critical LCP element - render immediately */}
        <h1 
          id="hero-title"
          className="heading-xl text-white mb-0 uppercase"
          aria-describedby="hero-typewriter"
        >
          {title}
        </h1>

        {/* Non-critical typewriter effect - lazy loaded */}
        <div id="hero-typewriter" className="mb-16" aria-live="polite">
          <TypewriterText words={typewriterWords} />
        </div>

        {/* Form is critical for user interaction */}
        <SubmissionForm />
      </div>
    </section>
  );
}