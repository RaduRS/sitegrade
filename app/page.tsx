'use client';

import { useState, useEffect } from 'react';

const TypewriterText = () => {
  const [displayText, setDisplayText] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  const words = ["Performance", "Design", "Responsiveness", "SEO", "Security", "Compliance", "Analytics"];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const typeWriter = () => {
      const currentWord = words[wordIndex];
      
      if (isDeleting) {
        setDisplayText(currentWord.substring(0, charIndex));
        charIndex--;
      } else {
        setDisplayText(currentWord.substring(0, charIndex + 1));
        charIndex++;
      }
      
      let speed = isDeleting ? 75 : 100;
      
      if (!isDeleting && charIndex === currentWord.length) {
        speed = 1500; // Pause when word is complete
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = 300; // Pause before starting new word
      }
      
      timeoutId = setTimeout(typeWriter, speed);
    };

    // Start the animation after a brief delay
    timeoutId = setTimeout(typeWriter, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isClient, words]);

  if (!isClient) {
    return <span className="text-yellow-400 font-mono text-4xl md:text-6xl lg:text-7xl">Performance</span>;
  }

  return (
    <span className="text-yellow-400 font-mono text-4xl md:text-6xl lg:text-7xl min-h-[1.2em] inline-block">
      {displayText}
      <span className="animate-pulse text-yellow-400">|</span>
    </span>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center min-h-screen flex flex-col justify-center">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              We grade sites for
              <br />
              <TypewriterText />
            </h1>
            
            {/* Submission Form - Moved directly under heading */}
            <form className="max-w-lg mx-auto mt-8 w-full px-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="Enter your website URL"
                  className="flex-1 px-4 py-4 bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors text-lg"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300 transition-colors text-lg"
                >
                  Grade My Site
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8">
              <div className="text-5xl font-bold text-yellow-400 mb-6">1</div>
              <h3 className="text-2xl font-bold mb-4">Submit Your Site</h3>
              <p className="text-gray-400 text-lg">You enter your URL</p>
            </div>
            <div className="text-center p-8">
              <div className="text-5xl font-bold text-yellow-400 mb-6">2</div>
              <h3 className="text-2xl font-bold mb-4">We Review It</h3>
              <p className="text-gray-400 text-lg">We conduct a professional appraisal based on our 7 pillars</p>
            </div>
            <div className="text-center p-8">
              <div className="text-5xl font-bold text-yellow-400 mb-6">3</div>
              <h3 className="text-2xl font-bold mb-4">Watch on TikTok</h3>
              <p className="text-gray-400 text-lg">We post the review on our TikTok channel for everyone to learn from</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
