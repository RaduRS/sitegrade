import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ApiResponses, Validators, withErrorHandling } from "@/lib/apiUtils";

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

  // Get analysis request with results
  const { data: analysisRequest, error: requestError } = await supabase
    .from("analysis_requests")
    .select(
      `
        id,
        url,
        email,
        status,
        created_at,
        completed_at,
        error_message,
        analysis_results (
          pillar,
          score,
          analyzed,
          insights,
          recommendations,
          error_message
        ),
        analysis_metadata (
          total_score,
          analysis_duration,
          screenshot_url
        )
      `
    )
    .eq("id", requestId)
    .single();

  if (requestError || !analysisRequest) {
    return ApiResponses.notFound("Analysis request not found");
  }

  // Calculate progress
  const totalPillars = 7; // Performance, Design, Responsiveness, SEO, Security, Compliance
  const completedPillars =
    (analysisRequest.analysis_results as AnalysisResult[])?.filter(
      (result) => result.analyzed
    ).length || 0;
  const progress = Math.round((completedPillars / totalPillars) * 100);

  // Auto-update status if all pillars are completed but status is still processing
  if (
    completedPillars === totalPillars &&
    analysisRequest.status === "processing"
  ) {
    // Update status to completed
    await supabase
      .from("analysis_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    // Update the local object for response
    analysisRequest.status = "completed";
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
