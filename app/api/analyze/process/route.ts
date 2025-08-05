import { NextRequest } from "next/server";
import {
  extractWebsiteData,
  closeExtractionEngine,
} from "@/lib/dataExtraction";
import {
  analyzePerformance,
  PerformanceAnalysis,
} from "@/lib/analyzers/performance";
import { analyzeDesign } from "@/lib/analyzers/design";
import { analyzeResponsiveness } from "@/lib/analyzers/responsiveness";
import { analyzeSEO } from "@/lib/analyzers/seo";
import { analyzeSecurity } from "@/lib/analyzers/security";
import { analyzeCompliance } from "@/lib/analyzers/compliance";
import { analyzeAnalytics } from "@/lib/analyzers/analytics";
import {
  sendAnalysisCompleteEmail,
  sendAnalysisFailedEmail,
} from "@/lib/email";
import { scoreToGrade } from "@/lib/gradeUtils";
import { ApiResponses, Validators, withErrorHandling } from "@/lib/apiUtils";
import { DatabaseOperations } from "@/lib/dbUtils";

function generatePerformanceInsights(
  performanceResult: PerformanceAnalysis
): string {
  if (performanceResult.score >= 90) {
    return "Excellent performance! Your site loads quickly and provides a great user experience.";
  } else if (performanceResult.score >= 70) {
    return "Good performance with room for improvement. Consider optimizing images and reducing JavaScript.";
  } else if (performanceResult.score >= 50) {
    return "Average performance. Focus on Core Web Vitals and loading speed optimizations.";
  } else {
    return "Poor performance detected. Immediate optimization needed for better user experience.";
  }
}

function generatePerformanceRecommendations(
  performanceResult: PerformanceAnalysis
): string[] {
  const recommendations: string[] = [];

  // Core Web Vitals specific recommendations
  if (performanceResult.coreWebVitals.lcp > 2500) {
    recommendations.push(
      "Optimize images: Use WebP format, add width/height attributes, and implement lazy loading"
    );
    recommendations.push(
      "Improve server response time: Use a CDN, optimize database queries, and enable compression"
    );
    recommendations.push(
      "Remove render-blocking resources: Inline critical CSS and defer non-critical JavaScript"
    );
  }

  if (performanceResult.coreWebVitals.fid > 100) {
    recommendations.push(
      "Reduce JavaScript execution time: Split large bundles and remove unused code"
    );
    recommendations.push(
      "Use a web worker for heavy computations to keep the main thread responsive"
    );
    recommendations.push(
      "Minimize main thread work: Defer non-essential JavaScript until after page load"
    );
  }

  if (performanceResult.coreWebVitals.cls > 0.1) {
    recommendations.push(
      "Set explicit dimensions for images and videos to prevent layout shifts"
    );
    recommendations.push(
      "Reserve space for ads and embeds with CSS min-height properties"
    );
    recommendations.push(
      "Avoid inserting content above existing content unless in response to user interaction"
    );
  }

  // Lighthouse opportunities-based recommendations
  if (
    performanceResult.opportunities &&
    performanceResult.opportunities.length > 0
  ) {
    performanceResult.opportunities.slice(0, 5).forEach((opportunity) => {
      switch (opportunity.id) {
        case "unused-css-rules":
          recommendations.push(
            "Remove unused CSS: Use tools like PurgeCSS to eliminate unused styles"
          );
          break;
        case "unused-javascript":
          recommendations.push(
            "Remove unused JavaScript: Use code splitting and tree shaking to reduce bundle size"
          );
          break;
        case "modern-image-formats":
          recommendations.push(
            "Serve images in next-gen formats: Use WebP or AVIF instead of JPEG/PNG"
          );
          break;
        case "offscreen-images":
          recommendations.push(
            "Defer offscreen images: Implement lazy loading for images below the fold"
          );
          break;
        case "render-blocking-resources":
          recommendations.push(
            "Eliminate render-blocking resources: Inline critical CSS and defer JavaScript"
          );
          break;
        case "unminified-css":
          recommendations.push(
            "Minify CSS: Use build tools to remove whitespace and comments from stylesheets"
          );
          break;
        case "unminified-javascript":
          recommendations.push(
            "Minify JavaScript: Use build tools to compress and optimize JavaScript files"
          );
          break;
        case "efficient-animated-content":
          recommendations.push(
            "Use video formats for animated content: Replace GIFs with MP4 or WebM videos"
          );
          break;
        case "duplicated-javascript":
          recommendations.push(
            "Remove duplicate modules: Consolidate shared code to reduce bundle size"
          );
          break;
        default:
          if (opportunity.title && opportunity.description) {
            recommendations.push(
              `${opportunity.title}: ${opportunity.description}`
            );
          }
      }
    });
  }

  // Additional performance recommendations based on metrics
  if (performanceResult.metrics.firstContentfulPaint > 1800) {
    recommendations.push(
      "Improve First Contentful Paint: Optimize critical rendering path and reduce server response time"
    );
  }

  if (performanceResult.metrics.timeToInteractive > 3800) {
    recommendations.push(
      "Reduce Time to Interactive: Minimize JavaScript execution and optimize third-party scripts"
    );
  }

  if (performanceResult.metrics.totalBlockingTime > 200) {
    recommendations.push(
      "Reduce Total Blocking Time: Break up long tasks and optimize JavaScript execution"
    );
  }

  // Ensure we have at least some recommendations
  if (recommendations.length === 0) {
    if (performanceResult.score >= 90) {
      recommendations.push(
        "Excellent performance! Monitor Core Web Vitals and maintain current optimization levels"
      );
      recommendations.push(
        "Consider implementing performance budgets to prevent regression"
      );
    } else {
      recommendations.push(
        "Enable compression (Gzip/Brotli) to reduce file sizes"
      );
      recommendations.push(
        "Optimize images: Compress and use appropriate formats for better loading times"
      );
      recommendations.push(
        "Minimize HTTP requests by combining CSS and JavaScript files where possible"
      );
    }
  }

  return recommendations.slice(0, 8); // Limit to top 8 recommendations
}

