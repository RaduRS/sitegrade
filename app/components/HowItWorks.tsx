import { Music, Instagram, Youtube, X } from "lucide-react";

interface StepCardProps {
  stepNumber: string;
  title: string;
  description: string;
  stepIndex: number;
}

function StepCard({ stepNumber, title, description, stepIndex }: StepCardProps) {
  // Special handling for step 3 (Follow Our Socials)
  if (stepIndex === 2) {
    return (
      <article 
        className="text-center pt-6 md:pt-8 px-6 md:px-8 pb-2 md:pb-4 how-it-works-card"
        aria-labelledby={`step-title-${stepIndex}`}
        aria-describedby={`step-desc-${stepIndex}`}
      >
        <div 
          className="step-number mb-6 md:mb-8"
          aria-label={`Step ${stepNumber}`}
          role="img"
        >
          {stepNumber}
        </div>
        <h3 
          id={`step-title-${stepIndex}`}
          className="heading-sm mb-4 md:mb-6"
        >
          {title}
        </h3>
        <p 
          id={`step-desc-${stepIndex}`}
          className="body-sm text-slate-300"
        >
          Watch for your website&apos;s review on our social media:
        </p>
        <div className="flex justify-center items-center gap-4 mt-1">
          <a 
            href="https://www.tiktok.com/@sitegradeuk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            aria-label="Follow us on TikTok"
          >
            <Music className="w-5 h-5" />
          </a>
          <a 
            href="https://www.instagram.com/sitegradeuk/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            aria-label="Follow us on Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a 
            href="https://www.youtube.com/@sitegradeuk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            aria-label="Follow us on YouTube"
          >
            <Youtube className="w-5 h-5" />
          </a>
          <a 
            href="https://x.com/sitegradeuk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            aria-label="Follow us on X"
          >
            <X className="w-5 h-5" />
          </a>
        </div>
      </article>
    );
  }

  // Helper function to render description with proper accessibility for "7 pillars" link
  const renderDescription = () => {
    if (stepIndex === 1 && description.includes('7 pillars')) {
      const parts = description.split('7 pillars');
      return (
        <>
          {parts[0]}
          <a 
            href="#grading-pillars" 
            className="text-amber-400 font-medium hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            aria-label="Learn more about our 7 core grading pillars"
          >
            7 pillars
          </a>
          {parts[1]}
        </>
      );
    }
    return description;
  };

  return (
    <article 
      className="text-center p-6 md:p-8 how-it-works-card"
      aria-labelledby={`step-title-${stepIndex}`}
      aria-describedby={`step-desc-${stepIndex}`}
    >
      <div 
        className="step-number mb-6 md:mb-8"
        aria-label={`Step ${stepNumber}`}
        role="img"
      >
        {stepNumber}
      </div>
      <h3 
        id={`step-title-${stepIndex}`}
        className="heading-sm mb-4 md:mb-6"
      >
        {title}
      </h3>
      <p 
        id={`step-desc-${stepIndex}`}
        className="body-sm text-slate-300"
      >
        {renderDescription()}
      </p>
    </article>
  );
}

interface HowItWorksProps {
  title?: string;
  steps: Array<{
    stepNumber: string;
    title: string;
    description: string;
  }>;
}

export default function HowItWorks({ 
  title = "How It Works", 
  steps 
}: HowItWorksProps) {
  return (
    <section 
      className="py-32"
      aria-labelledby="how-it-works-title"
      role="region"
      aria-label="How our website review process works"
    >
      <div
        style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
        className="px-4"
      >
        <h2 
          id="how-it-works-title"
          className="heading-lg text-center mb-20 text-white font-retro pb-8"
        >
          {title}
        </h2>
        <ol 
          className="grid md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 list-none"
          aria-label="Process steps"
        >
          {steps.map((step, index) => (
            <li key={index}>
              <StepCard
                stepNumber={step.stepNumber}
                title={step.title}
                description={step.description}
                stepIndex={index}
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}