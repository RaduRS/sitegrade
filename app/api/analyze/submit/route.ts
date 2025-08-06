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
  // Add function start log with timestamp
  console.log("🔵 [SUBMIT] Function started at:", new Date().toISOString());
  
  try {
    const body = await request.json();
    const { url, email } = body;
    
    console.log("🔵 [SUBMIT] Request received:", { 
      hasUrl: !!url, 
      hasEmail: !!email,
      urlLength: url?.length || 0 
    });

    // Validate input
    const urlError = Validators.required(url, "URL");
    const emailError = Validators.required(email, "Email");

    if (urlError || emailError) {
      console.log("🔴 [SUBMIT] Validation failed:", { urlError, emailError });
      return ApiResponses.badRequest(urlError || emailError || "Invalid input");
    }

    // Validate email format and check for temporary/burner emails
    const emailValidation = isValidBusinessEmail(email);
    if (!emailValidation.isValid) {
      console.log("🔴 [SUBMIT] Email validation failed:", emailValidation.reason);
      return ApiResponses.badRequest(emailValidation.reason || "Invalid email");
    }

    console.log("🔵 [SUBMIT] Email validation passed");

    // Check if user has already used the system
    const { data: existingUser } = await supabase
      .from("analysis_requests")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      console.log("🔴 [SUBMIT] Email already exists:", email);
      return ApiResponses.badRequest(
        "This email has already been used for an analysis. Each user can only generate one report. If you need another analysis, please contact our support team at <a href='mailto:hello@sitegrade.co.uk' style='color: #fbbf24; text-decoration: underline;'>hello@sitegrade.co.uk</a>"
      );
    }

    // Validate and normalize URL
    if (!isValidUrl(url)) {
      console.log("🔴 [SUBMIT] Invalid URL format:", url);
      return ApiResponses.badRequest(
        "Invalid URL format. Please include http:// or https://"
      );
    }

    const normalizedUrl = normalizeUrl(url);
    console.log("🔵 [SUBMIT] URL normalized:", { original: url, normalized: normalizedUrl });

    // Create analysis request
    console.log("🔵 [SUBMIT] Creating analysis request in database");
    const { data: analysisRequest, error: insertError } = await supabase
      .from("analysis_requests")
      .insert({
        url: normalizedUrl,
        email: email.toLowerCase(),
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("🔴 [SUBMIT] Database insert failed:", insertError);
      return ApiResponses.internalError("Failed to create analysis request");
    }

    console.log("✅ [SUBMIT] Analysis request created with ID:", analysisRequest.id);

    // Create analysis metadata
    const { error: metadataError } = await supabase
      .from("analysis_metadata")
      .insert({
        request_id: analysisRequest.id,
        created_at: new Date().toISOString(),
      });

    if (metadataError) {
      console.error("⚠️ [SUBMIT] Metadata creation failed:", metadataError);
      // Don't return error here, analysis can still proceed
    } else {
      console.log("✅ [SUBMIT] Analysis metadata created");
    }

    // IMPROVED: Better background process handling
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";

    console.log("🚀 [SUBMIT] Triggering background analysis for ID:", analysisRequest.id);
    console.log("🔵 [SUBMIT] Using base URL:", baseUrl);

    // Don't await this, but handle it properly
    fetch(`${baseUrl}/api/analyze/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId: analysisRequest.id }),
    }).then(response => {
      console.log("✅ [SUBMIT] Background process triggered, status:", response.status);
      return response;
    }).catch(error => {
      console.error("🔴 [SUBMIT] Background process failed:", error);
      // Optional: Update the analysis request status to failed
      return supabase
        .from("analysis_requests")
        .update({ status: "failed", error_message: "Failed to trigger background analysis" })
        .eq("id", analysisRequest.id);
    });

    // Create the response
    const response = ApiResponses.success({
      id: analysisRequest.id,
      url: normalizedUrl,
      status: "pending",
      message: "Analysis started successfully",
    });

    console.log("✅ [SUBMIT] Returning success response for ID:", analysisRequest.id);
    console.log("🔵 [SUBMIT] Function ending at:", new Date().toISOString());

    return response;

  } catch (error) {
    console.error("🔴 [SUBMIT] Unexpected error:", error);
    console.error("🔴 [SUBMIT] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return ApiResponses.internalError("Internal server error");
  }
}

export const POST = withErrorHandling(handleSubmit);

export async function GET() {
  return ApiResponses.methodNotAllowed("Method not allowed");
}
