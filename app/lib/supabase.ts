import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Rate limiting - simple client-side protection
const RATE_LIMIT_KEY = "sitegrade_last_submission";
const RATE_LIMIT_MINUTES = 1; // 1 minutes between submissions

function checkRateLimit(): { allowed: boolean; timeLeft?: number } {
  const lastSubmission = localStorage.getItem(RATE_LIMIT_KEY);
  if (!lastSubmission) return { allowed: true };

  const lastTime = parseInt(lastSubmission);
  const now = Date.now();
  const timeDiff = now - lastTime;
  const rateLimit = RATE_LIMIT_MINUTES * 60 * 1000; // Convert to milliseconds

  if (timeDiff < rateLimit) {
    const timeLeft = Math.ceil((rateLimit - timeDiff) / 1000 / 60); // Minutes left
    return { allowed: false, timeLeft };
  }

  return { allowed: true };
}

function setRateLimit(): void {
  localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
}

// Database types
export interface WebsiteSubmission {
  id?: number;
  website_url: string;
  is_reviewed: boolean;
  created_at?: string;
}

// Validate URL format and domain
function isValidWebsiteUrl(url: string): boolean {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);

    // Basic domain validation
    const domain = urlObj.hostname.toLowerCase();

    // Block obvious spam/invalid domains
    const blockedPatterns = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "example.com",
      "test.com",
      "spam",
      "xxx",
      "porn",
    ];

    if (blockedPatterns.some((pattern) => domain.includes(pattern))) {
      return false;
    }

    // Must have valid TLD
    if (!domain.includes(".") || domain.endsWith(".")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Normalize URL for consistent comparison
function normalizeUrl(url: string): string {
  try {
    // Add protocol if missing
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(urlWithProtocol);

    // Normalize: remove www, trailing slash, convert to lowercase
    let hostname = urlObj.hostname.toLowerCase();
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }

    // Remove trailing slash from pathname
    let pathname = urlObj.pathname;
    if (pathname.endsWith("/") && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }

    return `https://${hostname}${pathname}${urlObj.search}${urlObj.hash}`;
  } catch {
    return url;
  }
}

// Submit a website for review
export async function submitWebsite(
  websiteUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check rate limiting first
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Please wait ${rateCheck.timeLeft} minutes before submitting another website`,
      };
    }

    // Validate URL first
    if (!isValidWebsiteUrl(websiteUrl)) {
      return { success: false, error: "Please enter a valid website URL" };
    }

    // Normalize URL for consistent comparison
    const normalizedUrl = normalizeUrl(websiteUrl);

    // Add a simple honeypot check (detect automated submissions)
    const userAgent = navigator.userAgent;
    if (!userAgent || userAgent.length < 10) {
      return { success: false, error: "Invalid request" };
    }

    const { error } = await supabase
      .from("website_submissions")
      .insert([
        {
          website_url: normalizedUrl,
          is_reviewed: false,
        },
      ])
      .select();

    if (error) {
      // Handle duplicate constraint violation with a nice message
      // Check error message, code, and details for duplicate indicators
      const errorMessage = error.message?.toLowerCase() || "";
      const errorCode = String(error.code || "").toLowerCase();
      const errorDetails = error.details?.toLowerCase() || "";

      const isDuplicateError =
        errorMessage.includes(
          "duplicate key value violates unique constraint"
        ) ||
        errorMessage.includes("unique_website_url") ||
        errorMessage.includes("duplicate") ||
        errorMessage.includes("unique") ||
        errorCode === "23505" || // PostgreSQL unique constraint violation code
        errorCode.includes("23505") ||
        errorDetails.includes("duplicate") ||
        errorDetails.includes("unique") ||
        errorDetails.includes("already exists");

      if (isDuplicateError) {
        return {
          success: false,
          error: 'This website has already been submitted and is in our review queue. No need to submit it again! Keep an eye out on our <a href="https://www.tiktok.com/@sitegrade" target="_blank" rel="noopener noreferrer" class="text-yellow-400 hover:text-yellow-300 underline">TikTok @sitegrade</a> for your review.',
        };
      }

      return {
        success: false,
        error: "Failed to submit website. Please try again.",
      };
    }

    // Set rate limit after successful submission
    setRateLimit();

    return { success: true };
  } catch (error) {
    console.error("Submit website error:", error);

    // Also check for duplicate errors in the catch block
    const errorString = String(error).toLowerCase();
    if (
      errorString.includes("duplicate") ||
      errorString.includes("unique") ||
      errorString.includes("23505")
    ) {
      return {
        success: false,
        error:
          "🎯 Good news! This website is already in our review queue. We'll get to it soon!",
      };
    }

    return {
      success: false,
      error: "Failed to submit website. Please try again.",
    };
  }
}
