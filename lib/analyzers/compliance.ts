import { ExtractedData } from '../dataExtraction';
import { enhanceComplianceWithVision } from '../visionAnalysis';

export interface ComplianceAnalysisResult {
  score: number;
  insights: string;
  recommendations: string[];
  issues: string[];
  analyzed: boolean;
  categories: {
    accessibility: number;
    privacy: number;
    legal: number;
    cookies: number;
  };
  wcagLevel: string;
  gdprCompliant: boolean;
  cookieConsent: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
}

export async function analyzeCompliance(
  url: string, 
  extractedData: ExtractedData,
  screenshotBase64?: string
): Promise<ComplianceAnalysisResult> {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];
  let insights = '';

  // Initialize category scores
  const categories = {
    accessibility: 100,
    privacy: 100,
    legal: 100,
    cookies: 100
  };

  // Check for cookie consent banner
  const cookieConsent = checkCookieConsent(extractedData);
  if (!cookieConsent) {
    categories.cookies -= 50;
    issues.push('No cookie consent banner detected');
    recommendations.push('Implement a legally compliant cookie consent banner');
  }

  // Check for privacy policy
  const privacyPolicy = checkPrivacyPolicy(extractedData);
  if (!privacyPolicy) {
    categories.privacy -= 40;
    categories.legal -= 30;
    issues.push('Privacy policy not found or not accessible');
    recommendations.push('Add a clear and accessible privacy policy');
  }

  // Check for terms of service
  const termsOfService = checkTermsOfService(extractedData);
  if (!termsOfService) {
    categories.legal -= 30;
    issues.push('Terms of service not found');
    recommendations.push('Add clear terms of service');
  }

  // Accessibility checks
  const accessibilityScore = analyzeAccessibility(extractedData);
  categories.accessibility = accessibilityScore.score;
  issues.push(...accessibilityScore.issues);
  recommendations.push(...accessibilityScore.recommendations);

  // GDPR compliance check
  const gdprCompliant = checkGDPRCompliance(extractedData, cookieConsent, privacyPolicy);
  if (!gdprCompliant) {
    categories.privacy -= 30;
    categories.legal -= 20;
    issues.push('GDPR compliance issues detected');
    recommendations.push('Ensure GDPR compliance with proper consent mechanisms');
  }

  // Calculate overall score
  const categoryScores = Object.values(categories);
  score = Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length);

  // Determine WCAG level
  const wcagLevel = accessibilityScore.score >= 80 ? 'AA' : accessibilityScore.score >= 60 ? 'A' : 'Fail';

  // Generate insights with accessibility details
  const accessibilityDetails = [];
  if (accessibilityScore.score >= 80) {
    accessibilityDetails.push('✅ Strong accessibility foundation');
  } else if (accessibilityScore.score >= 60) {
    accessibilityDetails.push('⚠️ Accessibility needs improvement');
  } else {
    accessibilityDetails.push('❌ Significant accessibility issues');
  }

  if (cookieConsent) {
    accessibilityDetails.push('✅ Cookie consent implemented');
  } else {
    accessibilityDetails.push('❌ Missing cookie consent');
  }

  if (privacyPolicy) {
    accessibilityDetails.push('✅ Privacy policy present');
  } else {
    accessibilityDetails.push('❌ No privacy policy found');
  }

  const detailsText = accessibilityDetails.join('. ');

  if (score >= 90) {
    insights = `Excellent compliance! Your site meets high standards for accessibility and legal requirements. ${detailsText}. WCAG Level: ${wcagLevel}.`;
  } else if (score >= 70) {
    insights = `Good compliance with some areas for improvement. ${detailsText}. WCAG Level: ${wcagLevel}.`;
  } else if (score >= 50) {
    insights = `Moderate compliance. Several important compliance issues need attention. ${detailsText}. WCAG Level: ${wcagLevel}.`;
  } else {
    insights = `Poor compliance. Immediate action required to meet legal and accessibility standards. ${detailsText}. WCAG Level: ${wcagLevel}.`;
  }

  const baseResult = {
    score,
    insights,
    recommendations,
    issues,
    analyzed: true,
    categories,
    wcagLevel,
    gdprCompliant,
    cookieConsent,
    privacyPolicy,
    termsOfService
  };

  // Enhance with vision analysis if screenshot is available
  if (screenshotBase64) {
    try {
      const enhancedResult = await enhanceComplianceWithVision(baseResult, screenshotBase64, url);
      return enhancedResult;
    } catch (error) {
      console.error('Vision enhancement failed, using base result:', error);
      return baseResult;
    }
  }

  return baseResult;
}

