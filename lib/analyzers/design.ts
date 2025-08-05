import { ExtractedData } from '../dataExtraction';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DesignAnalysis {
  screenshot?: string; // URL to screenshot
  colorScheme: {
    dominantColors: string[];
    colorCount: number;
    contrastRatio: number; // WCAG contrast compliance
  };
  typography: {
    fontFamilies: string[];
    fontSizes: number[];
    readabilityScore: number; // Based on font size, line height
  };
  layout: {
    cumulativeLayoutShift: number; // From Core Web Vitals
    viewportUtilization: number; // How much of viewport is used
    whitespaceRatio: number;
  };
  aiInsights: {
    primaryCTA: string; // "Identify the main call-to-action"
    visualStyle: string; // "Describe the visual style (minimalist, corporate, etc.)"
    designIssues: string[]; // Specific, actionable issues
  };
  score: number; // Calculated from measurable factors
  issues: string[];
  recommendations: string[];
}

export async function analyzeDesign(extractedData: ExtractedData, performanceData?: { coreWebVitals?: { cls?: number } }, screenshotBase64?: string): Promise<DesignAnalysis> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Analyze color scheme
  const colorScheme = analyzeColorScheme(extractedData);
  
  // Analyze typography
  const typography = analyzeTypography(extractedData);
  
  // Analyze layout
  const layout = analyzeLayout(extractedData, performanceData);
  
  // Generate AI insights using GPT Vision
  const aiInsights = await generateAIInsights(extractedData, screenshotBase64);

  // Calculate design score based on measurable factors
  let score = 100;
  
  // Color scheme scoring
  if (colorScheme.colorCount > 10) {
    score -= 15;
    issues.push('Too many colors used - consider simplifying the color palette');
    recommendations.push('Limit your color palette to 3-5 main colors for better visual consistency');
  }
  
  if (colorScheme.contrastRatio < 4.5) {
    score -= 20;
    issues.push('Poor color contrast detected - may affect readability');
    recommendations.push('Improve color contrast to meet WCAG AA standards (4.5:1 ratio minimum)');
  }

  // Typography scoring
  if (typography.fontFamilies.length > 3) {
    score -= 10;
    issues.push('Too many font families used - affects visual consistency');
    recommendations.push('Limit to 2-3 font families maximum for better typography consistency');
  }
  
  if (typography.readabilityScore < 70) {
    score -= 15;
    issues.push('Typography readability could be improved');
    recommendations.push('Increase font sizes and line height for better readability');
  }

  // Layout scoring
  if (layout.cumulativeLayoutShift > 0.1) {
    score -= 20;
    issues.push('High layout shift detected - affects user experience');
    recommendations.push('Set explicit dimensions for images and videos to prevent layout shifts');
  }
  
  if (layout.viewportUtilization < 60) {
    score -= 10;
    issues.push('Poor viewport utilization - content appears cramped or poorly distributed');
    recommendations.push('Optimize layout to better utilize available screen space');
  }

  // Additional design recommendations
  if (extractedData.images.some(img => !img.alt)) {
    recommendations.push('Add alt text to all images for better accessibility and SEO');
  }

  if (extractedData.headings.filter(h => h.level === 1).length !== 1) {
    recommendations.push('Use exactly one H1 tag per page for better content hierarchy');
  }

  // Add vision-based recommendations if available
  if (aiInsights.visionRecommendations && aiInsights.visionRecommendations.length > 0) {
    recommendations.push(...aiInsights.visionRecommendations);
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, Math.round(score));

  return {
    colorScheme,
    typography,
    layout,
    aiInsights,
    score,
    issues,
    recommendations
  };
}

function analyzeColorScheme(extractedData: ExtractedData) {
  // Extract colors from CSS and inline styles
  const colors = extractColorsFromHTML(extractedData.html);
  
  // Calculate contrast ratio (simplified)
  const contrastRatio = calculateAverageContrast(colors);
  
  return {
    dominantColors: colors.slice(0, 5), // Top 5 colors
    colorCount: colors.length,
    contrastRatio
  };
}

function analyzeTypography(extractedData: ExtractedData) {
  // Extract font families and sizes from CSS
  const fontData = extractFontData(extractedData.html);
  
  // Calculate readability score based on font sizes and line heights
  const readabilityScore = calculateReadabilityScore(fontData);
  
  return {
    fontFamilies: fontData.families,
    fontSizes: fontData.sizes,
    readabilityScore
  };
}

