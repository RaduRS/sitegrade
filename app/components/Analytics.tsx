'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { getAnalytics, pageview, trackFormSubmission, trackButtonClick, initAnalytics } from '../lib/gtag';

// Create context
const AnalyticsContext = createContext(getAnalytics());

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize analytics
    initAnalytics();
    
    // Track initial page view
    if (typeof window !== 'undefined') {
      pageview(window.location.pathname);
    }
  }, []);

  return (
    <AnalyticsContext.Provider value={getAnalytics()}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics
export function useAnalytics() {
  return useContext(AnalyticsContext);
}

// Export analytics utilities for direct use
export { getAnalytics, pageview, trackFormSubmission, trackButtonClick };