'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';

interface AnalyticsEvent {
  type: string;
  data: Record<string, string | number | boolean>;
  timestamp?: number;
}

// Simple analytics class using modern JavaScript
class SimpleAnalytics {
  private events: AnalyticsEvent[] = [];

  track(event: AnalyticsEvent) {
    const eventWithTimestamp = {
      ...event,
      timestamp: Date.now()
    };
    
    this.events.push(eventWithTimestamp);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventWithTimestamp);
    }
    
    // In production, you would send this to your analytics service
  }

  trackPageView(url: string) {
    this.track({
      type: 'page_view',
      data: { url }
    });
  }

  trackFormSubmission(url: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Form submitted with URL:', url);
    }
    this.track({
      type: 'form_submission',
      data: { url }
    });
  }

  trackButtonClick(buttonText: string, location: string) {
    this.track({
      type: 'button_click',
      data: { buttonText, location }
    });
  }
}

// Create analytics instance
const analytics = new SimpleAnalytics();

// Create context
const AnalyticsContext = createContext(analytics);

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Track initial page view
    analytics.trackPageView(window.location.pathname);
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

// Export analytics instance for direct use
export { analytics };