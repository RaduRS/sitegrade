import OpenAI from "openai";
import { ComplianceAnalysisResult } from "./analyzers/compliance";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Combined analysis interface for cost optimization
export interface CombinedVisionAnalysis {
  compliance: {
    cookieBanner: {
      detected: boolean;
      confidence: number;
      description: string;
    };
    accessibility: {
      colorContrast: "good" | "poor" | "unknown";
      textReadability: "good" | "poor" | "unknown";
    };
    overallCompliance: {
      recommendations: string[];
    };
  };
  design: {
    primaryCTA: string;
    visualStyle: string;
    designIssues: string[];
    recommendations: string[];
  };
  responsiveness: {
    layoutStructure: string;
    mobileOptimization: string;
    issues: string[];
    recommendations: string[];
  };
}

// COST-OPTIMIZED: Single API call for all visual analysis
export async function analyzeCombinedVisual(
  screenshotBase64: string,
  url: string
): Promise<CombinedVisionAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this website screenshot for COMPLIANCE, DESIGN, and RESPONSIVENESS in one comprehensive analysis.

COMPLIANCE ANALYSIS:
- Cookie consent banners/notices (detect and confidence level)
- Color contrast quality for accessibility
- Text readability and sizing
- Only recommend features that are clearly missing or problematic

DESIGN ANALYSIS:
- Primary call-to-action identification
- Overall visual style and aesthetics
- Design issues and problems
- Design improvement recommendations

RESPONSIVENESS ANALYSIS:
- Layout structure and organization
- Mobile optimization assessment
- Responsive design issues
- Improvement recommendations

Website URL: ${url}

Respond with this exact JSON structure:
{
  "compliance": {
    "cookieBanner": {
      "detected": boolean,
      "confidence": number,
      "description": "brief description"
    },
    "accessibility": {
      "colorContrast": "good|poor|unknown",
      "textReadability": "good|poor|unknown"
    },
    "overallCompliance": {
      "recommendations": ["max 3 specific recommendations"]
    }
  },
  "design": {
    "primaryCTA": "description of main CTA",
    "visualStyle": "overall design assessment",
    "designIssues": ["list of design problems"],
    "recommendations": ["max 3 design improvements"]
  },
  "responsiveness": {
    "layoutStructure": "layout assessment",
    "mobileOptimization": "mobile-specific evaluation",
    "issues": ["responsive design problems"],
    "recommendations": ["max 3 responsive improvements"]
  }
}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
                detail: "low", // COST OPTIMIZATION: Use low detail
              },
            },
          ],
        },
      ],
      max_tokens: 1000, // COST OPTIMIZATION: Limit tokens
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI Vision");
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from OpenAI response");
    }

    const result = JSON.parse(jsonMatch[0]) as CombinedVisionAnalysis;

    // Validate the result structure
    if (!result.compliance || !result.design || !result.responsiveness) {
      throw new Error(
        "Invalid response structure from combined vision analysis"
      );
    }

    return result;
  } catch (error) {
    console.error("Combined vision analysis failed:", error);

    // Return a fallback result
    return {
      compliance: {
        cookieBanner: {
          detected: false,
          confidence: 0,
          description:
            "Vision analysis failed - using text-based detection only",
        },
        accessibility: {
          colorContrast: "unknown",
          textReadability: "unknown",
        },
        overallCompliance: {
          recommendations: [
            "Manual review recommended for accurate compliance assessment",
          ],
        },
      },
      design: {
        primaryCTA: "Could not analyze due to vision API failure",
        visualStyle: "Analysis unavailable",
        designIssues: ["Vision analysis unavailable"],
        recommendations: ["Manual design review recommended"],
      },
      responsiveness: {
        layoutStructure: "Could not analyze layout",
        mobileOptimization: "Analysis unavailable",
        issues: ["Vision analysis unavailable"],
        recommendations: ["Manual responsiveness review recommended"],
      },
    };
  }
}

export interface VisionComplianceResult {
  cookieBanner: {
    detected: boolean;
    confidence: number;
    description: string;
    type?: "banner" | "modal" | "popup" | "bar";
    position?: "top" | "bottom" | "center" | "corner";
  };
  privacyElements: {
    privacyPolicyLink: boolean;
    termsLink: boolean;
    gdprMentions: boolean;
  };
  accessibility: {
    colorContrast: "good" | "poor" | "unknown";
    textReadability: "good" | "poor" | "unknown";
    buttonSizes: "adequate" | "small" | "unknown";
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
   - Actionable recommendations (only recommend implementing features that are clearly missing, not improving existing ones unless they are severely problematic)

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
}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI Vision");
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from OpenAI response");
    }

    const result = JSON.parse(jsonMatch[0]) as VisionComplianceResult;

    // Validate the result structure
    if (
      !result.cookieBanner ||
      !result.privacyElements ||
      !result.accessibility ||
      !result.overallCompliance
    ) {
      throw new Error("Invalid response structure from OpenAI Vision");
    }

    return result;
  } catch (error) {
    console.error("Vision analysis failed:", error);

    // Return a fallback result
    return {
      cookieBanner: {
        detected: false,
        confidence: 0,
        description: "Vision analysis failed - using text-based detection only",
        type: undefined,
        position: undefined,
      },
      privacyElements: {
        privacyPolicyLink: false,
        termsLink: false,
        gdprMentions: false,
      },
      accessibility: {
        colorContrast: "unknown",
        textReadability: "unknown",
        buttonSizes: "unknown",
      },
      overallCompliance: {
        score: 50,
        issues: ["Vision analysis unavailable - limited compliance detection"],
        recommendations: [
          "Manual review recommended for accurate compliance assessment",
        ],
      },
    };
  }
}

