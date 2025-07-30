import { CheckCircle } from "lucide-react";

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
      className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900"
      aria-labelledby="about-title"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Title */}
        <h2 
          id="about-title"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-8 font-retro"
        >
          {title}
        </h2>
        
        {/* Introduction */}
        <div className="text-center mb-16">
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
            {content.introduction}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-12 font-retro">
            Why Choose Professional Website Reviews?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {content.benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-6 border border-slate-600/30 hover:border-amber-400/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-gray-300 leading-relaxed">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expertise Section */}
        <div className="bg-slate-700/30 rounded-xl p-8 md:p-12 border border-slate-600/30 mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6 font-retro text-center">
            Our Expertise
          </h3>
          <p className="text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
            {content.expertise}
          </p>
        </div>

        {/* Commitment */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-xl p-8 border border-amber-400/20">
            <p className="text-lg md:text-xl font-medium text-amber-400 leading-relaxed max-w-3xl">
              {content.commitment}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}