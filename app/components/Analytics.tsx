'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { analytics, pageview, trackFormSubmission, trackButtonClick, initAnalytics } from '../lib/gtag';

// Create context
const AnalyticsContext = createContext(analytics);

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize analytics
    initAnalytics();
    
    // Track initial page view
    pageview(window.location.pathname);
  }, []);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics
export function useAnalytics() {
  return useContext(AnalyticsContext);
}

// Export analytics utilities for direct use
export { analytics, pageview, trackFormSubmission, trackButtonClick };