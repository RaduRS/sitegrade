import { ExtractedData } from '../dataExtraction';
import { scoreToGrade, Grade } from '../gradeUtils';

export interface PerformanceAnalysis {
  score: number;
  grade: Grade;
  categories: {
    performance: Grade;
    accessibility: Grade;
    bestPractices: Grade;
    seo: Grade;
  };
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms)
    cls: number; // Cumulative Layout Shift
  };
  metrics: {
    firstContentfulPaint: number;
    speedIndex: number;
    timeToInteractive: number;
    totalBlockingTime: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    numericValue: number;
    displayValue: string;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    displayValue: string;
  }>;
  analyzed: boolean;
  error?: string;
  mobileScore?: number;
  desktopScore?: number;
}

export interface PageSpeedInsightsResponse {
  lighthouseResult: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
      seo: { score: number };
    };
    audits: {
      [key: string]: {
        id: string;
        title: string;
        description: string;
        score: number | null;
        numericValue?: number;
        displayValue?: string;
      };
    };
  };
  loadingExperience?: {
    metrics: {
      LARGEST_CONTENTFUL_PAINT_MS?: { percentile: number };
      FIRST_INPUT_DELAY_MS?: { percentile: number };
      CUMULATIVE_LAYOUT_SHIFT_SCORE?: { percentile: number };
    };
  };
}

// Modern functional approach for performance analysis
const PAGESPEED_BASE_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Simple in-memory quota tracking (resets on server restart)
// Removed unused quota tracking variables and functions

export async function analyzePerformance(
  url: string, 
  extractedData?: ExtractedData
): Promise<PerformanceAnalysis> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || '';
  
  // Skip performance analysis if no API key is provided
  if (!apiKey) {
    return {
      score: 0,
      grade: 'F',
      categories: { performance: 'F', accessibility: 'F', bestPractices: 'F', seo: 'F' },
      coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
      metrics: { firstContentfulPaint: 0, speedIndex: 0, timeToInteractive: 0, totalBlockingTime: 0 },
      opportunities: [],
      diagnostics: [],
      analyzed: false,
      error: 'Performance analysis skipped - API key not configured'
    };
  }

  try {
    // Get both mobile and desktop scores
    const [desktopData, mobileData] = await Promise.all([
      fetchPageSpeedData(url, 'desktop', apiKey),
      fetchPageSpeedData(url, 'mobile', apiKey)
    ]);

    const result = processPageSpeedResults(desktopData, mobileData, extractedData);
    return result;

  } catch (error) {
    // Use fallback analysis if extractedData is available
    if (extractedData) {
      return fallbackAnalysis(extractedData, error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Skip analysis if no fallback data available
    return {
      score: 0,
      grade: 'F',
      categories: { performance: 'F', accessibility: 'F', bestPractices: 'F', seo: 'F' },
      coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
      metrics: { firstContentfulPaint: 0, speedIndex: 0, timeToInteractive: 0, totalBlockingTime: 0 },
      opportunities: [],
      diagnostics: [],
      analyzed: false,
      error: `Performance analysis skipped - ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function fetchPageSpeedData(
  url: string, 
  strategy: 'desktop' | 'mobile', 
  apiKey: string
): Promise<PageSpeedInsightsResponse> {
  // Build API URL with multiple category parameters
  const apiUrl = new URL(PAGESPEED_BASE_URL);
  apiUrl.searchParams.set('url', url);
  apiUrl.searchParams.append('category', 'performance');
  apiUrl.searchParams.append('category', 'accessibility');
  apiUrl.searchParams.append('category', 'best-practices');
  apiUrl.searchParams.append('category', 'seo');
  apiUrl.searchParams.set('strategy', strategy);
  apiUrl.searchParams.set('key', apiKey);

  // API usage tracking removed

  // Make API request with extended timeout for PageSpeed API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds

  try {
    const response = await fetch(apiUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SiteGrade-Analyzer/1.0',
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Get response body for better error details
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        errorDetails = errorBody ? ` - ${errorBody}` : '';
      } catch {
        // Could not read error body
      }

      // Handle specific error cases
      if (response.status === 403) {
        // Check if it's an API not enabled error
        if (errorDetails.includes('SERVICE_DISABLED') || errorDetails.includes('accessNotConfigured')) {
          throw new Error(`PageSpeed Insights API is not enabled. Please enable it in Google Cloud Console (${strategy})${errorDetails}`);
        } else {
          throw new Error(`PageSpeed API quota exceeded or invalid API key (${strategy})${errorDetails}`);
        }
      } else if (response.status === 429) {
        throw new Error(`PageSpeed API rate limit exceeded (${strategy})${errorDetails}`);
      } else if (response.status === 400) {
        throw new Error(`Invalid URL or request parameters (${strategy})${errorDetails}`);
      } else {
        throw new Error(`PageSpeed API error (${strategy}): ${response.status} ${response.statusText}${errorDetails}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log('PageSpeed API request timed out after 60 seconds, using fallback analysis');
        throw new Error('PageSpeed API request timed out - using basic analysis');
      }
      
      // Handle specific API errors more gracefully
      if (error.message.includes('access denied') || error.message.includes('quota')) {
        console.error('PageSpeed API access issue:', error.message);
        throw new Error('API access limited - using basic analysis');
      }
      
      console.error('PageSpeed API error:', error.message);
      throw new Error(`API error - using basic analysis`);
    }
    
    console.error('Unknown PageSpeed API error:', error);
    throw new Error('Network error - using basic analysis');
  }
}

