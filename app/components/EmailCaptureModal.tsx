"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Mail, Loader2 } from "lucide-react";
import { trackFormSubmission } from "./Analytics";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteUrl: string;
  onSubmit: (email: string) => void;
}

export default function EmailCaptureModal({
  isOpen,
  onClose,
  websiteUrl,
  onSubmit,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle modal close with state reset
  const handleClose = useCallback(() => {
    setEmail("");
    setIsSubmitting(false);
    setError(null);
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Track the form submission
      trackFormSubmission(websiteUrl);

      // Call the parent's onSubmit function
      await onSubmit(email);

      // If we reach here, the submission was successful
      // The parent will handle closing the modal and redirecting
      setIsSubmitting(false); // Stop loading state on success
    } catch (error) {
      console.error("Email submission error:", error);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2
            id="modal-title"
            className="heading-md text-white mb-2 font-retro"
          >
            Your Report is Being Generated! 🚀
          </h2>
          <p className="text-slate-300 text-sm">
            Enter your email below to view your report and receive a copy in
            your inbox.
          </p>
        </div>

        {/* Website URL display */}
        <div className="bg-slate-700 rounded-lg p-3 mb-4">
          <p className="text-slate-400 text-xs mb-1">Analyzing:</p>
          <p className="text-white text-sm font-mono break-all">{websiteUrl}</p>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-input" className="sr-only">
              Email address
            </label>
            <input
              ref={emailInputRef}
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Enter your email address"
              className="retro-input w-full px-4 py-3"
              required
              disabled={isSubmitting}
              aria-describedby={error ? "email-error" : undefined}
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          {error && (
            <div
              id="email-error"
              className="text-red-300 text-sm bg-red-900/50 border border-red-700 rounded p-2"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="button-3d w-full"
          >
            <span className="button_top flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                "See My Report"
              )}
            </span>
          </button>
        </form>

        {/* Privacy notice */}
        <p className="text-slate-400 text-xs text-center mt-4">
          By submitting, you agree to our{" "}
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
    </div>
  );
}
