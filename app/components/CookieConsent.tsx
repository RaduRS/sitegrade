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
  const scrollPositionRef = useRef(0);

  // Prevent scrolling function
  const preventScroll = () => {
    // Save current scroll position
    scrollPositionRef.current = window.pageYOffset;

    // Apply styles to prevent scrolling
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Add event listeners to prevent scrolling
    document.addEventListener("wheel", preventScrollEvent, { passive: false });
    document.addEventListener("touchmove", preventScrollEvent, {
      passive: false,
    });
    document.addEventListener("keydown", preventKeyboardScroll, {
      passive: false,
    });
  };

  // Restore scrolling function
  const restoreScroll = () => {
    // Remove event listeners
    document.removeEventListener("wheel", preventScrollEvent);
    document.removeEventListener("touchmove", preventScrollEvent);
    document.removeEventListener("keydown", preventKeyboardScroll);

    // Remove the fixed positioning
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    // Restore scroll position
    window.scrollTo(0, scrollPositionRef.current);
  };

  // Prevent scroll events
  const preventScrollEvent = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Prevent keyboard scrolling (arrow keys, page up/down, etc.)
  const preventKeyboardScroll = (e: KeyboardEvent) => {
    const scrollKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
    ];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
      preventScroll();

      // Focus the accept button when the modal appears for keyboard users
      setTimeout(() => {
        acceptButtonRef.current?.focus();
      }, 100);
    }
  }, []);

  useEffect(() => {
    // Cleanup: restore scrolling when component unmounts
    return () => {
      restoreScroll();
    };
  }, []);

  useEffect(() => {
    // Restore scrolling when modal is hidden
    if (!isVisible) {
      restoreScroll();
    } else {
      preventScroll();
    }
  }, [isVisible]);

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
    if (event.key === "Escape") {
      handleReject(); // Default to reject on escape
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 relative">
        <div className="text-center">
          <h2
            id="cookie-consent-title"
            className="text-lg font-semibold text-gray-900 mb-4"
          >
            Cookie Consent
          </h2>
          <p
            id="cookie-consent-description"
            className="text-sm text-gray-700 leading-relaxed mb-6"
          >
            We use Google Analytics to understand how visitors interact with our
            website. This helps us improve your experience. You can learn more
            about our data practices in our{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 decoration-1 hover:decoration-yellow-500"
              aria-label="Read our Privacy Policy (opens in same window)"
              onClick={(e) => {
                setTimeout(() => {
                  (e.target as HTMLElement).blur();
                }, 100);
              }}
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy/cookies"
              className="underline underline-offset-2 decoration-1 hover:decoration-yellow-500"
              aria-label="Read our Cookie Policy (opens in same window)"
              onClick={(e) => {
                setTimeout(() => {
                  (e.target as HTMLElement).blur();
                }, 100);
              }}
            >
              Cookie Policy
            </Link>
            .
          </p>
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            role="group"
            aria-label="Cookie consent options"
          >
            <button
              onClick={handleReject}
              className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-lg transition-colors duration-200"
              aria-label="Reject analytics cookies"
            >
              Reject
            </button>
            <button
              ref={acceptButtonRef}
              onClick={handleAccept}
              className="px-6 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:bg-amber-600 focus:outline-none rounded-lg transition-colors duration-200"
              aria-label="Accept analytics cookies"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
