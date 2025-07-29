'use client';

import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Initialize Analytics with Google Analytics plugin only if tracking ID is available
export const analytics = GA_TRACKING_ID ? Analytics({
  app: 'SiteGrade',
  plugins: [
    googleAnalytics({
      trackingId: GA_TRACKING_ID,
    })
  ]
}) : null;

// Track page views
export const pageview = (url: string) => {
  if (!analytics || typeof window === 'undefined') return;
  
  analytics.page({
    path: url,
    url: window.location.origin + url,
    title: document.title,
  });
};

// Track custom events
export const event = (action: string, properties: Record<string, string | number | boolean>) => {
  if (!analytics) return;
  analytics.track(action, properties);
};

// Track form submissions
export const trackFormSubmission = (url: string) => {
  if (!analytics) return;
  analytics.track('Form Submitted', {
    category: 'Lead Generation',
    label: 'Website Submission',
    value: 1,
    currency: 'GBP',
    submittedUrl: url,
    formType: 'website_analysis',
  });
};

// Track button clicks
export const trackButtonClick = (buttonText: string, location: string) => {
  if (!analytics) return;
  analytics.track('Button Clicked', {
    category: 'Engagement',
    label: buttonText,
    location: location,
    buttonText: buttonText,
  });
};

// Track user engagement
export const trackEngagement = (engagementType: string, details: Record<string, string | number | boolean>) => {
  if (!analytics) return;
  analytics.track('User Engagement', {
    category: 'Engagement',
    engagementType: engagementType,
    ...details,
  });
};

// Identify users (for when we have user data)
export const identify = (userId: string, traits: Record<string, string | number | boolean>) => {
  if (!analytics) return;
  analytics.identify(userId, traits);
};

// Initialize analytics (call this once in your app)
export const initAnalytics = () => {
  if (!analytics) {
    console.warn('Analytics not initialized: GA_TRACKING_ID not found in environment variables');
    return;
  }
  console.log('Analytics initialized with Google Analytics');
};