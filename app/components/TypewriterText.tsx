"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

const TypewriterText = memo(function TypewriterText({ 
  words, 
  typingSpeed = 100, 
  deletingSpeed = 50, 
  pauseDuration = 2000 
}: TypewriterTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const memoizedWords = useMemo(() => words, [words]);

  const updateText = useCallback((text: string) => {
    setDisplayText(text);
  }, []);

  const toggleTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  const nextWord = useCallback(() => {
    setCurrentWordIndex((prev) => (prev + 1) % memoizedWords.length);
  }, [memoizedWords.length]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentWord = memoizedWords[currentWordIndex];

    if (isTyping) {
      // Typing animation
      if (displayText.length < currentWord.length) {
        timeout = setTimeout(() => {
          updateText(currentWord.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Word complete, wait then start deleting
        timeout = setTimeout(() => {
          toggleTyping(false);
        }, pauseDuration);
      }
    } else {
      // Deleting animation
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          updateText(displayText.slice(0, -1));
        }, deletingSpeed);
      } else {
        // Deletion complete, move to next word
        nextWord();
        toggleTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentWordIndex, memoizedWords, typingSpeed, deletingSpeed, pauseDuration, updateText, toggleTyping, nextWord]);

  return (
    <div className="h-20 md:h-24 lg:h-32 flex items-center justify-center">
      <motion.span
        className="text-yellow-400 font-mono text-4xl md:text-6xl lg:text-7xl block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        role="text"
        aria-live="polite"
        aria-label={`Currently displaying: ${displayText}`}
        style={{ willChange: 'opacity' }}
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
          aria-hidden="true"
          style={{ willChange: 'opacity' }}
        >
          |
        </motion.span>
      </motion.span>
    </div>
  );
});

export default TypewriterText;