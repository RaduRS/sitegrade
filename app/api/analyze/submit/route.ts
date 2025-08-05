import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidUrl, normalizeUrl } from "@/lib/dataExtraction";
import { ApiResponses, Validators, withErrorHandling } from "@/lib/apiUtils";
import { isValidBusinessEmail } from "@/lib/emailValidation";

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

  // Validate email format and check for temporary/burner emails
  const emailValidation = isValidBusinessEmail(email);
  if (!emailValidation.isValid) {
    return ApiResponses.badRequest(emailValidation.reason || "Invalid email");
  }

  // Check if user has already used the system
  const { data: existingUser } = await supabase
    .from("analysis_requests")
    .select("email")
    .eq("email", email.toLowerCase())
    .single();

  if (existingUser) {
    return ApiResponses.badRequest(
      "This email has already been used for an analysis. Each user can only generate one report. If you need another analysis, please contact our support team at <a href='mailto:hello@sitegrade.co.uk' style='color: #fbbf24; text-decoration: underline;'>hello@sitegrade.co.uk</a>"
    );
  }

  // Validate and normalize URL
  if (!isValidUrl(url)) {
    return ApiResponses.badRequest(
      "Invalid URL format. Please include http:// or https://"
    );
  }

  const normalizedUrl = normalizeUrl(url);

  // Note: Multiple users can analyze the same website - no URL restrictions

  // Create analysis request
  const { data: analysisRequest, error: insertError } = await supabase
    .from("analysis_requests")
    .insert({
      url: normalizedUrl,
      email: email.toLowerCase(), // Store email in lowercase for consistency
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

  // Trigger analysis processing with proper error handling
  const processUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }/api/analyze/process`;

  fetch(processUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestId: analysisRequest.id }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Failed to trigger analysis process: ${response.status} ${response.statusText}`,
          errorText
        );

        // Update status to failed if the process trigger fails
        await supabase
          .from("analysis_requests")
          .update({
            status: "failed",
            error_message: `Failed to start analysis: ${response.status} ${response.statusText}`,
            completed_at: new Date().toISOString(),
          })
          .eq("id", analysisRequest.id);
      }
    })
    .catch(async (error) => {
      console.error(
        `Network error triggering analysis process for request ${analysisRequest.id}:`,
        error
      );

      // Update status to failed if there's a network error
      await supabase
        .from("analysis_requests")
        .update({
          status: "failed",
          error_message: `Network error starting analysis: ${error.message}`,
          completed_at: new Date().toISOString(),
        })
        .eq("id", analysisRequest.id);
    });

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
