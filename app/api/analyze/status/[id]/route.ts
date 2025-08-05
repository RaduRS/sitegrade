import { NextRequest } from "next/server";
import { ApiResponses, Validators, withErrorHandling } from "@/lib/apiUtils";
import { DatabaseOperations } from "@/lib/dbUtils";

interface AnalysisResult {
  pillar: string;
  score: number;
  analyzed: boolean;
  insights: string;
  recommendations: string[];
  error_message?: string;
}

interface PillarStatus {
  [key: string]: {
    score: number;
    analyzed: boolean;
    insights: string;
    recommendations: string[];
    error?: string;
  };
}

// Use the same Supabase client from DatabaseOperations to avoid consistency issues
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handleGetStatus(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await params;

  const idError = Validators.required(requestId, "Request ID");
  if (idError) {
    return ApiResponses.badRequest(idError);
  }

  // Get analysis request with results using the same client as other operations
  let analysisRequest;
  try {
    analysisRequest = await DatabaseOperations.getAnalysisRequestWithResults(
      requestId
    );
  } catch {
    return ApiResponses.notFound("Analysis request not found");
  }

  // Calculate progress
  const totalPillars = 7; // Performance, Design, Responsiveness, SEO, Security, Compliance, Analytics
  const completedPillars =
    (analysisRequest.analysis_results as AnalysisResult[])?.filter(
      (result) => result.analyzed
    ).length || 0;
  let progress = Math.round((completedPillars / totalPillars) * 100);

  // Show some progress if analysis has actually started
  const hasStarted =
    analysisRequest.analysis_metadata?.[0]?.extracted_data?.status ===
    "extraction_started";

  if (analysisRequest.status === "processing" && progress === 0 && hasStarted) {
    progress = 5; // Show 5% to indicate processing has started
  }

  // Auto-update status if all pillars are completed but status is still processing
  if (
    completedPillars === totalPillars &&
    (analysisRequest.status === "processing" ||
      analysisRequest.status === "pending")
  ) {
    // Update status to completed using the same database operations
    await DatabaseOperations.updateAnalysisStatus(
      requestId,
      "completed",
      new Date().toISOString()
    );

    // Update the local object for response
    analysisRequest.status = "completed";
    analysisRequest.completed_at = new Date().toISOString();
  }

  // If request is older than 10 minutes and still pending, mark as failed
  const requestAge =
    Date.now() - new Date(analysisRequest.created_at).getTime();
  if (
    analysisRequest.status === "pending" &&
    requestAge > 10 * 60 * 1000 // 10 minutes
  ) {
    // Update status using the same database operations
    await DatabaseOperations.updateAnalysisStatus(
      requestId,
      "failed",
      new Date().toISOString()
    );

    // Also update error message - we'll need a separate operation for this
    await supabase
      .from("analysis_requests")
      .update({
        error_message: "Analysis timed out - process may have failed to start",
      })
      .eq("id", requestId);

    // Update the local object for response
    analysisRequest.status = "failed";
    analysisRequest.error_message =
      "Analysis timed out - process may have failed to start";
    analysisRequest.completed_at = new Date().toISOString();
  }

  // Format response based on status
  const response = {
    id: analysisRequest.id,
    url: analysisRequest.url,
    status: analysisRequest.status,
    progress,
    createdAt: analysisRequest.created_at,
    completedAt: analysisRequest.completed_at,
    errorMessage: analysisRequest.error_message,
    overallScore: analysisRequest.analysis_metadata?.[0]?.total_score,
    analysisDuration: analysisRequest.analysis_metadata?.[0]?.analysis_duration,
    pillars:
      (analysisRequest.analysis_results as AnalysisResult[])?.reduce(
        (acc: PillarStatus, result) => {
          acc[result.pillar] = {
            score: result.score,
            analyzed: result.analyzed,
            insights: result.insights,
            recommendations: result.recommendations,
            error: result.error_message,
          };
          return acc;
        },
        {} as PillarStatus
      ) || {},
    estimatedTimeRemaining:
      analysisRequest.status === "processing"
        ? Math.max(
            0,
            300 -
              Math.floor(
                (Date.now() - new Date(analysisRequest.created_at).getTime()) /
                  1000
              )
          )
        : 0,
  };

  return ApiResponses.success(response);
}

export const GET = withErrorHandling(handleGetStatus);

export async function POST() {
  return ApiResponses.methodNotAllowed();
}

export async function PUT() {
  return ApiResponses.methodNotAllowed();
}

export async function DELETE() {
  return ApiResponses.methodNotAllowed();
}
