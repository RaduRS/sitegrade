import { NextRequest } from "next/server";
import { ApiResponses, withErrorHandling } from "@/lib/apiUtils";

async function handleDebugTrigger(request: NextRequest) {
  const body = await request.json();
  const { requestId } = body;

  if (!requestId) {
    return ApiResponses.badRequest("Request ID is required");
  }

  console.log(`🧪 DEBUG: Manually triggering analysis for ${requestId}`);

  // Trigger the process endpoint
  const processUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }/api/analyze/process`;

  try {
    const response = await fetch(processUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId }),
    });

    const responseText = await response.text();

    console.log(`🧪 DEBUG: Process response status: ${response.status}`);
    console.log(`🧪 DEBUG: Process response body: ${responseText}`);

    return ApiResponses.success({
      triggered: true,
      processResponse: {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      },
    });
  } catch (error) {
    console.error(`🧪 DEBUG: Error triggering process:`, error);
    return ApiResponses.internalError(`Failed to trigger: ${error}`);
  }
}

export const POST = withErrorHandling(handleDebugTrigger);
