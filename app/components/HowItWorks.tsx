interface StepCardProps {
  stepNumber: string;
  title: string;
  description: string;
}

function StepCard({ stepNumber, title, description }: StepCardProps) {
  return (
    <div className="text-center p-6 md:p-8 how-it-works-card">
      <div className="step-number mb-6 md:mb-8">{stepNumber}</div>
      <h3 className="step-title text-lg md:text-xl mb-4 md:mb-6">{title}</h3>
      <p className="text-slate-300 text-sm leading-relaxed">
        {description}
      </p>
    </div>
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
    <section className="py-32">
      <div
        style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
        className="px-4"
      >
        <h2 className="text-4xl font-bold text-center mb-20 text-white font-retro pb-8">
          {title}
        </h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}