interface AnalysisRequest {
  id: string;
  url: string;
  email: string;
  status: string;
}

interface BasicAnalysisResult {
  score: number;
  insights: string;
  recommendations: string[];
  details: Record<string, unknown>;
}

interface PillarResults {
  [key: string]: {
    score: number;
    analyzed: boolean;
    insights?: string;
    recommendations?: string[];
    grade?: string;
  };
}

async function handleProcess(request: NextRequest) {
  const body = await request.json();
  const { requestId } = body;

  const idError = Validators.required(requestId, "Request ID");
  if (idError) {
    return ApiResponses.badRequest(idError);
  }

  try {
    // Get analysis request
    const analysisRequest = await DatabaseOperations.getAnalysisRequest(
      requestId
    );

    // Check if already processing or completed
    if (analysisRequest.status !== "pending") {
      return ApiResponses.badRequest(
        `Analysis already ${analysisRequest.status}`
      );
    }

    // Update status to processing
    await DatabaseOperations.updateAnalysisStatus(requestId, "processing");

    // Start analysis
    await processAnalysis(analysisRequest);

    return ApiResponses.success({
      success: true,
      message: "Analysis processing started",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Analysis request not found"
    ) {
      return ApiResponses.notFound("Analysis request not found");
    }
    throw error;
  }
}

export const POST = withErrorHandling(handleProcess);

async function processAnalysis(analysisRequest: AnalysisRequest) {
  const startTime = Date.now();
  let extractedData;

  console.log(
    `🚀 Starting analysis for request ${analysisRequest.id} - URL: ${analysisRequest.url}`
  );

  try {
    // Step 1: Extract website data
    console.log(
      `📊 Step 1: Extracting website data for ${analysisRequest.url}`
    );
    extractedData = await extractWebsiteData(analysisRequest.url, {
      timeout: 20000,
      fullPageScreenshot: true,
    });
    console.log(`✅ Step 1: Website data extracted successfully`);

    // Store extracted data in metadata
    await DatabaseOperations.updateAnalysisMetadata(analysisRequest.id, {
      extracted_data: extractedData,
    });

    // Convert screenshot to base64 for vision analysis
    const screenshotBase64 = extractedData.screenshot.toString("base64");

    // Step 2: Analyze Performance (MVP pillar)
    console.log(`📊 Step 2: Analyzing performance`);
    const performanceResult = await analyzePerformance(
      analysisRequest.url,
      extractedData
    );
    console.log(
      `✅ Step 2: Performance analysis complete - Score: ${performanceResult.score}`
    );

    // Store performance results
    const performanceInsights = generatePerformanceInsights(performanceResult);
    const performanceRecommendations =
      generatePerformanceRecommendations(performanceResult);

    await DatabaseOperations.insertAnalysisResult({
      request_id: analysisRequest.id,
      pillar: "performance",
      score: performanceResult.score,
      raw_data: performanceResult,
      insights: performanceInsights,
      recommendations: performanceRecommendations,
      analyzed: performanceResult.analyzed,
      error_message: performanceResult.error || null,
    });

    // Step 3: Analyze Design
    console.log(`📊 Step 3: Analyzing design`);
    const designResult = await analyzeDesign(
      extractedData,
      performanceResult,
      screenshotBase64
    );
    console.log(
      `✅ Step 3: Design analysis complete - Score: ${designResult.score}`
    );

    await DatabaseOperations.insertAnalysisResult({
      request_id: analysisRequest.id,
      pillar: "design",
      score: designResult.score,
      raw_data: designResult,
      insights: designResult.aiInsights.visualStyle,
      recommendations: designResult.recommendations,
      analyzed: true,
    });

    // Step 4: Analyze Responsiveness
    const responsivenessResult = await analyzeResponsiveness(
      extractedData,
      screenshotBase64
    );

    await DatabaseOperations.insertAnalysisResult({
      request_id: analysisRequest.id,
      pillar: "responsiveness",
      score: responsivenessResult.score,
      raw_data: responsivenessResult,
      insights: responsivenessResult.insights,
      recommendations: responsivenessResult.recommendations,
      analyzed: true,
    });

    // Step 5: Analyze SEO
    const seoResult = await analyzeSEO({
      ...extractedData,
      url: analysisRequest.url,
      html: extractedData.html,
    });

    await DatabaseOperations.insertAnalysisResult({
      request_id: analysisRequest.id,
      pillar: "seo",
      score: seoResult.score,
      raw_data: seoResult,
      insights: seoResult.insights,
      recommendations: seoResult.recommendations,
      analyzed: true,
    });

    // Step 6: Basic Security Analysis (MVP pillar)
    const securityResult = await analyzeSecurity(analysisRequest.url);

    await DatabaseOperations.insertAnalysisResult({
      request_id: analysisRequest.id,
      pillar: "security",
      score: securityResult.score,
      raw_data: securityResult,
      insights: securityResult.insights,
      recommendations: securityResult.recommendations,
      analyzed: true,
    });

    // Step 7: Analyze Compliance (Legal, Privacy, Accessibility)
    const complianceResult = await analyzeCompliance(
      analysisRequest.url,
      extractedData,
      screenshotBase64
    );

    await DatabaseOperations.insertAnalysisResult({
      request_id: analysisRequest.id,
      pillar: "compliance",
      score: complianceResult.score,
      raw_data: complianceResult,
      insights: complianceResult.insights,
      recommendations: complianceResult.recommendations,
      analyzed: true,
    });

    // Step 8: Analyze Analytics (Tracking, Conversion, Privacy)
    const analyticsResult = await analyzeAnalytics(extractedData);

    await DatabaseOperations.insertAnalysisResult({
      request_id: analysisRequest.id,
      pillar: "analytics",
      score: analyticsResult.score,
      raw_data: analyticsResult,
      insights: analyticsResult.insights,
      recommendations: analyticsResult.recommendations,
      analyzed: true,
    });

    // Step 9: Calculate overall score and send email
    const results = await DatabaseOperations.getAnalysisResults(
      analysisRequest.id
    );

    const overallScore =
      results && results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + r.score, 0) / results.length
          )
        : 0;

    // Update metadata with final score and duration
    const analysisTime = Math.round((Date.now() - startTime) / 1000);
    await DatabaseOperations.updateAnalysisMetadata(analysisRequest.id, {
      total_score: overallScore,
      analysis_duration: analysisTime,
    });

    // Update request status to completed
    await DatabaseOperations.updateAnalysisStatus(
      analysisRequest.id,
      "completed"
    );

    // Send completion email
    const pillars =
      results?.reduce((acc, result) => {
        acc[result.pillar] = {
          score: result.score,
          analyzed: result.analyzed,
          insights: result.insights,
          recommendations: result.recommendations,
          ...(result.pillar === "performance" && {
            grade: scoreToGrade(result.score),
          }),
        };
        return acc;
      }, {} as PillarResults) || {};

    // Send completion email
    await sendAnalysisCompleteEmail({
      url: analysisRequest.url,
      email: analysisRequest.email,
      requestId: analysisRequest.id,
      overallScore,
      pillars,
      analysisDate: new Date().toLocaleDateString(),
    });
  } catch (error) {
    // Log the actual error details
    console.error("❌ Analysis failed for request:", analysisRequest.id);
    console.error("❌ Error details:", error);
    console.error(
      "❌ Stack trace:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Update status to failed
    await DatabaseOperations.updateAnalysisStatus(analysisRequest.id, "failed");

    // Send failure email
    console.log(
      `📧 Attempting to send failure email to: ${analysisRequest.email} for URL: ${analysisRequest.url}`
    );
    await sendAnalysisFailedEmail(
      analysisRequest.url,
      analysisRequest.email,
      error instanceof Error ? error.message : "Unknown error"
    );
  } finally {
    // Clean up resources
    try {
      await closeExtractionEngine();
    } catch {
      // Failed to close extraction engine
    }
  }
}

export async function GET() {
  return ApiResponses.methodNotAllowed();
}
