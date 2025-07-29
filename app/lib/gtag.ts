'use client';

import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Debug logging
console.log('GA_TRACKING_ID from env:', GA_TRACKING_ID);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('GA')));

// Initialize Analytics with Google Analytics plugin only if tracking ID is available
let analyticsInstance: ReturnType<typeof Analytics> | null = null;

const initializeAnalytics = () => {
  if (analyticsInstance) {
    return analyticsInstance;
  }

  // If no tracking ID, create analytics without Google Analytics plugin
  if (!GA_TRACKING_ID) {
    console.warn('Analytics initialized without Google Analytics: NEXT_PUBLIC_GA_TRACKING_ID not found');
    analyticsInstance = Analytics({
      app: 'SiteGrade',
      plugins: [] // No plugins if no tracking ID
    });
    return analyticsInstance;
  }

  try {
    analyticsInstance = Analytics({
      app: 'SiteGrade',
      plugins: [
        googleAnalytics({
          trackingId: GA_TRACKING_ID,
        })
      ]
    });
    console.log('Analytics initialized successfully with Google Analytics tracking ID:', GA_TRACKING_ID);
    return analyticsInstance;
  } catch (error) {
    console.error('Failed to initialize analytics with Google Analytics, falling back to basic analytics:', error);
    // Fallback to analytics without Google Analytics
    analyticsInstance = Analytics({
      app: 'SiteGrade',
      plugins: []
    });
    return analyticsInstance;
  }
};

// Get analytics instance
export const getAnalytics = () => {
  return initializeAnalytics();
};

// Track page views
export const pageview = (url: string) => {
  const analytics = getAnalytics();
  if (!analytics || typeof window === 'undefined') return;
  
  try {
    analytics.page({
      path: url,
      url: window.location.origin + url,
      title: document.title,
    });
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
};

// Track custom events
export const event = (action: string, properties: Record<string, string | number | boolean>) => {
  const analytics = getAnalytics();
  if (!analytics) return;
  
  try {
    analytics.track(action, properties);
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
};

// Track form submissions
export const trackFormSubmission = (url: string) => {
  const analytics = getAnalytics();
  if (!analytics) return;
  
  try {
    analytics.track('Form Submitted', {
      category: 'Lead Generation',
      label: 'Website Submission',
      value: 1,
      currency: 'GBP',
      submittedUrl: url,
      formType: 'website_analysis',
    });
  } catch (error) {
    console.warn('Failed to track form submission:', error);
  }
};

// Track button clicks
export const trackButtonClick = (buttonText: string, location: string) => {
  const analytics = getAnalytics();
  if (!analytics) return;
  
  try {
    analytics.track('Button Clicked', {
      category: 'Engagement',
      label: buttonText,
      location: location,
      buttonText: buttonText,
    });
  } catch (error) {
    console.warn('Failed to track button click:', error);
  }
};

// Track user engagement
export const trackEngagement = (engagementType: string, details: Record<string, string | number | boolean>) => {
  const analytics = getAnalytics();
  if (!analytics) return;
  
  try {
    analytics.track('User Engagement', {
      category: 'Engagement',
      engagementType: engagementType,
      ...details,
    });
  } catch (error) {
    console.warn('Failed to track engagement:', error);
  }
};

// Identify users (for when we have user data)
export const identify = (userId: string, traits: Record<string, string | number | boolean>) => {
  const analytics = getAnalytics();
  if (!analytics) return;
  
  try {
    analytics.identify(userId, traits);
  } catch (error) {
    console.warn('Failed to identify user:', error);
  }
};

// Initialize analytics (call this once in your app)
export const initAnalytics = () => {
  const analytics = getAnalytics();
  if (!analytics) {
    console.warn('Analytics initialization failed');
    return;
  }
  
  if (GA_TRACKING_ID) {
    console.log('Analytics initialized with Google Analytics');
  } else {
    console.log('Analytics initialized without Google Analytics (no tracking ID provided)');
  }
};