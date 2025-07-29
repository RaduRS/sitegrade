import TypewriterText from "./TypewriterText";
import SubmissionForm from "./SubmissionForm";

interface HeroSectionProps {
  title: string;
  typewriterWords: string[];
  onFormSubmit?: (url: string) => void;
}

export default function HeroSection({ 
  title, 
  typewriterWords, 
  onFormSubmit 
}: HeroSectionProps) {
  return (
    <section 
      className="flex flex-col items-center justify-center px-4 text-center" 
      style={{ minHeight: 'calc(100vh - 120px)' }}
    >
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-0 leading-tight uppercase">
          {title}
        </h1>

        <div className="mb-16">
          <TypewriterText words={typewriterWords} />
        </div>

        <SubmissionForm onSubmit={onFormSubmit} />
      </div>
    </section>
  );
}