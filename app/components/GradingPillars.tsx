"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Pillar {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface GradingPillarsProps {
  title: string;
  subtitle: string;
  pillars: Pillar[];
}

export default function GradingPillars({ title, subtitle, pillars }: GradingPillarsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section 
      className="py-20 px-4"
      aria-labelledby="pillars-heading"
      role="region"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            id="pillars-heading"
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            {title}
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Pillars as horizontal flowing badges */}
        <div className="space-y-8">
          {/* First row - 4 pillars */}
          <div 
            className="flex flex-wrap justify-center gap-4 md:gap-6"
            role="list"
            aria-label="Primary grading criteria"
          >
            {pillars.slice(0, 4).map((pillar, index) => {
              const IconComponent = pillar.icon;
              const BadgeComponent = mounted ? motion.div : 'div';
              const animationProps = mounted ? {
                initial: { opacity: 0, scale: 0.8 },
                whileInView: { opacity: 1, scale: 1 },
                transition: { 
                  duration: 0.4, 
                  delay: index * 0.1,
                  ease: "easeOut"
                },
                viewport: { once: true },
                whileHover: { 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }
              } : {};

              return (
                <BadgeComponent
                  key={pillar.name}
                  role="listitem"
                  className="group bg-slate-800/60 border border-slate-600 rounded-full px-6 py-4 flex items-center gap-3 hover:border-amber-400/60 hover:bg-slate-700/60 transition-all duration-300 cursor-default"
                  {...animationProps}
                >
                  <IconComponent className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                  <span className="text-white font-medium text-sm md:text-base whitespace-nowrap">
                    {pillar.name}
                  </span>
                </BadgeComponent>
              );
            })}
          </div>

          {/* Second row - 3 pillars */}
          <div 
            className="flex flex-wrap justify-center gap-4 md:gap-6"
            role="list"
            aria-label="Secondary grading criteria"
          >
            {pillars.slice(4).map((pillar, index) => {
              const IconComponent = pillar.icon;
              const BadgeComponent = mounted ? motion.div : 'div';
              const animationProps = mounted ? {
                initial: { opacity: 0, scale: 0.8 },
                whileInView: { opacity: 1, scale: 1 },
                transition: { 
                  duration: 0.4, 
                  delay: (index + 4) * 0.1,
                  ease: "easeOut"
                },
                viewport: { once: true },
                whileHover: { 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }
              } : {};

              return (
                <BadgeComponent
                  key={pillar.name}
                  role="listitem"
                  className="group bg-slate-800/60 border border-slate-600 rounded-full px-6 py-4 flex items-center gap-3 hover:border-amber-400/60 hover:bg-slate-700/60 transition-all duration-300 cursor-default"
                  {...animationProps}
                >
                  <IconComponent className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                  <span className="text-white font-medium text-sm md:text-base whitespace-nowrap">
                    {pillar.name}
                  </span>
                </BadgeComponent>
              );
            })}
          </div>
        </div>

        {/* Detailed descriptions in a compact format */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {pillars.map((pillar) => (
              <div key={pillar.name} className="flex items-start gap-3 p-3 rounded bg-slate-800/30">
                <pillar.icon className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-amber-400 font-medium">{pillar.name}:</span>
                  <span className="text-gray-300 ml-2">{pillar.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Ready to see how your website measures up across all pillars?
          </p>
        </div>
      </div>
    </section>
  );
}