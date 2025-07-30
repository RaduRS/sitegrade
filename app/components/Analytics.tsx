'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getAnalytics, pageview, trackFormSubmission, trackButtonClick, initAnalytics } from '../lib/gtag';
import CookieConsent from './CookieConsent';

// Create context
const AnalyticsContext = createContext(getAnalytics());

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const initializeAnalytics = useCallback(() => {
    if (!analyticsInitialized) {
      // Defer analytics initialization to avoid blocking render
      requestAnimationFrame(() => {
        initAnalytics();
        setAnalyticsInitialized(true);
        
        // Track initial page view after a short delay
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            pageview(window.location.pathname);
          }
        }, 100);
      });
    }
  }, [analyticsInitialized]);

  useEffect(() => {
    // Defer consent check to prevent blocking LCP
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem('cookie-consent');
        if (consent === 'accepted') {
          // Defer analytics initialization to prevent blocking LCP
          requestAnimationFrame(() => {
            initAnalytics();
            setAnalyticsInitialized(true);
            // Defer initial pageview tracking
            setTimeout(() => {
              pageview(window.location.pathname);
            }, 100);
          });
        }
        setConsentChecked(true);
      } catch (error) {
        console.error('Error checking consent:', error);
        setConsentChecked(true);
      }
    };

    // Defer the consent check to prevent blocking initial render
    setTimeout(checkConsent, 0);
  }, []);

  const handleAcceptCookies = useCallback(() => {
    initializeAnalytics();
  }, [initializeAnalytics]);

  const handleRejectCookies = useCallback(() => {
    // Do nothing - analytics won't be initialized
    console.log('Analytics tracking rejected by user');
  }, []);

  return (
    <AnalyticsContext.Provider value={getAnalytics()}>
      {children}
      {consentChecked && (
        <CookieConsent 
          onAccept={handleAcceptCookies}
          onReject={handleRejectCookies}
        />
      )}
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics
export function useAnalytics() {
  return useContext(AnalyticsContext);
}

// Export analytics utilities for direct use
export { getAnalytics, pageview, trackFormSubmission, trackButtonClick };