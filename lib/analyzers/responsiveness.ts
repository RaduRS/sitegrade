import { ExtractedData } from '../dataExtraction';
import OpenAI from 'openai';
import puppeteer, { Page } from 'puppeteer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ResponsivenessAnalysis {
  score: number;
  categories: {
    mobileLayout: number;
    tabletLayout: number;
    desktopLayout: number;
    crossDeviceConsistency: number;
  };
  issues: string[];
  recommendations: string[];
  insights: string;
  analyzed: boolean;
  deviceTesting: {
    mobile: {
      hasOverflow: boolean;
      hasSmallText: boolean;
      hasCloseButtons: boolean;
      layoutBreaks: string[];
    };
    tablet: {
      hasOverflow: boolean;
      layoutBreaks: string[];
      navigationIssues: string[];
    };
    desktop: {
      layoutBreaks: string[];
      unusedSpace: boolean;
    };
  };
  aiInsights: {
    specificIssues: string[];
    breakpointProblems: string[];
    visualRecommendations: string[];
  };
}

export async function analyzeResponsiveness(
  extractedData: ExtractedData, 
  screenshotBase64?: string
): Promise<ResponsivenessAnalysis> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Perform actual device testing with Puppeteer
  const deviceTesting = await performDeviceTesting(extractedData.url);
  
  // Calculate scores based on actual testing results
  const mobileLayout = calculateMobileScore(deviceTesting.mobile, issues);
  const tabletLayout = calculateTabletScore(deviceTesting.tablet, issues);
  const desktopLayout = calculateDesktopScore(deviceTesting.desktop, issues);
  const crossDeviceConsistency = calculateConsistencyScore(deviceTesting, issues);

  const score = Math.round((mobileLayout + tabletLayout + desktopLayout + crossDeviceConsistency) / 4);

  // Generate AI insights for specific visual issues
  let aiInsights = {
    specificIssues: [] as string[],
    breakpointProblems: [] as string[],
    visualRecommendations: [] as string[]
  };

  if (screenshotBase64) {
    try {
      aiInsights = await generateSpecificVisualInsights(extractedData, screenshotBase64, deviceTesting);
      
      // Add specific recommendations based on actual testing
      recommendations.push(...aiInsights.visualRecommendations);
    } catch (error) {
      console.error('Error generating AI insights for responsiveness:', error);
    }
  }

  // Add specific recommendations based on device testing
  addSpecificRecommendations(deviceTesting, recommendations);

  return {
    score: Math.max(0, score),
    categories: {
      mobileLayout,
      tabletLayout,
      desktopLayout,
      crossDeviceConsistency
    },
    issues,
    recommendations,
    insights: `Responsiveness analysis completed with actual device testing. Found ${issues.length} layout issues across devices.`,
    analyzed: true,
    deviceTesting,
    aiInsights
  };
}

// Perform actual device testing with Puppeteer
async function performDeviceTesting(url: string) {
  const browser = await puppeteer.launch({ headless: true });
  
  try {
    // Test mobile (iPhone 12)
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });
    try {
      await mobilePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch {
      await mobilePage.goto(url, { waitUntil: 'load', timeout: 10000 });
    }
    
    const mobileResults = await testMobileLayout(mobilePage);
    
    // Test tablet (iPad)
    const tabletPage = await browser.newPage();
    await tabletPage.setViewport({ width: 768, height: 1024 });
    try {
      await tabletPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch {
      await tabletPage.goto(url, { waitUntil: 'load', timeout: 10000 });
    }
    
    const tabletResults = await testTabletLayout(tabletPage);
    
    // Test desktop
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1920, height: 1080 });
    try {
      await desktopPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch {
      await desktopPage.goto(url, { waitUntil: 'load', timeout: 10000 });
    }
    
    const desktopResults = await testDesktopLayout(desktopPage);
    
    await browser.close();
    
    return {
      mobile: mobileResults,
      tablet: tabletResults,
      desktop: desktopResults
    };
  } catch (error) {
    await browser.close();
    console.error('Error in device testing:', error);
    
    // Return fallback results
    return {
      mobile: { hasOverflow: false, hasSmallText: false, hasCloseButtons: false, layoutBreaks: [] },
      tablet: { hasOverflow: false, layoutBreaks: [], navigationIssues: [] },
      desktop: { layoutBreaks: [], unusedSpace: false }
    };
  }
}

// Test mobile layout issues
async function testMobileLayout(page: Page) {
  const results = {
    hasOverflow: false,
    hasSmallText: false,
    hasCloseButtons: false,
    layoutBreaks: [] as string[]
  };

  try {
    // Get HTML content for static analysis
    const html = await page.content();

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    results.hasOverflow = hasOverflow;
    if (hasOverflow) results.layoutBreaks.push('Horizontal scrolling detected');

    // Check for small text using both runtime and static analysis
    const hasSmallText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        return fontSize > 0 && fontSize < 14;
      });
    }) || !checkFontSizes(html);
    results.hasSmallText = hasSmallText;
    if (hasSmallText) results.layoutBreaks.push('Text smaller than 14px found');

    // Check for close buttons/touch targets using both runtime and static analysis
    const hasCloseButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [onclick]'));
      return buttons.some(btn => {
        const rect = btn.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      });
    }) || checkForSmallClickableElements(html);
    results.hasCloseButtons = hasCloseButtons;
    if (hasCloseButtons) results.layoutBreaks.push('Touch targets smaller than 44px found');

  } catch (error) {
    console.error('Error testing mobile layout:', error);
  }

  return results;
}

