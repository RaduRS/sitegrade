"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [isLoaded, setIsLoaded] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const scrollPositionRef = useRef(0);
  const eventListenersRef = useRef(false);

  // Memoized scroll prevention functions
  const preventScrollEvent = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const preventKeyboardScroll = useCallback((e: KeyboardEvent) => {
    const scrollKeys = [
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "PageUp", "PageDown", "Home", "End", " "
    ];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, []);

  // Optimized scroll prevention
  const preventScroll = useCallback(() => {
    if (eventListenersRef.current) return;
    
    scrollPositionRef.current = window.pageYOffset;
    
    // Use requestAnimationFrame to defer style changes
    requestAnimationFrame(() => {
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    });

    // Add event listeners with passive: false only when needed
    document.addEventListener("wheel", preventScrollEvent, { passive: false });
    document.addEventListener("touchmove", preventScrollEvent, { passive: false });
    document.addEventListener("keydown", preventKeyboardScroll, { passive: false });
    eventListenersRef.current = true;
  }, [preventScrollEvent, preventKeyboardScroll]);

  // Optimized scroll restoration
  const restoreScroll = useCallback(() => {
    if (!eventListenersRef.current) return;

    // Remove event listeners first
    document.removeEventListener("wheel", preventScrollEvent);
    document.removeEventListener("touchmove", preventScrollEvent);
    document.removeEventListener("keydown", preventKeyboardScroll);
    eventListenersRef.current = false;

    // Use requestAnimationFrame to defer style restoration
    requestAnimationFrame(() => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
    });
  }, [preventScrollEvent, preventKeyboardScroll]);

  useEffect(() => {
    // Defer localStorage check to avoid blocking initial render
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
          setIsVisible(true);
          // Defer scroll prevention to next frame
          requestAnimationFrame(() => {
            preventScroll();
            // Defer focus to avoid blocking render
            setTimeout(() => {
              acceptButtonRef.current?.focus();
            }, 150);
          });
        }
      } catch (error) {
        // Fallback if localStorage is not available
        console.warn("localStorage not available:", error);
        setIsVisible(true);
      }
      setIsLoaded(true);
    };

    // Use setTimeout to defer the check and avoid blocking initial render
    const timeoutId = setTimeout(checkConsent, 0);
    return () => clearTimeout(timeoutId);
  }, [preventScroll]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      restoreScroll();
    };
  }, [restoreScroll]);

  useEffect(() => {
    // Handle visibility changes
    if (!isLoaded) return;
    
    if (!isVisible) {
      restoreScroll();
    } else if (isVisible && !eventListenersRef.current) {
      // Use requestAnimationFrame to defer scroll prevention
      requestAnimationFrame(() => {
        preventScroll();
      });
    }
  }, [isVisible, isLoaded, preventScroll, restoreScroll]);

  const handleAccept = useCallback(() => {
    try {
      localStorage.setItem("cookie-consent", "accepted");
    } catch (error) {
      console.warn("Could not save cookie consent:", error);
    }
    setIsVisible(false);
    onAccept();
  }, [onAccept]);

  const handleReject = useCallback(() => {
    try {
      localStorage.setItem("cookie-consent", "rejected");
    } catch (error) {
      console.warn("Could not save cookie consent:", error);
    }
    setIsVisible(false);
    onReject();
  }, [onReject]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      handleReject(); // Default to reject on escape
    }
  }, [handleReject]);

  // Don't render anything until we've checked localStorage
  if (!isLoaded || !isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 modal-backdrop"
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
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 relative modal-content"
      >
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
              href="/cookies"
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
