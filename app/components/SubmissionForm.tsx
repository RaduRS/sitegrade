"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackButtonClick } from "./Analytics";
import { Music, Instagram, Youtube, X } from "lucide-react";
import EmailCaptureModal from "./EmailCaptureModal";

interface SubmissionFormProps {
  placeholder?: string;
  buttonText?: string;
}

export default function SubmissionForm({
  placeholder = "Enter your website URL",
  buttonText = "Grade My Site",
}: SubmissionFormProps) {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submittedUrl, setSubmittedUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Focus error message when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get("url") as string;

    if (!url) return;

    setError(null);

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (including http:// or https://)");
      return;
    }

    // Show the email capture modal
    setSubmittedUrl(url);
    setShowModal(true);
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      // Submit to the new API endpoint
      const response = await fetch("/api/analyze/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: submittedUrl,
          email: email,
        }),
      });

      const result = await response.json();

      if (response.ok && result.id) {
        // Close modal and redirect to the report page immediately
        setShowModal(false);
        console.log("✅ Redirecting to report page:", `/report/${result.id}`);

        // Use Next.js router for reliable navigation
        router.push(`/report/${result.id}`);

        return; // Ensure we don't continue after redirect
      } else {
        setError(result.error || result.message || "Failed to submit website");
        setShowModal(false);
        setIsSubmitted(false); // Reset the submitted state
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("Something went wrong. Please try again.");
      setShowModal(false);
      setIsSubmitted(false); // Reset the submitted state
    }
  };

  const handleButtonClick = () => {
    trackButtonClick("grade_my_site", "hero_section");
  };

  // Success state - show confirmation message
  if (isSubmitted) {
    return (
      <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
        <div className="text-center p-8 bg-slate-800 rounded-lg border border-slate-700">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-green-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="heading-md text-white mb-2 font-retro">
            We Got Your Site! 🎉
          </h3>
          <p className="text-slate-300 mb-6">
            Your website has been submitted for review. Keep an eye out on our
            socials for our professional review!
          </p>
          <div className="flex justify-center items-center gap-4 mb-4">
            <a
              href="https://www.tiktok.com/@sitegradeuk"
              className="hover:text-amber-400 transition-colors p-3 bg-slate-700 rounded-lg hover:bg-slate-600"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on TikTok"
            >
              <Music className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/sitegradeuk/"
              className="hover:text-amber-400 transition-colors p-3 bg-slate-700 rounded-lg hover:bg-slate-600"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://www.youtube.com/@sitegradeuk"
              className="hover:text-amber-400 transition-colors p-3 bg-slate-700 rounded-lg hover:bg-slate-600"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on YouTube"
            >
              <Youtube className="w-6 h-6" />
            </a>
            <a
              href="https://x.com/sitegradeuk"
              className="hover:text-amber-400 transition-colors p-3 bg-slate-700 rounded-lg hover:bg-slate-600"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on X"
            >
              <X className="w-6 h-6" />
            </a>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setError(null);
              // Focus the input when returning to form
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }, 100);
            }}
            className="text-yellow-400 hover:text-yellow-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
          >
            Submit Another Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Website submission form"
        >
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-center">
            <label htmlFor="website-url" className="sr-only">
              Website URL to review
            </label>
            <input
              ref={inputRef}
              id="website-url"
              type="url"
              name="url"
              placeholder={placeholder}
              className="retro-input flex-1 w-full sm:w-auto min-w-0 px-4 sm:px-6"
              required
              aria-describedby={
                error
                  ? "url-help url-error public-notice"
                  : "url-help public-notice"
              }
              aria-invalid={error ? "true" : "false"}
              autoComplete="url"
            />
            <div id="url-help" className="sr-only">
              Enter the full URL of your website including https://
            </div>
            <button
              type="submit"
              className="button-3d w-full sm:w-auto shrink-0"
              aria-label="Submit website for grading"
              onClick={handleButtonClick}
            >
              <span className="button_top">{buttonText}</span>
            </button>
          </div>

          {/* Public Review Notice */}
          <div id="public-notice" className="mt-3 text-center">
            <p className="text-slate-400 text-xs">
              Reviews may be featured in our educational content on social
              media. By submitting, you agree to our{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline"
              >
                Terms
              </a>{" "}
              &{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {error && (
            <div
              ref={errorRef}
              id="url-error"
              className={`mt-4 p-3 border rounded text-sm text-center ${
                error === "DUPLICATE_SUBMISSION"
                  ? "bg-blue-900/50 border-blue-700 text-blue-300"
                  : "bg-red-900/50 border-red-700 text-red-300"
              }`}
              role="alert"
              aria-live="assertive"
              tabIndex={-1}
            >
              {error === "DUPLICATE_SUBMISSION" ? (
                <div>
                  <p className="mb-4">
                    This website has already been submitted and is in our review
                    queue. No need to submit it again! Keep an eye out on our
                    socials for your review.
                  </p>
                  <div className="flex justify-center items-center gap-4">
                    <a
                      href="https://www.tiktok.com/@sitegradeuk"
                      className="hover:text-amber-400 transition-colors p-2 bg-slate-700 rounded-lg hover:bg-slate-600"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow us on TikTok"
                    >
                      <Music className="w-5 h-5" />
                    </a>
                    <a
                      href="https://www.instagram.com/sitegradeuk/"
                      className="hover:text-amber-400 transition-colors p-2 bg-slate-700 rounded-lg hover:bg-slate-600"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow us on Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a
                      href="https://www.youtube.com/@sitegradeuk"
                      className="hover:text-amber-400 transition-colors p-2 bg-slate-700 rounded-lg hover:bg-slate-600"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow us on YouTube"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                    <a
                      href="https://x.com/sitegradeuk"
                      className="hover:text-amber-400 transition-colors p-2 bg-slate-700 rounded-lg hover:bg-slate-600"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow us on X"
                    >
                      <X className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ) : error.includes("<a href=") ? (
                <div dangerouslySetInnerHTML={{ __html: error }} />
              ) : (
                error
              )}
            </div>
          )}
        </form>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        websiteUrl={submittedUrl}
        onSubmit={handleEmailSubmit}
      />
    </>
  );
}