// Test tablet layout issues
async function testTabletLayout(page: Page) {
  const results = {
    hasOverflow: false,
    layoutBreaks: [] as string[],
    navigationIssues: [] as string[]
  };

  try {
    // Check for overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    results.hasOverflow = hasOverflow;
    if (hasOverflow) results.layoutBreaks.push('Horizontal overflow on tablet');

    // Check navigation issues
    const navIssues = await page.evaluate(() => {
      const issues = [];
      const nav = document.querySelector('nav');
      if (nav) {
        const navRect = nav.getBoundingClientRect();
        if (navRect.width > window.innerWidth) {
          issues.push('Navigation too wide for tablet');
        }
      }
      return issues;
    });
    results.navigationIssues = navIssues;

  } catch (error) {
    console.error('Error testing tablet layout:', error);
  }

  return results;
}

// Test desktop layout issues
async function testDesktopLayout(page: Page) {
  const results = {
    layoutBreaks: [] as string[],
    unusedSpace: false
  };

  try {
    // Check for unused space
    const unusedSpace = await page.evaluate(() => {
      const body = document.body;
      const bodyRect = body.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // If content is much narrower than viewport, there's unused space
      return bodyRect.width < viewportWidth * 0.7;
    });
    results.unusedSpace = unusedSpace;

  } catch (error) {
    console.error('Error testing desktop layout:', error);
  }

  return results;
}

// Type definitions for device testing results
interface MobileTestResults {
  hasOverflow: boolean;
  hasSmallText: boolean;
  hasCloseButtons: boolean;
  layoutBreaks: string[];
}

interface TabletTestResults {
  hasOverflow: boolean;
  layoutBreaks: string[];
  navigationIssues: string[];
}

interface DesktopTestResults {
  layoutBreaks: string[];
  unusedSpace: boolean;
}

interface DeviceTestingResults {
  mobile: MobileTestResults;
  tablet: TabletTestResults;
  desktop: DesktopTestResults;
}

// Calculate mobile score
function calculateMobileScore(mobileResults: MobileTestResults, issues: string[]): number {
  let score = 100;
  
  if (mobileResults.hasOverflow) {
    score -= 30;
    issues.push('Mobile: Horizontal scrolling detected');
  }
  
  if (mobileResults.hasSmallText) {
    score -= 20;
    issues.push('Mobile: Text too small for mobile reading');
  }
  
  if (mobileResults.hasCloseButtons) {
    score -= 25;
    issues.push('Mobile: Touch targets too small');
  }
  
  score -= mobileResults.layoutBreaks.length * 10;
  
  return Math.max(0, score);
}

// Calculate tablet score
function calculateTabletScore(tabletResults: TabletTestResults, issues: string[]): number {
  let score = 100;
  
  if (tabletResults.hasOverflow) {
    score -= 25;
    issues.push('Tablet: Layout overflow detected');
  }
  
  score -= tabletResults.layoutBreaks.length * 15;
  score -= tabletResults.navigationIssues.length * 20;
  
  return Math.max(0, score);
}

// Calculate desktop score
function calculateDesktopScore(desktopResults: DesktopTestResults, issues: string[]): number {
  let score = 100;
  
  if (desktopResults.unusedSpace) {
    score -= 15;
    issues.push('Desktop: Poor use of available screen space');
  }
  
  score -= desktopResults.layoutBreaks.length * 20;
  
  return Math.max(0, score);
}

// Calculate consistency score
function calculateConsistencyScore(deviceTesting: DeviceTestingResults, issues: string[]): number {
  let score = 100;
  
  // Check if issues are consistent across devices
  const totalIssues = deviceTesting.mobile.layoutBreaks.length + 
                     deviceTesting.tablet.layoutBreaks.length + 
                     deviceTesting.desktop.layoutBreaks.length;
  
  if (totalIssues > 5) {
    score -= 30;
    issues.push('Inconsistent layout behavior across devices');
  }
  
  return Math.max(0, score);
}

