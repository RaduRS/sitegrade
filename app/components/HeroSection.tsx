"use client";
import dynamic from "next/dynamic";
import SubmissionForm from "./SubmissionForm";

// Dynamically import TypewriterText with loading fallback to prevent hydration issues
const TypewriterText = dynamic(() => import("./TypewriterText"), {
  loading: () => <span className="text-blue-600">optimizing</span>
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
        {/* Critical LCP element - render immediately with optimized styles */}
        <h1 
          id="hero-title"
          className="heading-xl text-white mb-0 uppercase"
          aria-describedby="hero-typewriter"
        >
          {title}
        </h1>

        {/* Non-critical typewriter effect - deferred */}
        <div 
          id="hero-typewriter" 
          className="mb-16" 
          aria-live="polite"
          style={{ height: '5rem' }} // Fixed height to prevent layout shift
        >
          <TypewriterText words={typewriterWords} />
        </div>

        {/* Form is critical for user interaction */}
        <SubmissionForm />
      </div>
    </section>
  );
}