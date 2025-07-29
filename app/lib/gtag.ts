"use client";

import Analytics from "analytics";
import googleAnalytics from "@analytics/google-analytics";

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Initialize Analytics with Google Analytics plugin only if tracking ID is available
let analyticsInstance: ReturnType<typeof Analytics> | null = null;
let isInitialized = false;

const initializeAnalytics = () => {
  // Don't auto-initialize - wait for consent
  if (analyticsInstance || !isInitialized) {
    return analyticsInstance;
  }

  // If no tracking ID, create analytics without Google Analytics plugin
  if (!GA_TRACKING_ID) {
    console.warn(
      "Analytics initialized without Google Analytics: NEXT_PUBLIC_GA_TRACKING_ID not found"
    );
    analyticsInstance = Analytics({
      app: "SiteGrade",
      plugins: [], // No plugins if no tracking ID
    });
    return analyticsInstance;
  }

  try {
    analyticsInstance = Analytics({
      app: "SiteGrade",
      plugins: [
        googleAnalytics({
          measurementIds: [GA_TRACKING_ID as string],
        }),
      ],
    });
    return analyticsInstance;
  } catch (error) {
    console.error(
      "Failed to initialize analytics with Google Analytics, falling back to basic analytics:",
      error
    );
    // Fallback to analytics without Google Analytics
    analyticsInstance = Analytics({
      app: "SiteGrade",
      plugins: [],
    });
    return analyticsInstance;
  }
};

// Get analytics instance (only if initialized)
export const getAnalytics = () => {
  return analyticsInstance;
};

// Track page views
export const pageview = (url: string) => {
  const analytics = getAnalytics();
  if (!analytics || typeof window === "undefined") return;

  try {
    analytics.page({
      path: url,
      url: window.location.origin + url,
      title: document.title,
    });
  } catch (error) {
    console.warn("Failed to track page view:", error);
  }
};

// Track custom events
export const event = (
  action: string,
  properties: Record<string, string | number | boolean>
) => {
  const analytics = getAnalytics();
  if (!analytics) return;

  try {
    analytics.track(action, properties);
  } catch (error) {
    console.warn("Failed to track event:", error);
  }
};

// Track form submissions
export const trackFormSubmission = (url: string) => {
  const analytics = getAnalytics();
  if (!analytics) return;

  try {
    analytics.track("Form Submitted", {
      category: "Lead Generation",
      label: "Website Submission",
      value: 1,
      currency: "GBP",
      submittedUrl: url,
      formType: "website_analysis",
    });
  } catch (error) {
    console.warn("Failed to track form submission:", error);
  }
};

// Track button clicks
export const trackButtonClick = (buttonText: string, location: string) => {
  const analytics = getAnalytics();
  if (!analytics) return;

  try {
    analytics.track("Button Clicked", {
      category: "Engagement",
      label: buttonText,
      location: location,
      buttonText: buttonText,
    });
  } catch (error) {
    console.warn("Failed to track button click:", error);
  }
};

// Track user engagement
export const trackEngagement = (
  engagementType: string,
  details: Record<string, string | number | boolean>
) => {
  const analytics = getAnalytics();
  if (!analytics) return;

  try {
    analytics.track("User Engagement", {
      category: "Engagement",
      engagementType: engagementType,
      ...details,
    });
  } catch (error) {
    console.warn("Failed to track engagement:", error);
  }
};

// Identify users (for when we have user data)
export const identify = (
  userId: string,
  traits: Record<string, string | number | boolean>
) => {
  const analytics = getAnalytics();
  if (!analytics) return;

  try {
    analytics.identify(userId, traits);
  } catch (error) {
    console.warn("Failed to identify user:", error);
  }
};

// Initialize analytics (call this only after user consent)
export const initAnalytics = () => {
  if (isInitialized) {
    console.log("Analytics already initialized");
    return;
  }

  isInitialized = true;
  const analytics = initializeAnalytics();

  if (!analytics) {
    console.warn("Analytics initialization failed");
    return;
  }
};