function processPageSpeedResults(
  desktopData: PageSpeedInsightsResponse,
  mobileData: PageSpeedInsightsResponse, 
  extractedData?: ExtractedData
): PerformanceAnalysis {
  const desktopResult = desktopData.lighthouseResult;
  const mobileResult = mobileData.lighthouseResult;


  
  // Check if performance category is missing
  const hasPerformanceData = 
    desktopResult.categories.performance !== undefined || 
    mobileResult.categories.performance !== undefined;
  
  if (!hasPerformanceData) {
    // If we have extracted data, use fallback analysis
    if (extractedData) {
      return fallbackAnalysis(extractedData, 'Performance category missing from PageSpeed API response');
    }
  }

  // Calculate average scores (convert from 0-1 to 0-100) and convert to grades
  const scores = {
    performance: Math.round(((desktopResult.categories.performance?.score || 0) + 
                            (mobileResult.categories.performance?.score || 0)) / 2 * 100),
    accessibility: Math.round(((desktopResult.categories.accessibility?.score || 0) + 
                              (mobileResult.categories.accessibility?.score || 0)) / 2 * 100),
    bestPractices: Math.round(((desktopResult.categories['best-practices']?.score || 0) + 
                              (mobileResult.categories['best-practices']?.score || 0)) / 2 * 100),
    seo: Math.round(((desktopResult.categories.seo?.score || 0) + 
                    (mobileResult.categories.seo?.score || 0)) / 2 * 100)
  };

  const categories = {
    performance: scoreToGrade(scores.performance),
    accessibility: scoreToGrade(scores.accessibility),
    bestPractices: scoreToGrade(scores.bestPractices),
    seo: scoreToGrade(scores.seo)
  };

  

  // Use mobile data for Core Web Vitals (more representative of real user experience)
  const mobileAudits = mobileResult.audits;
  const mobileLoadingExperience = mobileData.loadingExperience;
  
  const coreWebVitals = {
    lcp: mobileLoadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile || 
         mobileAudits['largest-contentful-paint']?.numericValue || 0,
    fid: mobileLoadingExperience?.metrics?.FIRST_INPUT_DELAY_MS?.percentile || 
         mobileAudits['max-potential-fid']?.numericValue || 0,
    cls: mobileLoadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile || 
         mobileAudits['cumulative-layout-shift']?.numericValue || 0
  };

  // Use mobile metrics (typically worse, more representative)
  const metrics = {
    firstContentfulPaint: mobileAudits['first-contentful-paint']?.numericValue || 
                         extractedData?.performance.firstContentfulPaint || 0,
    speedIndex: mobileAudits['speed-index']?.numericValue || 0,
    timeToInteractive: mobileAudits['interactive']?.numericValue || 0,
    totalBlockingTime: mobileAudits['total-blocking-time']?.numericValue || 0
  };

  // Combine opportunities from both mobile and desktop, prioritizing mobile
  const mobileOpportunities = extractAuditItems(mobileAudits, [
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'offscreen-images',
    'render-blocking-resources',
    'unminified-css',
    'unminified-javascript',
    'efficient-animated-content',
    'duplicated-javascript'
  ]);

  const desktopOpportunities = extractAuditItems(desktopResult.audits, [
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'offscreen-images',
    'render-blocking-resources',
    'unminified-css',
    'unminified-javascript',
    'efficient-animated-content',
    'duplicated-javascript'
  ]);

  // Merge opportunities, prioritizing mobile issues
  const opportunities = mergeOpportunities(mobileOpportunities, desktopOpportunities);

  // Extract diagnostics from mobile (more critical)
  const diagnostics = extractAuditItems(mobileAudits, [
    'mainthread-work-breakdown',
    'bootup-time',
    'uses-long-cache-ttl',
    'total-byte-weight',
    'dom-size',
    'critical-request-chains',
    'user-timings',
    'third-party-summary'
  ]);

  // Use the averaged performance score
  const score = scores.performance;
  const grade = categories.performance;

  // Debug: Log the final score and opportunities


  return {
    score,
    grade,
    categories,
    coreWebVitals,
    metrics,
    opportunities,
    diagnostics,
    analyzed: true,
    mobileScore: Math.round((mobileResult.categories.performance?.score || 0) * 100),
    desktopScore: Math.round((desktopResult.categories.performance?.score || 0) * 100)
  };
}

