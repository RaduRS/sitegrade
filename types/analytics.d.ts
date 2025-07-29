declare module '@analytics/google-analytics' {
  export interface GoogleAnalyticsConfig {
    measurementIds: string[];
    debug?: boolean;
    dataLayerName?: string;
    gtagName?: string;
    gtagConfig?: {
      anonymize_ip?: boolean;
      cookie_domain?: string;
      cookie_expires?: number;
      cookie_prefix?: string;
      cookie_update?: boolean;
      cookie_flags?: string;
    };
    customScriptSrc?: string;
    nonce?: string;
  }

  export default function googleAnalytics(config: GoogleAnalyticsConfig): Record<string, unknown>;
}