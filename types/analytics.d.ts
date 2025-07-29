declare module '@analytics/google-analytics' {
  export interface GoogleAnalyticsConfig {
    trackingId: string;
    [key: string]: string | number | boolean | undefined;
  }

  export default function googleAnalytics(config: GoogleAnalyticsConfig): Record<string, unknown>;
}