export async function enhanceComplianceWithVision(
  textBasedResult: ComplianceAnalysisResult,
  screenshotBase64?: string,
  url?: string
): Promise<
  ComplianceAnalysisResult & { visionAnalysis?: VisionComplianceResult }
> {
  if (!screenshotBase64 || !url) {
    return textBasedResult;
  }

  try {
    const visionResult = await analyzeScreenshotForCompliance(
      screenshotBase64,
      url
    );

    // Merge vision results with text-based results
    // Use text-based detection as primary source of truth, vision for enhancement
    const enhancedResult = {
      ...textBasedResult,
      score: Math.max(
        textBasedResult.score,
        visionResult.overallCompliance.score
      ),
      cookieConsent:
        textBasedResult.cookieConsent || visionResult.cookieBanner.detected,
      visionAnalysis: visionResult,
      insights: generateEnhancedInsights(textBasedResult, visionResult),
      recommendations: mergeRecommendations(
        textBasedResult.recommendations,
        visionResult.overallCompliance.recommendations
      ),
    };

    return enhancedResult;
  } catch (error) {
    console.error("Failed to enhance compliance with vision:", error);
    return textBasedResult;
  }
}

function generateEnhancedInsights(
  textResult: ComplianceAnalysisResult,
  visionResult: VisionComplianceResult
): string {
  const insights = [];

  // Cookie consent insights
  if (
    visionResult.cookieBanner.detected &&
    visionResult.cookieBanner.confidence > 70
  ) {
    insights.push(
      `✅ Cookie consent banner visually detected with ${visionResult.cookieBanner.confidence}% confidence`
    );
  } else if (
    textResult.cookieConsent &&
    visionResult.cookieBanner.detected &&
    visionResult.cookieBanner.confidence <= 70
  ) {
    insights.push(
      `⚠️ Cookie consent detected in code but may not be visually prominent (${visionResult.cookieBanner.confidence}% visual confidence)`
    );
  } else if (textResult.cookieConsent) {
    insights.push(
      "⚠️ Cookie consent detected in code but not visually prominent"
    );
  } else {
    insights.push("❌ No cookie consent banner found");
  }

  // Accessibility insights
  const accessibilityInsights = [];

  if (visionResult.accessibility.colorContrast === "good") {
    accessibilityInsights.push("✅ Good color contrast detected");
  } else if (visionResult.accessibility.colorContrast === "poor") {
    accessibilityInsights.push("❌ Poor color contrast detected");
  }

  if (visionResult.accessibility.textReadability === "good") {
    accessibilityInsights.push("✅ Text is readable and well-sized");
  } else if (visionResult.accessibility.textReadability === "poor") {
    accessibilityInsights.push("❌ Text readability issues detected");
  }

  if (visionResult.accessibility.buttonSizes === "adequate") {
    accessibilityInsights.push(
      "✅ Interactive elements are appropriately sized"
    );
  } else if (visionResult.accessibility.buttonSizes === "small") {
    accessibilityInsights.push("⚠️ Some interactive elements may be too small");
  }

  // Add WCAG level information
  if (textResult.wcagLevel) {
    if (textResult.wcagLevel === "AA") {
      accessibilityInsights.push("✅ Meets WCAG 2.1 AA standards");
    } else if (textResult.wcagLevel === "A") {
      accessibilityInsights.push(
        "⚠️ Meets WCAG 2.1 A standards (consider upgrading to AA)"
      );
    } else {
      accessibilityInsights.push(
        "❌ Does not meet WCAG accessibility standards"
      );
    }
  }

  // Combine all insights
  const allInsights = [...insights, ...accessibilityInsights];

  const finalScore = Math.max(
    textResult.score,
    visionResult.overallCompliance.score
  );

  if (finalScore >= 90) {
    return `Excellent compliance! ${allInsights.join(". ")}.`;
  } else if (finalScore >= 70) {
    return `Good compliance with room for improvement. ${allInsights.join(
      ". "
    )}.`;
  } else if (finalScore >= 50) {
    return `Moderate compliance issues detected. ${allInsights.join(". ")}.`;
  } else {
    return `Significant compliance issues found. ${allInsights.join(". ")}.`;
  }
}

function mergeRecommendations(
  textRecs: string[],
  visionRecs: string[]
): string[] {
  const merged = [...textRecs];

  // Add vision-specific recommendations that aren't duplicates or contradictory
  visionRecs.forEach((rec) => {
    const recLower = rec.toLowerCase();

    // Skip cookie consent recommendations if already handled by text analysis
    if (
      recLower.includes("cookie") &&
      recLower.includes("consent") &&
      merged.some((existing) => existing.toLowerCase().includes("cookie"))
    ) {
      return;
    }

    // Skip GDPR recommendations if already handled
    if (
      recLower.includes("gdpr") &&
      merged.some((existing) => existing.toLowerCase().includes("gdpr"))
    ) {
      return;
    }

    // Check for general duplicates using a more sophisticated comparison
    const isDuplicate = merged.some((existing) => {
      const existingLower = existing.toLowerCase();
      // Check if they contain similar key phrases
      const keyWords = recLower.split(" ").filter((word) => word.length > 3);
      const matchingWords = keyWords.filter((word) =>
        existingLower.includes(word)
      );
      return matchingWords.length >= Math.min(2, keyWords.length);
    });

    if (!isDuplicate) {
      merged.push(rec);
    }
  });

  return merged;
}
