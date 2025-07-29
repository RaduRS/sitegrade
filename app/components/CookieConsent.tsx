"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface CookieConsentProps {
  onAccept: () => void;
  onReject: () => void;
}

export default function CookieConsent({
  onAccept,
  onReject,
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
      // Focus the accept button when the banner appears for keyboard users
      setTimeout(() => {
        acceptButtonRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    onAccept();
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setIsVisible(false);
    onReject();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleReject(); // Default to reject on escape
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 
            id="cookie-consent-title" 
            className="text-sm font-semibold text-gray-900 mb-2"
          >
            Cookie Consent
          </h2>
          <p 
            id="cookie-consent-description"
            className="text-sm text-gray-700 leading-relaxed"
          >
            We use Google Analytics to understand how visitors interact with our
            website. This helps us improve your experience. You can learn more about our data practices in our{' '}
            <Link 
              href="/privacy" 
              className="text-amber-600 hover:text-amber-700 underline"
              aria-label="Read our Privacy Policy (opens in same window)"
            >
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link 
              href="/privacy/cookies" 
              className="text-amber-600 hover:text-amber-700 underline"
              aria-label="Read our Cookie Policy (opens in same window)"
            >
              Cookie Policy
            </Link>.
          </p>
        </div>
        <div 
          className="flex flex-col sm:flex-row gap-3 shrink-0"
          role="group"
          aria-label="Cookie consent options"
        >
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-lg transition-colors duration-200"
            aria-label="Reject analytics cookies"
          >
            Reject
          </button>
          <button
            ref={acceptButtonRef}
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded-lg transition-colors duration-200"
            aria-label="Accept analytics cookies"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
