import OpenAI from 'openai';
import { ComplianceAnalysisResult } from './analyzers/compliance';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface VisionComplianceResult {
  cookieBanner: {
    detected: boolean;
    confidence: number;
    description: string;
    type?: 'banner' | 'modal' | 'popup' | 'bar';
    position?: 'top' | 'bottom' | 'center' | 'corner';
  };
  privacyElements: {
    privacyPolicyLink: boolean;
    termsLink: boolean;
    gdprMentions: boolean;
  };
  accessibility: {
    colorContrast: 'good' | 'poor' | 'unknown';
    textReadability: 'good' | 'poor' | 'unknown';
    buttonSizes: 'adequate' | 'small' | 'unknown';
  };
  overallCompliance: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

export async function analyzeScreenshotForCompliance(
  screenshotBase64: string,
  url: string
): Promise<VisionComplianceResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this website screenshot for compliance features. Focus on:

1. COOKIE CONSENT BANNERS/POPUPS:
   - Look for any cookie consent banners, popups, or notices
   - Note their position, style, and content
   - Rate confidence 0-100 on detection

2. PRIVACY & LEGAL ELEMENTS:
   - Privacy policy links
   - Terms of service/conditions links
   - GDPR mentions or compliance indicators

3. ACCESSIBILITY:
   - Color contrast (especially text on backgrounds)
   - Text readability and size
   - Button/clickable element sizes

4. OVERALL ASSESSMENT:
   - Compliance score 0-100
   - Specific issues found
   - Actionable recommendations

Website URL: ${url}

Respond with a detailed JSON analysis following this structure:
{
  "cookieBanner": {
    "detected": boolean,
    "confidence": number (0-100),
    "description": "detailed description of what you see",
    "type": "banner|modal|popup|bar",
    "position": "top|bottom|center|corner"
  },
  "privacyElements": {
    "privacyPolicyLink": boolean,
    "termsLink": boolean,
    "gdprMentions": boolean
  },
  "accessibility": {
    "colorContrast": "good|poor|unknown",
    "textReadability": "good|poor|unknown", 
    "buttonSizes": "adequate|small|unknown"
  },
  "overallCompliance": {
    "score": number (0-100),
    "issues": ["list of specific issues"],
    "recommendations": ["list of actionable recommendations"]
  }
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
    if (!content) {
      throw new Error('No response from OpenAI Vision');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from OpenAI response');
    }

    const result = JSON.parse(jsonMatch[0]) as VisionComplianceResult;
    
    // Validate the result structure
    if (!result.cookieBanner || !result.privacyElements || !result.accessibility || !result.overallCompliance) {
      throw new Error('Invalid response structure from OpenAI Vision');
    }

    return result;

  } catch (error) {
    console.error('Vision analysis failed:', error);
    
    // Return a fallback result
    return {
      cookieBanner: {
        detected: false,
        confidence: 0,
        description: 'Vision analysis failed - using text-based detection only',
        type: undefined,
        position: undefined
      },
      privacyElements: {
        privacyPolicyLink: false,
        termsLink: false,
        gdprMentions: false
      },
      accessibility: {
        colorContrast: 'unknown',
        textReadability: 'unknown',
        buttonSizes: 'unknown'
      },
      overallCompliance: {
        score: 50,
        issues: ['Vision analysis unavailable - limited compliance detection'],
        recommendations: ['Manual review recommended for accurate compliance assessment']
      }
    };
  }
}

export async function enhanceComplianceWithVision(
  textBasedResult: ComplianceAnalysisResult,
  screenshotBase64?: string,
  url?: string
): Promise<ComplianceAnalysisResult & { visionAnalysis?: VisionComplianceResult }> {
  if (!screenshotBase64 || !url) {
    return textBasedResult;
  }

  try {
    const visionResult = await analyzeScreenshotForCompliance(screenshotBase64, url);
    
    // Merge vision results with text-based results
    const enhancedResult = {
      ...textBasedResult,
      score: Math.max(textBasedResult.score, visionResult.overallCompliance.score),
      cookieConsent: textBasedResult.cookieConsent || visionResult.cookieBanner.detected,
      visionAnalysis: visionResult,
      insights: generateEnhancedInsights(textBasedResult, visionResult),
      recommendations: mergeRecommendations(textBasedResult.recommendations, visionResult.overallCompliance.recommendations)
    };

    return enhancedResult;

  } catch (error) {
    console.error('Failed to enhance compliance with vision:', error);
    return textBasedResult;
  }
}

function generateEnhancedInsights(textResult: ComplianceAnalysisResult, visionResult: VisionComplianceResult): string {
  const insights = [];
  
  // Cookie consent insights
  if (visionResult.cookieBanner.detected && visionResult.cookieBanner.confidence > 70) {
    insights.push(`✅ Cookie consent banner detected with ${visionResult.cookieBanner.confidence}% confidence`);
  } else if (textResult.cookieConsent) {
    insights.push('⚠️ Cookie consent detected in code but not visually prominent');
  } else {
    insights.push('❌ No cookie consent banner found');
  }

  // Accessibility insights
  const accessibilityInsights = [];
  
  if (visionResult.accessibility.colorContrast === 'good') {
    accessibilityInsights.push('✅ Good color contrast detected');
  } else if (visionResult.accessibility.colorContrast === 'poor') {
    accessibilityInsights.push('❌ Poor color contrast detected');
  }

  if (visionResult.accessibility.textReadability === 'good') {
    accessibilityInsights.push('✅ Text is readable and well-sized');
  } else if (visionResult.accessibility.textReadability === 'poor') {
    accessibilityInsights.push('❌ Text readability issues detected');
  }

  if (visionResult.accessibility.buttonSizes === 'adequate') {
    accessibilityInsights.push('✅ Interactive elements are appropriately sized');
  } else if (visionResult.accessibility.buttonSizes === 'small') {
    accessibilityInsights.push('⚠️ Some interactive elements may be too small');
  }

  // Add WCAG level information
  if (textResult.wcagLevel) {
    if (textResult.wcagLevel === 'AA') {
      accessibilityInsights.push('✅ Meets WCAG 2.1 AA standards');
    } else if (textResult.wcagLevel === 'A') {
      accessibilityInsights.push('⚠️ Meets WCAG 2.1 A standards (consider upgrading to AA)');
    } else {
      accessibilityInsights.push('❌ Does not meet WCAG accessibility standards');
    }
  }

  // Combine all insights
  const allInsights = [...insights, ...accessibilityInsights];
  
  const finalScore = Math.max(textResult.score, visionResult.overallCompliance.score);
  
  if (finalScore >= 90) {
    return `Excellent compliance! ${allInsights.join('. ')}.`;
  } else if (finalScore >= 70) {
    return `Good compliance with room for improvement. ${allInsights.join('. ')}.`;
  } else if (finalScore >= 50) {
    return `Moderate compliance issues detected. ${allInsights.join('. ')}.`;
  } else {
    return `Significant compliance issues found. ${allInsights.join('. ')}.`;
  }
}

function mergeRecommendations(textRecs: string[], visionRecs: string[]): string[] {
  const merged = [...textRecs];
  
  // Add vision-specific recommendations that aren't duplicates
  visionRecs.forEach(rec => {
    const isDuplicate = merged.some(existing => 
      existing.toLowerCase().includes(rec.toLowerCase().substring(0, 20))
    );
    if (!isDuplicate) {
      merged.push(rec);
    }
  });
  
  return merged;
}