function checkCookieConsent(extractedData: ExtractedData): boolean {
  const html = extractedData.html.toLowerCase();
  
  // Check for cookie consent keywords
  const cookieKeywords = [
    'cookie consent', 'accept cookies', 'cookie banner', 'cookie notice',
    'cookie policy', 'we use cookies', 'this site uses cookies', 'cookies help us',
    'accept all cookies', 'manage cookies', 'cookie preferences', 'cookie settings',
    'essential cookies', 'analytics cookies', 'marketing cookies', 'functional cookies'
  ];
  
  // Check for common cookie consent button text
  const buttonKeywords = [
    'accept all', 'accept cookies', 'allow cookies', 'agree and continue',
    'i agree', 'ok', 'got it', 'understand', 'continue', 'close'
  ];
  
  // Check for cookie consent frameworks/libraries
  const cookieFrameworks = [
    'cookiebot', 'onetrust', 'cookiepro', 'trustarc', 'cookielaw',
    'quantcast', 'iubenda', 'termly', 'cookiefirst', 'klaro'
  ];
  
  // Check for GDPR/privacy related terms that often accompany cookie banners
  const privacyTerms = [
    'gdpr', 'privacy policy', 'data protection', 'personal data',
    'tracking', 'analytics', 'third party', 'legitimate interest'
  ];
  
  const hasKeywords = cookieKeywords.some(keyword => html.includes(keyword));
  const hasButtons = buttonKeywords.some(keyword => html.includes(`>${keyword}<`) || html.includes(`"${keyword}"`));
  const hasFrameworks = cookieFrameworks.some(framework => html.includes(framework));
  const hasPrivacyTerms = privacyTerms.some(term => html.includes(term));
  
  // More sophisticated detection - need at least keywords + (buttons OR frameworks OR privacy terms)
  return hasKeywords && (hasButtons || hasFrameworks || hasPrivacyTerms);
}

function checkPrivacyPolicy(extractedData: ExtractedData): boolean {
  const html = extractedData.html.toLowerCase();
  const links = extractedData.links || [];
  
  // Check for privacy policy links
  const privacyLinks = links.filter(link => 
    link.text?.toLowerCase().includes('privacy') || 
    link.href?.toLowerCase().includes('privacy')
  );
  
  // Check for privacy policy content
  const privacyKeywords = ['privacy policy', 'data protection', 'personal information'];
  const hasPrivacyContent = privacyKeywords.some(keyword => html.includes(keyword));
  
  return privacyLinks.length > 0 || hasPrivacyContent;
}

function checkTermsOfService(extractedData: ExtractedData): boolean {
  const html = extractedData.html.toLowerCase();
  const links = extractedData.links || [];
  
  // Check for terms links
  const termsLinks = links.filter(link => 
    link.text?.toLowerCase().includes('terms') || 
    link.href?.toLowerCase().includes('terms')
  );
  
  // Check for terms content
  const termsKeywords = ['terms of service', 'terms and conditions', 'terms of use'];
  const hasTermsContent = termsKeywords.some(keyword => html.includes(keyword));
  
  return termsLinks.length > 0 || hasTermsContent;
}

function analyzeAccessibility(extractedData: ExtractedData): { score: number; issues: string[]; recommendations: string[] } {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for alt text on images
  const images = extractedData.images || [];
  const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '');
  if (imagesWithoutAlt.length > 0) {
    score -= Math.min(30, imagesWithoutAlt.length * 5);
    issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    recommendations.push('Add descriptive alt text to all images');
  }

  // Check for proper heading structure
  const headings = extractedData.headings || [];
  if (headings.length === 0) {
    score -= 20;
    issues.push('No headings found');
    recommendations.push('Use proper heading structure (H1, H2, H3, etc.)');
  } else {
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      score -= 15;
      issues.push('No H1 heading found');
      recommendations.push('Add a main H1 heading to the page');
    } else if (h1Count > 1) {
      score -= 10;
      issues.push('Multiple H1 headings found');
      recommendations.push('Use only one H1 heading per page');
    }
  }

  // Check for form labels (basic check)
  const html = extractedData.html.toLowerCase();
  const hasInputs = html.includes('<input') || html.includes('<textarea') || html.includes('<select');
  const hasLabels = html.includes('<label') || html.includes('aria-label');
  
  if (hasInputs && !hasLabels) {
    score -= 25;
    issues.push('Form inputs may be missing labels');
    recommendations.push('Ensure all form inputs have proper labels');
  }

  // Check for color contrast (basic check - look for common issues)
  if (html.includes('color:') && !html.includes('contrast')) {
    score -= 10;
    recommendations.push('Verify color contrast meets WCAG standards');
  }

  return { score: Math.max(0, score), issues, recommendations };
}

function checkGDPRCompliance(extractedData: ExtractedData, hasCookieConsent: boolean, hasPrivacyPolicy: boolean): boolean {
  // Basic GDPR compliance check
  const html = extractedData.html.toLowerCase();
  
  // Must have privacy policy and cookie consent for GDPR
  if (!hasPrivacyPolicy || !hasCookieConsent) {
    return false;
  }
  
  // Check for GDPR-related keywords
  const gdprKeywords = [
    'gdpr', 'data protection', 'right to be forgotten', 'data subject rights',
    'lawful basis', 'consent', 'legitimate interest'
  ];
  
  const hasGDPRContent = gdprKeywords.some(keyword => html.includes(keyword));
  
  return hasGDPRContent;
}