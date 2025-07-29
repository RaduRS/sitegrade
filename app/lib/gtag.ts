'use client';

import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';

// Google Analytics configuration
export const GA_TRACKING_ID = 'G-2P0SCYLWCE';

// Initialize Analytics with Google Analytics plugin
export const analytics = Analytics({
  app: 'SiteGrade',
  plugins: [
    googleAnalytics({
      trackingId: GA_TRACKING_ID,
    })
  ]
});

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined') {
    analytics.page({
      path: url,
      url: window.location.origin + url,
      title: document.title,
    });
  }
};

// Track custom events
export const event = (action: string, properties: Record<string, string | number | boolean>) => {
  analytics.track(action, properties);
};

// Track form submissions
export const trackFormSubmission = (url: string) => {
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
  analytics.track('Button Clicked', {
    category: 'Engagement',
    label: buttonText,
    location: location,
    buttonText: buttonText,
  });
};

// Track user engagement
export const trackEngagement = (engagementType: string, details: Record<string, string | number | boolean>) => {
  analytics.track('User Engagement', {
    category: 'Engagement',
    engagementType: engagementType,
    ...details,
  });
};

// Identify users (for when we have user data)
export const identify = (userId: string, traits: Record<string, string | number | boolean>) => {
  analytics.identify(userId, traits);
};

// Initialize analytics (call this once in your app)
export const initAnalytics = () => {
  // Analytics is automatically initialized when imported
  console.log('Analytics initialized with Google Analytics');
};