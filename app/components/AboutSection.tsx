interface AboutSectionProps {
  title: string;
  content: {
    introduction: string;
    benefits: string[];
    expertise: string;
    commitment: string;
  };
}

export default function AboutSection({ title, content }: AboutSectionProps) {
  return (
    <section 
      className="py-20 px-4 bg-slate-800"
      aria-labelledby="about-title"
    >
      <div className="max-w-4xl mx-auto">
        <h2 
          id="about-title"
          className="text-3xl md:text-4xl font-bold text-white text-center mb-12"
        >
          {title}
        </h2>
        
        <div className="space-y-8 text-gray-300">
          <p className="text-lg leading-relaxed">
            {content.introduction}
          </p>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Why Choose Professional Website Reviews?
            </h3>
            <ul className="space-y-3">
              {content.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-400 mr-3 mt-1">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <p className="text-lg leading-relaxed">
            {content.expertise}
          </p>
          
          <p className="text-lg leading-relaxed font-medium text-yellow-400">
            {content.commitment}
          </p>
        </div>
      </div>
    </section>
  );
}