'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAnalytics, pageview, trackFormSubmission, trackButtonClick, initAnalytics } from '../lib/gtag';
import CookieConsent from './CookieConsent';

// Create context
const AnalyticsContext = createContext(getAnalytics());

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') {
      initializeAnalytics();
    }
  }, []);

  const initializeAnalytics = () => {
    if (!analyticsInitialized) {
      initAnalytics();
      setAnalyticsInitialized(true);
      
      // Track initial page view
      if (typeof window !== 'undefined') {
        pageview(window.location.pathname);
      }
    }
  };

  const handleAcceptCookies = () => {
    initializeAnalytics();
  };

  const handleRejectCookies = () => {
    // Do nothing - analytics won't be initialized
    console.log('Analytics tracking rejected by user');
  };

  return (
    <AnalyticsContext.Provider value={getAnalytics()}>
      {children}
      <CookieConsent 
        onAccept={handleAcceptCookies}
        onReject={handleRejectCookies}
      />
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics
export function useAnalytics() {
  return useContext(AnalyticsContext);
}

// Export analytics utilities for direct use
export { getAnalytics, pageview, trackFormSubmission, trackButtonClick };