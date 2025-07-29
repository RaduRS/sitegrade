import { trackFormSubmission, trackButtonClick } from './Analytics';

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;
    if (url) {
      trackFormSubmission(url);
      if (onSubmit) {
        onSubmit(url);
      }
    }
  };

  const handleButtonClick = () => {
    trackButtonClick('grade_my_site', 'hero_section');
  };

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
      </form>
    </div>
  );
}