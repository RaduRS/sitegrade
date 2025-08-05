import { ExtractedData } from '../dataExtraction';

export interface AnalyticsAnalysis {
  score: number;
  analyzed: boolean;
  insights: string;
  recommendations: string[];
  categories: {
    tracking: {
      score: number;
      hasGoogleAnalytics: boolean;
      hasGoogleTagManager: boolean;
      hasFacebookPixel: boolean;
      hasOtherTracking: string[];
      trackingImplementation: 'none' | 'basic' | 'comprehensive';
    };
    conversion: {
      score: number;
      hasGoals: boolean;
      hasEcommerce: boolean;
      hasEventTracking: boolean;
      conversionOptimization: 'poor' | 'basic' | 'good' | 'excellent';
    };
    performance: {
      score: number;
      trackingImpact: 'low' | 'medium' | 'high';
      asyncLoading: boolean;
      trackingSize: number;
      performanceImpact: string;
    };
    privacy: {
      score: number;
      hasCookieConsent: boolean;
      hasPrivacyPolicy: boolean;
      gdprCompliant: boolean;
      privacyImplementation: 'poor' | 'basic' | 'good' | 'excellent';
    };
  };
  trackingTools: {
    name: string;
    type: 'analytics' | 'marketing' | 'performance' | 'social' | 'other';
    implementation: 'good' | 'needs_improvement' | 'poor';
    impact: 'low' | 'medium' | 'high';
  }[];
  recommendations_detailed: {
    tracking: string[];
    conversion: string[];
    performance: string[];
    privacy: string[];
  };
}

export async function analyzeAnalytics(extractedData: ExtractedData): Promise<AnalyticsAnalysis> {
  const html = extractedData.html.toLowerCase();
  const scripts = extractedData.scripts || [];
  
  // Analyze tracking implementation
  const trackingAnalysis = analyzeTrackingImplementation(html, scripts);
  
  // Analyze conversion tracking
  const conversionAnalysis = analyzeConversionTracking(html, scripts);
  
  // Analyze performance impact
  const performanceAnalysis = analyzeTrackingPerformance(html, scripts);
  
  // Analyze privacy compliance
  const privacyAnalysis = analyzePrivacyCompliance(html);
  
  // Identify tracking tools
  const trackingTools = identifyTrackingTools(html, scripts);
  
  // Calculate overall score
  const overallScore = Math.round(
    (trackingAnalysis.score + conversionAnalysis.score + performanceAnalysis.score + privacyAnalysis.score) / 4
  );
  
  // Generate insights
  const insights = generateAnalyticsInsights(trackingAnalysis, conversionAnalysis, performanceAnalysis, privacyAnalysis, trackingTools);
  
  // Generate recommendations
  const recommendations = generateAnalyticsRecommendations(trackingAnalysis, conversionAnalysis, performanceAnalysis, privacyAnalysis);
  
  return {
    score: overallScore,
    analyzed: true,
    insights,
    recommendations: recommendations.general,
    categories: {
      tracking: trackingAnalysis,
      conversion: conversionAnalysis,
      performance: performanceAnalysis,
      privacy: privacyAnalysis
    },
    trackingTools,
    recommendations_detailed: recommendations.detailed
  };
}

function analyzeTrackingImplementation(html: string, scripts: string[]) {
  let score = 100;
  const issues = [];
  
  // Check for Google Analytics
  const hasGoogleAnalytics = html.includes('google-analytics') || 
                            html.includes('gtag') || 
                            html.includes('ga(') ||
                            scripts.some(script => script.includes('googletagmanager') || script.includes('google-analytics'));
  
  // Check for Google Tag Manager
  const hasGoogleTagManager = html.includes('googletagmanager') || 
                             html.includes('gtm.js') ||
                             scripts.some(script => script.includes('googletagmanager'));
  
  // Check for Facebook Pixel
  const hasFacebookPixel = html.includes('facebook.net/tr') || 
                          html.includes('fbq(') ||
                          scripts.some(script => script.includes('facebook.net'));
  
  // Check for other tracking tools
  const otherTracking: string[] = [];
  const trackingPatterns = [
    { name: 'Hotjar', pattern: /hotjar|hjid/i },
    { name: 'Mixpanel', pattern: /mixpanel/i },
    { name: 'Amplitude', pattern: /amplitude/i },
    { name: 'Adobe Analytics', pattern: /adobe.*analytics|omniture/i },
    { name: 'Segment', pattern: /segment\.(com|io)/i },
    { name: 'Intercom', pattern: /intercom/i },
    { name: 'Zendesk', pattern: /zendesk/i },
    { name: 'Crisp', pattern: /crisp\.chat/i }
  ];
  
  trackingPatterns.forEach(({ name, pattern }) => {
    if (pattern.test(html) || scripts.some(script => pattern.test(script))) {
      otherTracking.push(name);
    }
  });
  
  // Determine implementation level
  let trackingImplementation: 'none' | 'basic' | 'comprehensive' = 'none';
  const trackingCount = [hasGoogleAnalytics, hasGoogleTagManager, hasFacebookPixel].filter(Boolean).length + otherTracking.length;
  
  if (trackingCount === 0) {
    trackingImplementation = 'none';
    score = 20;
    issues.push('No analytics tracking detected');
  } else if (trackingCount <= 2) {
    trackingImplementation = 'basic';
    score = 60;
  } else {
    trackingImplementation = 'comprehensive';
    score = 90;
  }
  
  // Bonus for proper implementation
  if (hasGoogleTagManager) {
    score += 10; // GTM is best practice
  }
  
  return {
    score: Math.min(100, score),
    hasGoogleAnalytics,
    hasGoogleTagManager,
    hasFacebookPixel,
    hasOtherTracking: otherTracking,
    trackingImplementation
  };
}

