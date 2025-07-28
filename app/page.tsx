"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

const TypewriterText = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const words = useMemo(
    () => [
      "Performance",
      "Design",
      "Responsiveness",
      "SEO",
      "Security",
      "Compliance",
      "Analytics",
    ],
    []
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentWord = words[currentWordIndex];

    if (isTyping) {
      // Typing animation
      if (displayText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, 100);
      } else {
        // Word complete, wait then start deleting
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Deleting animation
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        // Deletion complete, move to next word
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentWordIndex, words]);

  return (
    <div className="h-20 md:h-24 lg:h-32 flex items-center justify-center">
      <motion.span
        className="text-yellow-400 font-mono text-4xl md:text-6xl lg:text-7xl block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {displayText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="text-yellow-400"
        >
          |
        </motion.span>
      </motion.span>
    </div>
  );
};

export default function Home() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Logo Header */}
      <header className="w-full py-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 font-retro">
            SITEGRADE
          </h1>
        </div>
      </header>

      <main className="w-full">
        {/* Hero Section - Full viewport height */}
        <section className="h-screen flex flex-col items-center justify-center px-4 text-center">
          <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-0 leading-tight uppercase">
              We grade sites for
            </h1>

            <div className="mb-16">
              <TypewriterText />
            </div>

            {/* Submission Form */}
            <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-center">
                <input
                  type="url"
                  placeholder="Enter your website URL"
                  className="retro-input flex-1 w-full sm:w-auto min-w-0 px-6"
                />
                <button className="button-3d w-full sm:w-auto">
                  <span className="button_top">Grade My Site</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-32">
          <div
            style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
            className="px-4"
          >
            <h2 className="text-4xl font-bold text-center mb-20 text-white font-retro pb-8">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-16">
              <div className="text-center p-8 how-it-works-card">
                <div className="step-number mb-8">01</div>
                <h3 className="step-title text-xl mb-6">Submit Your Site</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  You enter your URL and we&apos;ll get started on your
                  comprehensive review
                </p>
              </div>
              <div className="text-center p-8 how-it-works-card">
                <div className="step-number mb-8">02</div>
                <h3 className="step-title text-xl mb-6">We Review It</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We conduct a professional appraisal based on our 7 core
                  pillars
                </p>
              </div>
              <div className="text-center p-8 how-it-works-card">
                <div className="step-number mb-8">03</div>
                <h3 className="step-title text-xl mb-6">Watch on TikTok</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We post the review on our TikTok channel for everyone to learn
                  from
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 border-t border-slate-700">
        <div
          style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
          className="px-4"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold text-yellow-400 font-retro mb-4">
                SITEGRADE
              </h3>
              <p className="text-slate-300 text-sm">
                Professional website reviews for the modern web
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Services
              </h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>Performance Analysis</li>
                <li>SEO Optimization</li>
                <li>Design Review</li>
                <li>Security Audit</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Follow Us
              </h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>TikTok Reviews</li>
                <li>YouTube Channel</li>
                <li>Twitter Updates</li>
                <li>LinkedIn</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 SiteGrade. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
