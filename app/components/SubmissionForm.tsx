import { useState } from 'react';
import { trackFormSubmission, trackButtonClick } from './Analytics';
import { submitWebsite } from '../lib/supabase';

interface SubmissionFormProps {
  onSubmit?: (url: string) => void;
  placeholder?: string;
  buttonText?: string;
}

export default function SubmissionForm({ 
  onSubmit, 
  placeholder = "Enter your website URL",
  buttonText = "Grade My Site"
}: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;
    
    if (!url) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Track the form submission
      trackFormSubmission(url);
      
      // Submit to Supabase
      const result = await submitWebsite(url);
      
      if (result.success) {
        setIsSubmitted(true);
        if (onSubmit) {
          onSubmit(url);
        }
      } else {
        setError(result.error || 'Failed to submit website');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    trackButtonClick('grade_my_site', 'hero_section');
  };

  // Success state - show confirmation message
  if (isSubmitted) {
    return (
      <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
        <div className="text-center p-8 bg-slate-800 rounded-lg border border-slate-700">
          <div className="mb-4">
            <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">We Got Your Site! 🎉</h3>
          <p className="text-slate-300 mb-4">
            Your website has been submitted for review. Keep an eye out on our{' '}
            <a 
              href="https://www.tiktok.com/@sitegrade" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              TikTok @sitegrade
            </a>{' '}
            for your professional review!
          </p>
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setError(null);
            }}
            className="text-yellow-400 hover:text-yellow-300 transition-colors underline"
          >
            Submit Another Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      <form onSubmit={handleSubmit} role="search">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-center">
          <label htmlFor="website-url" className="sr-only">
            Website URL to review
          </label>
          <input
            id="website-url"
            type="url"
            name="url"
            placeholder={placeholder}
            className="retro-input flex-1 w-full sm:w-auto min-w-0 px-4 sm:px-6"
            required
            aria-describedby="url-help"
            autoComplete="url"
            disabled={isSubmitting}
          />
          <div id="url-help" className="sr-only">
            Enter the full URL of your website including https://
          </div>
          <button 
            type="submit" 
            className="button-3d w-full sm:w-auto shrink-0" 
            aria-label="Submit website for grading"
            onClick={handleButtonClick}
            disabled={isSubmitting}
          >
            <span className="button_top">
              {isSubmitting ? 'Submitting...' : buttonText}
            </span>
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm text-center">
            {error.includes('<a href=') ? (
              <div dangerouslySetInnerHTML={{ __html: error }} />
            ) : (
              error
            )}
          </div>
        )}
      </form>
    </div>
  );
}