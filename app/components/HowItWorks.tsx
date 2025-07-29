interface StepCardProps {
  stepNumber: string;
  title: string;
  description: string;
  stepIndex: number;
}

function StepCard({ stepNumber, title, description, stepIndex }: StepCardProps) {
  return (
    <article 
      className="text-center p-6 md:p-8 how-it-works-card"
      role="article"
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
      <h4 
        id={`step-title-${stepIndex}`}
        className="heading-sm mb-4 md:mb-6"
      >
        {title}
      </h4>
      <p 
        id={`step-desc-${stepIndex}`}
        className="body-sm text-slate-300"
      >
        {description}
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
        <h3 
          id="how-it-works-title"
          className="heading-lg text-center mb-20 text-white font-retro pb-8"
        >
          {title}
        </h3>
        <div 
          className="grid md:grid-cols-3 gap-8 md:gap-12 lg:gap-16"
          role="list"
          aria-label="Process steps"
        >
          {steps.map((step, index) => (
            <StepCard
              key={index}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
              stepIndex={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}