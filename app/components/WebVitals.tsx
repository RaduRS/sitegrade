"use client";

import { useEffect } from 'react';
import type { Metric } from 'web-vitals';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function WebVitals() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS((metric: Metric) => {
          // Track Cumulative Layout Shift
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'CLS',
              value: Math.round(metric.value * 1000),
              custom_map: { metric_id: 'cls' }
            });
          }
        });

        onINP((metric: Metric) => {
          // Track Interaction to Next Paint (replaces FID)
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'INP',
              value: Math.round(metric.value),
              custom_map: { metric_id: 'inp' }
            });
          }
        });

        onFCP((metric: Metric) => {
          // Track First Contentful Paint
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'FCP',
              value: Math.round(metric.value),
              custom_map: { metric_id: 'fcp' }
            });
          }
        });

        onLCP((metric: Metric) => {
          // Track Largest Contentful Paint
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'LCP',
              value: Math.round(metric.value),
              custom_map: { metric_id: 'lcp' }
            });
          }
        });

        onTTFB((metric: Metric) => {
          // Track Time to First Byte
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'TTFB',
              value: Math.round(metric.value),
              custom_map: { metric_id: 'ttfb' }
            });
          }
        });
      });
    }
  }, []);

  return null;
}

export default WebVitals;