function analyzeConversionTracking(html: string, scripts: string[]) {
  let score = 50; // Start with neutral score
  
  // Check for goal tracking
  const hasGoals = html.includes('gtag(\'event\'') || 
                   html.includes('ga(\'send\', \'event\'') ||
                   html.includes('fbq(\'track\'') ||
                   scripts.some(script => script.includes('event') || script.includes('conversion'));
  
  // Check for ecommerce tracking
  const hasEcommerce = html.includes('ecommerce') || 
                      html.includes('purchase') ||
                      html.includes('transaction') ||
                      scripts.some(script => script.includes('ecommerce') || script.includes('purchase'));
  
  // Check for event tracking
  const hasEventTracking = html.includes('gtag(\'event\'') || 
                          html.includes('ga(\'send\', \'event\'') ||
                          html.includes('onclick') ||
                          scripts.some(script => script.includes('click') || script.includes('event'));
  
  // Calculate conversion optimization level
  let conversionOptimization: 'poor' | 'basic' | 'good' | 'excellent' = 'poor';
  const conversionFeatures = [hasGoals, hasEcommerce, hasEventTracking].filter(Boolean).length;
  
  if (conversionFeatures === 0) {
    conversionOptimization = 'poor';
    score = 20;
  } else if (conversionFeatures === 1) {
    conversionOptimization = 'basic';
    score = 50;
  } else if (conversionFeatures === 2) {
    conversionOptimization = 'good';
    score = 75;
  } else {
    conversionOptimization = 'excellent';
    score = 95;
  }
  
  return {
    score,
    hasGoals,
    hasEcommerce,
    hasEventTracking,
    conversionOptimization
  };
}

function analyzeTrackingPerformance(html: string, scripts: string[]) {
  let score = 100;
  let trackingSize = 0;
  
  // Check for async loading
  const asyncLoading = html.includes('async') || html.includes('defer');
  
  // Estimate tracking script size (simplified)
  scripts.forEach(script => {
    if (script.includes('google') || script.includes('facebook') || script.includes('analytics')) {
      trackingSize += script.length;
    }
  });
  
  // Determine tracking impact
  let trackingImpact: 'low' | 'medium' | 'high' = 'low';
  if (trackingSize > 50000) {
    trackingImpact = 'high';
    score -= 30;
  } else if (trackingSize > 20000) {
    trackingImpact = 'medium';
    score -= 15;
  }
  
  // Penalty for synchronous loading
  if (!asyncLoading) {
    score -= 20;
  }
  
  const performanceImpact = trackingImpact === 'high' ? 
    'High impact on page load performance' :
    trackingImpact === 'medium' ? 
    'Moderate impact on page load performance' :
    'Low impact on page load performance';
  
  return {
    score: Math.max(0, score),
    trackingImpact,
    asyncLoading,
    trackingSize,
    performanceImpact
  };
}

