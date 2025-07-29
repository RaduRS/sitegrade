"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Zap, 
  Palette, 
  Smartphone, 
  Search, 
  Shield, 
  CheckCircle, 
  BarChart3 
} from "lucide-react";

// Icon mapping
const iconMap = {
  Zap,
  Palette,
  Smartphone,
  Search,
  Shield,
  CheckCircle,
  BarChart3
} as const;

interface Pillar {
  name: string;
  description: string;
  icon: string;
}

interface GradingPillarsProps {
  title: string;
  subtitle: string;
  items: Pillar[];
}

export default function GradingPillars({ title, subtitle, items }: GradingPillarsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const MotionDiv = mounted ? motion.div : 'div';

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-lg text-white mb-4 font-mono">
            {title}
          </h2>
          <p className="body-lg text-gray-300 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Pillar List */}
        <div className="space-y-8 mb-16">
          {/* First Row - 3 pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.slice(0, 3).map((pillar, index) => {
              const IconComponent = iconMap[pillar.icon as keyof typeof iconMap];
              return (
                <MotionDiv
                  key={pillar.name}
                  className="flex items-start gap-3 p-3 rounded bg-slate-800/30"
                  {...(mounted && {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: index * 0.1 }
                  })}
                >
                  <IconComponent className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="heading-sm text-amber-400 mb-2 font-mono">{pillar.name}</h3>
                    <p className="body-sm text-gray-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </MotionDiv>
              );
            })}
          </div>

          {/* Second Row - 3 pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.slice(3, 6).map((pillar, index) => {
              const IconComponent = iconMap[pillar.icon as keyof typeof iconMap];
              return (
                <MotionDiv
                  key={pillar.name}
                  className="flex items-start gap-3 p-3 rounded bg-slate-800/30"
                  {...(mounted && {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: (index + 3) * 0.1 }
                  })}
                >
                  <IconComponent className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="heading-sm text-amber-400 mb-2 font-mono">{pillar.name}</h3>
                    <p className="body-sm text-gray-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </MotionDiv>
              );
            })}
          </div>

          {/* Third row - Analytics left-aligned */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(() => {
              const pillar = items[6]; // Analytics is at index 6
              const IconComponent = iconMap[pillar.icon as keyof typeof iconMap];
              return (
                <MotionDiv
                  key={pillar.name}
                  className="flex items-start gap-3 p-3 rounded bg-slate-800/30"
                  {...(mounted && {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 6 * 0.1 }
                  })}
                >
                  <IconComponent className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="heading-sm text-amber-400 mb-2 font-mono">{pillar.name}</h3>
                    <p className="body-sm text-gray-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </MotionDiv>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}