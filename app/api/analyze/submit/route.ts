import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidUrl, normalizeUrl } from "@/lib/dataExtraction";
import { ApiResponses, Validators, withErrorHandling } from "@/lib/apiUtils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handleSubmit(request: NextRequest) {
  const body = await request.json();
  const { url, email } = body;

  // Validate input
  const urlError = Validators.required(url, "URL");
  const emailError = Validators.required(email, "Email");

  if (urlError || emailError) {
    return ApiResponses.badRequest(urlError || emailError || "Invalid input");
  }

  // Validate email format
  if (!Validators.email(email)) {
    return ApiResponses.badRequest("Invalid email format");
  }

  // Validate and normalize URL
  if (!isValidUrl(url)) {
    return ApiResponses.badRequest(
      "Invalid URL format. Please include http:// or https://"
    );
  }

  const normalizedUrl = normalizeUrl(url);

  // Check for recent analysis to prevent spam
  const { data: recentAnalysis } = await supabase
    .from("analysis_requests")
    .select("id")
    .eq("url", normalizedUrl)
    .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes ago
    .single();

  if (recentAnalysis) {
    return ApiResponses.tooManyRequests(
      "Analysis for this URL was recently requested. Please wait before requesting again."
    );
  }

  // Create analysis request
  const { data: analysisRequest, error: insertError } = await supabase
    .from("analysis_requests")
    .insert({
      url: normalizedUrl,
      email,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create analysis request:", insertError);
    return ApiResponses.internalError("Failed to create analysis request");
  }

  // Create analysis metadata
  const { error: metadataError } = await supabase
    .from("analysis_metadata")
    .insert({
      request_id: analysisRequest.id,
      created_at: new Date().toISOString(),
    });

  if (metadataError) {
    console.error("Failed to create analysis metadata:", metadataError);
    // Don't return error here, analysis can still proceed
  }

  fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/analyze/process`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId: analysisRequest.id }),
    }
  ).catch(() => {
    // Silently handle fetch errors
  });

  // Trigger analysis processing (fire and forget)
  // try {
  //   const baseUrl =
  //     process.env.NEXT_PUBLIC_BASE_URL ||
  //     (process.env.VERCEL_URL
  //       ? `https://${process.env.VERCEL_URL}`
  //       : "http://localhost:3000");

  //   const response = await fetch(`${baseUrl}/api/analyze/process`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ requestId: analysisRequest.id }),
  //   });

  //   if (!response.ok) {
  //     console.error(
  //       "Failed to trigger analysis processing:",
  //       response.status,
  //       response.statusText
  //     );
  //     // Update status to failed if we can't trigger processing
  //     await supabase
  //       .from("analysis_requests")
  //       .update({ status: "failed" })
  //       .eq("id", analysisRequest.id);
  //   }
  // } catch (error) {
  //   console.error("Error triggering analysis processing:", error);
  //   // Update status to failed if we can't trigger processing
  //   await supabase
  //     .from("analysis_requests")
  //     .update({ status: "failed" })
  //     .eq("id", analysisRequest.id);
  // }

  return ApiResponses.success({
    id: analysisRequest.id,
    url: normalizedUrl,
    status: "pending",
    message: "Analysis started successfully",
  });
}

export const POST = withErrorHandling(handleSubmit);

export async function GET() {
  return ApiResponses.methodNotAllowed("Method not allowed");
}