function mergeOpportunities(
  mobileOpportunities: PerformanceAnalysis['opportunities'],
  desktopOpportunities: PerformanceAnalysis['opportunities']
): PerformanceAnalysis['opportunities'] {
  const merged = [...mobileOpportunities];
  
  // Add desktop opportunities that aren't already in mobile
  desktopOpportunities.forEach(desktopOpp => {
    const existingMobile = merged.find(mobileOpp => mobileOpp.id === desktopOpp.id);
    if (!existingMobile) {
      merged.push(desktopOpp);
    }
  });

  // Sort by impact (lower score = higher impact)
  return merged.sort((a, b) => a.score - b.score);
}

function extractAuditItems(
  audits: PageSpeedInsightsResponse['lighthouseResult']['audits'],
  auditIds: string[]
): Array<{
  id: string;
  title: string;
  description: string;
  score: number;
  numericValue: number;
  displayValue: string;
}> {
  return auditIds
    .map(id => audits[id])
    .filter(audit => audit && audit.score !== null)
    .map(audit => ({
      id: audit.id,
      title: audit.title,
      description: audit.description,
      score: Math.round((audit.score || 0) * 100),
      numericValue: audit.numericValue || 0,
      displayValue: audit.displayValue || ''
    }));
}

function fallbackAnalysis(extractedData: ExtractedData, error: string): PerformanceAnalysis {
    // Basic performance analysis using extracted data
    const { performance, scripts, styles, images } = extractedData;
    
    // Simple scoring based on load time and resource count
    let score = 100;
    const opportunities = [];
    
    // Penalize slow load times
    if (performance.loadTime > 3000) {
      score -= 30;
      opportunities.push({
        id: 'slow-load-time',
        title: 'Improve Page Load Time',
        description: 'Page takes longer than 3 seconds to load',
        score: 30,
        numericValue: performance.loadTime,
        displayValue: `${performance.loadTime}ms`
      });
    } else if (performance.loadTime > 2000) {
      score -= 20;
      opportunities.push({
        id: 'moderate-load-time',
        title: 'Optimize Page Load Time',
        description: 'Page load time could be improved',
        score: 20,
        numericValue: performance.loadTime,
        displayValue: `${performance.loadTime}ms`
      });
    } else if (performance.loadTime > 1000) {
      score -= 10;
    }
    
    // Penalize too many external resources
    if (scripts.length > 10) {
      score -= 15;
      opportunities.push({
        id: 'too-many-scripts',
        title: 'Reduce JavaScript Files',
        description: `Found ${scripts.length} script files. Consider bundling or removing unused scripts.`,
        score: 15,
        numericValue: scripts.length,
        displayValue: `${scripts.length} scripts`
      });
    }
    
    if (styles.length > 5) {
      score -= 10;
      opportunities.push({
        id: 'too-many-styles',
        title: 'Reduce CSS Files',
        description: `Found ${styles.length} stylesheet files. Consider combining CSS files.`,
        score: 10,
        numericValue: styles.length,
        displayValue: `${styles.length} stylesheets`
      });
    }
    
    if (images.length > 50) {
      score -= 10;
      opportunities.push({
        id: 'too-many-images',
        title: 'Optimize Image Loading',
        description: `Found ${images.length} images. Consider lazy loading or image optimization.`,
        score: 10,
        numericValue: images.length,
        displayValue: `${images.length} images`
      });
    }
    
    score = Math.max(0, score);

    // Add a default opportunity if no issues found
    if (opportunities.length === 0) {
      opportunities.push({
        id: 'basic-analysis-complete',
        title: 'Basic Performance Check Complete',
        description: 'Site appears to have good basic performance metrics.',
        score: 100,
        numericValue: performance.loadTime,
        displayValue: `${performance.loadTime}ms load time`
      });
    }

    return {
      score,
      grade: scoreToGrade(score),
      categories: { 
        performance: scoreToGrade(score), 
        accessibility: 'F', 
        bestPractices: 'F', 
        seo: 'F' 
      },
      coreWebVitals: { 
        lcp: performance.firstContentfulPaint || 0, 
        fid: 0, 
        cls: 0 
      },
      metrics: {
        firstContentfulPaint: performance.firstContentfulPaint || 0,
        speedIndex: 0,
        timeToInteractive: 0,
        totalBlockingTime: 0
      },
      opportunities,
      diagnostics: [],
      analyzed: true,
      // Only show error if it's not a timeout or API access issue
      error: error.includes('timed out') || error.includes('access') || error.includes('quota') ? undefined : error
    };
  }