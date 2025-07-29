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