// Generate specific visual insights using GPT Vision
async function generateSpecificVisualInsights(
  extractedData: ExtractedData, 
  screenshotBase64: string,
  deviceTesting: DeviceTestingResults
) {
  try {
    const prompt = `Analyze this website screenshot for SPECIFIC responsive design issues. Based on the device testing results:

Mobile Issues: ${JSON.stringify(deviceTesting.mobile)}
Tablet Issues: ${JSON.stringify(deviceTesting.tablet)}
Desktop Issues: ${JSON.stringify(deviceTesting.desktop)}

Look for and identify SPECIFIC visual problems like:
- Exact spacing issues between elements
- Text that appears cut off or overlapping
- Images that don't scale properly
- Navigation elements that look cramped
- Buttons that appear too close together
- Content that looks misaligned
- Specific breakpoint problems

Provide ACTIONABLE recommendations that address the exact visual issues you can see, not generic advice.

Return a JSON object with:
{
  "specificIssues": ["exact issue 1", "exact issue 2"],
  "breakpointProblems": ["specific breakpoint issue 1"],
  "visualRecommendations": ["specific fix 1", "specific fix 2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        // Fallback if JSON parsing fails
        return {
          specificIssues: [content.substring(0, 200)],
          breakpointProblems: [],
          visualRecommendations: []
        };
      }
    }
  } catch (error) {
    console.error('Error generating visual insights:', error);
  }

  return {
    specificIssues: [],
    breakpointProblems: [],
    visualRecommendations: []
  };
}

// Add specific recommendations based on device testing
function addSpecificRecommendations(deviceTesting: DeviceTestingResults, recommendations: string[]) {
  // Only add recommendations for issues that were actually found
  
  // Mobile-specific recommendations
  if (deviceTesting.mobile.hasOverflow) {
    recommendations.push('Fix horizontal scrolling on mobile by adjusting container widths and using max-width: 100%');
  }
  
  if (deviceTesting.mobile.hasSmallText) {
    recommendations.push('Increase font sizes to at least 14px for mobile readability');
  }
  
  if (deviceTesting.mobile.hasCloseButtons) {
    recommendations.push('Increase touch target sizes to minimum 44x44px for buttons, links, and clickable elements');
  }
  
  // Add specific layout break recommendations
  if (deviceTesting.mobile.layoutBreaks.length > 0) {
    recommendations.push(`Fix mobile layout issues: ${deviceTesting.mobile.layoutBreaks.join(', ')}`);
  }
  
  // Tablet-specific recommendations
  if (deviceTesting.tablet.hasOverflow) {
    recommendations.push('Optimize layout for tablet viewport to prevent horizontal scrolling');
  }
  
  if (deviceTesting.tablet.navigationIssues.length > 0) {
    recommendations.push(`Fix tablet navigation: ${deviceTesting.tablet.navigationIssues.join(', ')}`);
  }
  
  if (deviceTesting.tablet.layoutBreaks.length > 0) {
    recommendations.push(`Address tablet layout issues: ${deviceTesting.tablet.layoutBreaks.join(', ')}`);
  }
  
  // Desktop-specific recommendations
  if (deviceTesting.desktop.unusedSpace) {
    recommendations.push('Better utilize available desktop screen space with wider layouts or centered content');
  }
  
  if (deviceTesting.desktop.layoutBreaks.length > 0) {
    recommendations.push(`Fix desktop layout issues: ${deviceTesting.desktop.layoutBreaks.join(', ')}`);
  }
  
  // If no specific issues found, add general best practices
  if (recommendations.length === 0) {
    recommendations.push('Your responsive design looks good! Consider testing on more devices and screen sizes');
    recommendations.push('Ensure consistent user experience across all breakpoints');
  }
}



// Helper functions for static HTML analysis
function checkFontSizes(html: string): boolean {
  // Check if there are any small font sizes in CSS
  const fontSizeMatches = html.match(/font-size:\s*(\d+(?:\.\d+)?)px/gi);
  if (fontSizeMatches) {
    const hasSmallFonts = fontSizeMatches.some(match => {
      const size = parseFloat(match.match(/(\d+(?:\.\d+)?)/)?.[0] || '16');
      return size < 14;
    });
    return !hasSmallFonts; // Return true if NO small fonts found
  }
  
  // Check for rem/em units that might be small
  const relativeMatches = html.match(/font-size:\s*(\d+(?:\.\d+)?)(rem|em)/gi);
  if (relativeMatches) {
    const hasSmallRelative = relativeMatches.some(match => {
      const size = parseFloat(match.match(/(\d+(?:\.\d+)?)/)?.[0] || '1');
      return size < 0.875; // Less than 14px equivalent
    });
    return !hasSmallRelative;
  }
  
  return true; // Assume good if no explicit small font sizes found
}

function checkForSmallClickableElements(html: string): boolean {
  // Look for buttons or links with explicitly small dimensions
  const buttonPatterns = [
    /<button[^>]*style="[^"]*(?:width|height):\s*(?:[1-9]|[12]\d|3[0-9])px/gi,
    /<a[^>]*style="[^"]*(?:width|height):\s*(?:[1-9]|[12]\d|3[0-9])px/gi,
    /\.btn[^{]*{[^}]*(?:width|height):\s*(?:[1-9]|[12]\d|3[0-9])px/gi
  ];
  
  return buttonPatterns.some(pattern => pattern.test(html));
}