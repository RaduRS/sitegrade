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

  // Trigger background analysis - Use direct import instead of fetch for better Vercel compatibility
  console.log(`🚀 Triggering analysis for request ${analysisRequest.id}`);
  console.log(`[DEBUG] Attempting to dynamically import process module for request ${analysisRequest.id}`);
  
  // Import and call the process function directly to avoid Vercel fetch issues
  import("../process/route").then(async (processModule) => {
    console.log(`[DEBUG] Successfully imported process module for request ${analysisRequest.id}`);
    try {
      const mockRequest = {
        json: async () => ({ requestId: analysisRequest.id })
      } as NextRequest;
      
      console.log(`[DEBUG] Calling processModule.POST for request ${analysisRequest.id}`);
      await processModule.POST(mockRequest);
      console.log(`✅ Analysis triggered successfully for request ${analysisRequest.id}`);
    } catch (error) {
      console.error("❌ Failed to trigger background analysis (inside .then block):", error);
      console.error("❌ Request ID:", analysisRequest.id);
    }
  }).catch((error) => {
    console.error("❌ Failed to import process module (top-level catch):", error);
    console.error("❌ Request ID:", analysisRequest.id);
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