function analyzePrivacyCompliance(html: string) {
  let score = 100;
  
  // Enhanced cookie consent detection
  const cookieKeywords = ['cookie', 'cookies'];
  const consentKeywords = ['consent', 'accept', 'agree', 'allow', 'approve'];
  const bannerKeywords = ['banner', 'notice', 'popup', 'modal', 'dialog'];
  
  const hasCookieKeyword = cookieKeywords.some(keyword => 
    html.toLowerCase().includes(keyword)
  );
  const hasConsentKeyword = consentKeywords.some(keyword => 
    html.toLowerCase().includes(keyword)
  );
  const hasBannerKeyword = bannerKeywords.some(keyword => 
    html.toLowerCase().includes(keyword)
  );
  
  // Check for common cookie consent frameworks
  const hasConsentFramework = html.includes('cookiebot') || 
                             html.includes('onetrust') || 
                             html.includes('cookieconsent') ||
                             html.includes('gdpr') ||
                             html.includes('cc-window') ||
                             html.includes('cookie-notice') ||
                             html.includes('consent-banner');
  
  const hasCookieConsent = (hasCookieKeyword && hasConsentKeyword) || 
                          hasConsentFramework ||
                          (hasCookieKeyword && hasBannerKeyword);
  
  // Check for privacy policy
  const hasPrivacyPolicy = html.toLowerCase().includes('privacy') && 
                          html.toLowerCase().includes('policy');
  
  // Basic GDPR compliance check
  const gdprCompliant = hasCookieConsent && hasPrivacyPolicy;
  

  
  // Calculate privacy implementation level
  let privacyImplementation: 'poor' | 'basic' | 'good' | 'excellent' = 'poor';
  
  if (!hasCookieConsent && !hasPrivacyPolicy) {
    privacyImplementation = 'poor';
    score = 20;
  } else if (hasCookieConsent && hasPrivacyPolicy) {
    privacyImplementation = 'good';
    score = 85;
  } else if (hasCookieConsent || hasPrivacyPolicy) {
    privacyImplementation = 'basic';
    score = 60;
  }
  
  // Check for advanced privacy features
  if (html.includes('gdpr') || html.includes('ccpa') || html.includes('data protection')) {
    privacyImplementation = 'excellent';
    score = 95;
  }
  
  return {
    score,
    hasCookieConsent,
    hasPrivacyPolicy,
    gdprCompliant,
    privacyImplementation
  };
}

function identifyTrackingTools(html: string, scripts: string[]) {
  const tools: Array<{
    name: string;
    type: 'analytics' | 'marketing' | 'performance' | 'social' | 'other';
    implementation: 'good' | 'needs_improvement' | 'poor';
    impact: 'low' | 'medium' | 'high';
  }> = [];
  const allContent = html + ' ' + scripts.join(' ');
  
  const trackingTools = [
    { 
      name: 'Google Analytics', 
      type: 'analytics' as const, 
      patterns: [
        'google-analytics\\.com',
        'googletagmanager\\.com/gtag',
        'gtag\\(',
        'ga\\(',
        'GA_MEASUREMENT_ID',
        'G-[A-Z0-9]{10}',
        'UA-\\d+-\\d+'
      ] 
    },
    { 
      name: 'Google Tag Manager', 
      type: 'analytics' as const, 
      patterns: [
        'googletagmanager\\.com/gtm',
        'gtm\\.js',
        'GTM-[A-Z0-9]+',
        'dataLayer'
      ] 
    },
    { 
      name: 'Facebook Pixel', 
      type: 'marketing' as const, 
      patterns: [
        'connect\\.facebook\\.net',
        'facebook\\.net/tr',
        'fbq\\(',
        'facebook-pixel',
        '_fbp'
      ] 
    },
    { 
      name: 'Hotjar', 
      type: 'analytics' as const, 
      patterns: [
        'static\\.hotjar\\.com',
        'hotjar',
        'hjid',
        'hj\\(',
        '_hjid'
      ] 
    },
    { 
      name: 'Mixpanel', 
      type: 'analytics' as const, 
      patterns: [
        'cdn\\.mxpnl\\.com',
        'mixpanel',
        'mixpanel\\.track',
        'mixpanel\\.init'
      ] 
    },
    { 
      name: 'Amplitude', 
      type: 'analytics' as const, 
      patterns: [
        'cdn\\.amplitude\\.com',
        'amplitude',
        'amplitude\\.getInstance',
        'amplitude\\.init'
      ] 
    },
    { 
      name: 'Adobe Analytics', 
      type: 'analytics' as const, 
      patterns: [
        'adobe.*analytics',
        'omniture',
        'sc\\.omtrdc\\.net',
        's_code',
        's\\.t\\('
      ] 
    },
    { 
      name: 'Segment', 
      type: 'analytics' as const, 
      patterns: [
        'cdn\\.segment\\.com',
        'segment\\.com',
        'segment\\.io',
        'analytics\\.track',
        'analytics\\.page'
      ] 
    },
    { 
      name: 'Intercom', 
      type: 'social' as const, 
      patterns: [
        'widget\\.intercom\\.io',
        'intercom',
        'Intercom\\(',
        'intercomSettings'
      ] 
    },
    { 
      name: 'Zendesk', 
      type: 'social' as const, 
      patterns: [
        'zendesk',
        'zdassets\\.com',
        'zopim',
        'chat\\.zopim'
      ] 
    },
    { 
      name: 'Crisp', 
      type: 'social' as const, 
      patterns: [
        'client\\.crisp\\.chat',
        'crisp\\.chat',
        '\\$crisp',
        'CRISP_WEBSITE_ID'
      ] 
    }
  ];
  
  trackingTools.forEach(tool => {
    const found = tool.patterns.some(pattern => 
      new RegExp(pattern, 'i').test(allContent)
    );
    
    if (found) {
      tools.push({
        name: tool.name,
        type: tool.type,
        implementation: 'good' as const, // Simplified for now
        impact: 'medium' as const // Simplified for now
      });
    }
  });
  
  return tools;
}