function analyzeLayout(extractedData: ExtractedData, performanceData?: { coreWebVitals?: { cls?: number } }) {
  // Get CLS from performance data if available
  const cumulativeLayoutShift = performanceData?.coreWebVitals?.cls || 0;
  
  // Analyze viewport utilization (simplified)
  const viewportUtilization = calculateViewportUtilization(extractedData.html);
  
  // Calculate whitespace ratio (simplified)
  const whitespaceRatio = calculateWhitespaceRatio(extractedData.html);
  
  return {
    cumulativeLayoutShift,
    viewportUtilization,
    whitespaceRatio
  };
}

async function generateAIInsights(extractedData: ExtractedData, screenshotBase64?: string) {
  // If we have a screenshot, use GPT Vision for detailed analysis
  if (screenshotBase64) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this website screenshot for design quality and provide specific recommendations. Focus on:

1. VISUAL DESIGN:
   - Overall visual appeal and professionalism
   - Color scheme effectiveness and harmony
   - Typography choices and readability
   - Layout and spacing quality
   - Brand consistency and modern design trends

2. USER EXPERIENCE:
   - Navigation clarity and accessibility
   - Call-to-action visibility and effectiveness
   - Content hierarchy and organization
   - Mobile-friendliness indicators
   - Visual clutter or distractions

3. DESIGN ISSUES:
   - Specific problems you can identify
   - Areas that look outdated or unprofessional
   - Accessibility concerns (contrast, text size)
   - Layout problems or inconsistencies

4. ACTIONABLE RECOMMENDATIONS:
   - Specific, implementable design improvements
   - Color, typography, or layout suggestions
   - UX enhancements
   - Modern design best practices to adopt

Respond with a JSON object following this structure:
{
  "primaryCTA": "description of the main call-to-action and its effectiveness",
  "visualStyle": "overall design style assessment (e.g., Modern, Traditional, Minimalist, etc.)",
  "designIssues": ["specific design problems identified"],
  "recommendations": ["specific, actionable design recommendations"]
}`
              },
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
        max_tokens: 1500,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        // Extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const visionResult = JSON.parse(jsonMatch[0]);
          return {
            primaryCTA: visionResult.primaryCTA || 'No clear primary call-to-action identified',
            visualStyle: visionResult.visualStyle || 'Contemporary',
            designIssues: visionResult.designIssues || [],
            visionRecommendations: visionResult.recommendations || []
          };
        }
      }
    } catch (error) {
      console.error('GPT Vision analysis failed:', error);
    }
  }
  
  // Fallback to basic HTML analysis
  const primaryCTA = identifyPrimaryCTA(extractedData);
  const visualStyle = determineVisualStyle(extractedData);
  const designIssues = identifyDesignIssues(extractedData);
  
  return {
    primaryCTA,
    visualStyle,
    designIssues,
    visionRecommendations: []
  };
}

// Helper functions
function extractColorsFromHTML(html: string): string[] {
  const colors: string[] = [];
  
  // Extract hex colors
  const hexMatches = html.match(/#[0-9a-fA-F]{3,6}/g);
  if (hexMatches) {
    colors.push(...hexMatches);
  }
  
  // Extract rgb colors
  const rgbMatches = html.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g);
  if (rgbMatches) {
    colors.push(...rgbMatches);
  }
  
  // Remove duplicates and return unique colors
  return [...new Set(colors)];
}

function calculateAverageContrast(colors: string[]): number {
  // Simplified contrast calculation
  // In a real implementation, this would calculate actual WCAG contrast ratios
  if (colors.length < 2) return 7; // Default good contrast
  
  // Mock calculation - return a value between 1 and 21
  return Math.min(21, Math.max(1, colors.length * 1.5));
}

function extractFontData(html: string) {
  const families: string[] = [];
  const sizes: number[] = [];
  
  // Extract font-family declarations
  const fontFamilyMatches = html.match(/font-family:\s*([^;]+)/gi);
  if (fontFamilyMatches) {
    fontFamilyMatches.forEach(match => {
      const family = match.replace(/font-family:\s*/i, '').replace(/['"]/g, '').split(',')[0].trim();
      if (family && !families.includes(family)) {
        families.push(family);
      }
    });
  }
  
  // Extract font-size declarations
  const fontSizeMatches = html.match(/font-size:\s*(\d+(?:\.\d+)?)(px|em|rem|%)/gi);
  if (fontSizeMatches) {
    fontSizeMatches.forEach(match => {
      const sizeMatch = match.match(/(\d+(?:\.\d+)?)/);
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1]);
        if (!sizes.includes(size)) {
          sizes.push(size);
        }
      }
    });
  }
  
  return { families, sizes };
}

function calculateReadabilityScore(fontData: { families: string[], sizes: number[] }): number {
  let score = 100;
  
  // Penalize very small font sizes
  const smallFonts = fontData.sizes.filter(size => size < 14);
  score -= smallFonts.length * 5;
  
  // Penalize too many different font sizes
  if (fontData.sizes.length > 8) {
    score -= (fontData.sizes.length - 8) * 3;
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateViewportUtilization(html: string): number {
  // Simplified calculation - in reality would analyze actual layout
  // Look for common layout indicators
  const hasContainer = html.includes('container') || html.includes('wrapper');
  const hasGrid = html.includes('grid') || html.includes('flex');
  const hasResponsive = html.includes('responsive') || html.includes('col-');
  
  let utilization = 70; // Base score
  
  if (hasContainer) utilization += 10;
  if (hasGrid) utilization += 10;
  if (hasResponsive) utilization += 10;
  
  return Math.min(100, utilization);
}

function calculateWhitespaceRatio(html: string): number {
  // Simplified whitespace analysis
  const textContent = html.replace(/<[^>]*>/g, '').trim();
  const totalLength = html.length;
  const contentLength = textContent.length;
  
  return Math.round(((totalLength - contentLength) / totalLength) * 100);
}

function identifyPrimaryCTA(extractedData: ExtractedData): string {
  // Look for common CTA patterns
  const buttons = extractedData.html.match(/<button[^>]*>([^<]+)<\/button>/gi);
  const links = extractedData.links.filter(link => 
    link.text.toLowerCase().includes('get started') ||
    link.text.toLowerCase().includes('sign up') ||
    link.text.toLowerCase().includes('buy now') ||
    link.text.toLowerCase().includes('contact') ||
    link.text.toLowerCase().includes('learn more')
  );
  
  if (links.length > 0) {
    return `Primary CTA appears to be: "${links[0].text}"`;
  }
  
  if (buttons && buttons.length > 0) {
    const buttonText = buttons[0].replace(/<[^>]*>/g, '').trim();
    return `Primary CTA appears to be: "${buttonText}"`;
  }
  
  return 'No clear primary call-to-action identified';
}

function determineVisualStyle(extractedData: ExtractedData): string {
  const html = extractedData.html.toLowerCase();
  
  // Look for style indicators
  if (html.includes('bootstrap') || html.includes('corporate')) return 'Corporate/Professional';
  if (html.includes('minimal') || html.includes('clean')) return 'Minimalist';
  if (html.includes('creative') || html.includes('artistic')) return 'Creative/Artistic';
  if (html.includes('modern') || html.includes('contemporary')) return 'Modern';
  if (html.includes('traditional') || html.includes('classic')) return 'Traditional';
  
  // Analyze color usage
  const colors = extractColorsFromHTML(extractedData.html);
  if (colors.length <= 3) return 'Minimalist';
  if (colors.length > 8) return 'Colorful/Vibrant';
  
  return 'Contemporary';
}

function identifyDesignIssues(extractedData: ExtractedData): string[] {
  const issues: string[] = [];
  
  // Check for common design issues
  if (extractedData.images.length > 20) {
    issues.push('High number of images may slow page load and clutter design');
  }
  
  if (extractedData.headings.filter(h => h.level === 1).length > 1) {
    issues.push('Multiple H1 tags detected - should use only one per page');
  }
  
  if (extractedData.headings.filter(h => h.level === 1).length === 0) {
    issues.push('No H1 tag detected - important for content hierarchy');
  }
  
  // Check for missing alt text
  const imagesWithoutAlt = extractedData.images.filter(img => !img.alt || img.alt.trim() === '');
  if (imagesWithoutAlt.length > 0) {
    issues.push(`${imagesWithoutAlt.length} images missing alt text`);
  }
  
  return issues;
}