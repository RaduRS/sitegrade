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
      
      // Optimize for back/forward cache (bfcache)
      // Use pageshow event instead of load for bfcache compatibility
      const handlePageShow = (event: PageTransitionEvent) => {
        if (event.persisted) {
          // Page was restored from bfcache
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'page_view', {
              event_category: 'Navigation',
              event_label: 'bfcache_restore',
              custom_map: { navigation_type: 'bfcache' }
            });
          }
        }
      };
      
      window.addEventListener('pageshow', handlePageShow, { passive: true });
      
      return () => {
        window.removeEventListener('pageshow', handlePageShow);
      };
    }
  }, []);

  return null;
}

export default WebVitals;