function generateAnalyticsInsights(
  tracking: { trackingImplementation: string },
  conversion: { conversionOptimization: string },
  performance: { trackingImpact: string; asyncLoading: boolean },
  privacy: { gdprCompliant: boolean; hasCookieConsent: boolean; hasPrivacyPolicy: boolean },
  tools: Array<{ name: string; type: string; implementation: string; impact: string }>
) {
  const insights = [];
  
  // Tracking insights
  if (tracking.trackingImplementation === 'none') {
    insights.push('No analytics tracking detected - you\'re missing valuable user behavior data');
  } else if (tracking.trackingImplementation === 'basic') {
    insights.push('Basic analytics tracking in place - consider expanding for better insights');
  } else {
    insights.push('Comprehensive analytics tracking detected - good data collection setup');
  }
  
  // Conversion insights
  if (conversion.conversionOptimization === 'poor') {
    insights.push('No conversion tracking found - you can\'t measure goal completions');
  } else if (conversion.conversionOptimization === 'excellent') {
    insights.push('Excellent conversion tracking setup with goals, events, and ecommerce');
  }
  
  // Performance insights
  if (performance.trackingImpact === 'high') {
    insights.push('Analytics scripts are significantly impacting page load performance');
  } else if (!performance.asyncLoading) {
    insights.push('Analytics scripts should be loaded asynchronously for better performance');
  }
  
  // Privacy-related tracking insights (technical implementation only)
  if (privacy.hasCookieConsent || privacy.hasPrivacyPolicy) {
    insights.push('Privacy-related elements detected in code (cookie consent/privacy policy references)');
  } else {
    insights.push('No privacy-related tracking controls detected in code');
  }
  
  // Tools insights
  if (tools.length > 5) {
    insights.push(`Many tracking tools detected (${tools.length}) - consider consolidating to reduce performance impact`);
  }
  
  return insights.join('. ') + '.';
}

function generateAnalyticsRecommendations(
  tracking: { trackingImplementation: string; hasGoogleTagManager: boolean; hasGoogleAnalytics: boolean },
  conversion: { hasGoals: boolean; hasEventTracking: boolean; hasEcommerce: boolean },
  performance: { asyncLoading: boolean; trackingImpact: string },
  privacy: { hasCookieConsent: boolean; hasPrivacyPolicy: boolean; gdprCompliant: boolean }
) {
  const general = [];
  const detailed = {
    tracking: [] as string[],
    conversion: [] as string[],
    performance: [] as string[],
    privacy: [] as string[]
  };
  
  // Tracking recommendations
  if (tracking.trackingImplementation === 'none') {
    general.push('Implement Google Analytics or similar analytics tool');
    detailed.tracking.push('Set up Google Analytics 4 for basic website analytics');
    detailed.tracking.push('Consider Google Tag Manager for easier tag management');
  } else if (!tracking.hasGoogleTagManager) {
    detailed.tracking.push('Implement Google Tag Manager for better tag management');
  }
  
  // Conversion recommendations
  if (!conversion.hasGoals) {
    general.push('Set up conversion goals to measure success');
    detailed.conversion.push('Define and track key conversion goals (form submissions, downloads, etc.)');
  }
  
  if (!conversion.hasEventTracking) {
    detailed.conversion.push('Implement event tracking for user interactions (clicks, scrolls, video plays)');
  }
  
  if (!conversion.hasEcommerce && tracking.hasGoogleAnalytics) {
    detailed.conversion.push('Set up Enhanced Ecommerce tracking if you sell products online');
  }
  
  // Performance recommendations
  if (!performance.asyncLoading) {
    general.push('Load analytics scripts asynchronously');
    detailed.performance.push('Add async or defer attributes to analytics script tags');
  }
  
  if (performance.trackingImpact === 'high') {
    general.push('Optimize analytics implementation to reduce performance impact');
    detailed.performance.push('Review and consolidate tracking scripts to reduce page load time');
  }
  
  // Privacy-related tracking recommendations (technical implementation only)
  if (!privacy.hasCookieConsent && (tracking.hasGoogleAnalytics || tracking.hasGoogleTagManager)) {
    detailed.privacy.push('Consider implementing consent management for tracking scripts');
  }
  
  if (tracking.trackingImplementation !== 'none') {
    detailed.privacy.push('Ensure tracking scripts respect user consent preferences when implemented');
  }
  
  // If everything is good
  if (general.length === 0) {
    general.push('Analytics implementation looks good! Consider advanced features like custom dimensions and audiences');
  }
  
  return { general, detailed };
}