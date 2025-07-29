import TypewriterText from "./TypewriterText";
import SubmissionForm from "./SubmissionForm";

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
        <h2 
          id="hero-title"
          className="heading-xl text-white mb-0 uppercase"
          aria-describedby="hero-typewriter"
        >
          {title}
        </h2>

        <div id="hero-typewriter" className="mb-16" aria-live="polite">
          <TypewriterText words={typewriterWords} />
        </div>

        <SubmissionForm />
      </div>
    </section>
  );
}