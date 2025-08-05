import { scoreToGrade, getGradeDescription, calculateOverallGrade } from './gradeUtils';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface AnalysisEmailData {
  url: string;
  email: string;
  requestId: string;
  overallScore: number;
  pillars: {
    [key: string]: {
      score: number;
      analyzed: boolean;
      grade?: string; // For performance pillar
      insights?: string;
      recommendations?: string[];
    };
  };
  reportUrl?: string;
  analysisDate: string;
}

export interface EmailService {
  sendEmail(to: string, template: EmailTemplate): Promise<boolean>;
}

class ResendEmailService implements EmailService {
  private readonly apiKey: string;
  private readonly fromEmail: string;

  constructor(apiKey?: string, fromEmail?: string) {
    this.apiKey = apiKey || process.env.RESEND_API_KEY || '';
    this.fromEmail = fromEmail || process.env.FROM_EMAIL || 'hello@sitegrade.co.uk';
    
    if (!this.apiKey) {
      throw new Error('Resend API key is required');
    }
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Email send failed: ${response.status} - ${errorText}`);
        
        // In development mode, don't fail for domain verification issues
        if (process.env.NODE_ENV === 'development' && errorText.includes('domain is not verified')) {
          console.log(`✅ Email send simulated success (development mode)`);
          return true; // Return success in development
        }
        
        return false;
      }

      const result = await response.json();
      return true;

    } catch (error) {
      console.log(`❌ Email send error:`, error);
      // In development mode, don't fail completely
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Email send simulated success (development mode)`);
        return true;
      }
      
      return false;
    }
  }
}

// Fallback console email service for development
class ConsoleEmailService implements EmailService {
  async sendEmail(_to: string, _template: EmailTemplate): Promise<boolean> {
    return true;
  }
}

function getGradeEmoji(grade: string): string {
  switch (grade) {
    case 'A+':
    case 'A':
      return '🏆';
    case 'A-':
    case 'B+':
    case 'B':
      return '🎉';
    case 'B-':
    case 'C+':
    case 'C':
      return '👍';
    case 'C-':
    case 'D+':
    case 'D':
    case 'D-':
      return '⚠️';
    case 'F':
      return '🔧';
    default:
      return '⚠️';
  }
}

class EmailTemplateGenerator {
  generateAnalysisCompleteTemplate(data: AnalysisEmailData): EmailTemplate {
    // Calculate overall grade from analyzed pillars, same as UI
    const scores = Object.values(data.pillars)
      .filter(pillar => pillar.analyzed)
      .map(pillar => pillar.score);
    
    const overallGrade = scores.length > 0 ? calculateOverallGrade(scores) : scoreToGrade(data.overallScore);
    const subject = `Your SiteGrade Report is Ready - Grade ${overallGrade}`;

    const pillarRows = Object.entries(data.pillars)
      .filter(([, pillar]) => pillar.analyzed)
      .map(([name, pillar]) => {
        const grade = scoreToGrade(pillar.score);
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">${name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: bold;">
              ${grade}
            </td>
          </tr>
        `;
      }).join('');

    const html = `
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 48px;">${getGradeEmoji(overallGrade)}</h1>
          <div style="color: white; font-weight: bold; font-size: 24px; margin: 10px 0 5px 0;">${overallGrade}</div>
          <p style="color: white; font-weight: bold; font-size: 18px; margin: 0;">${getGradeDescription(overallGrade)}</p>
        </div>
        <div style="padding: 30px 20px;">
          <p>Hi there!</p>
          <p>We've completed the analysis of your website:</p>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; margin: 20px 0;">${data.url}</div>
          
          <h3>Your Scores</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr>
                <th style="background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600;">Pillar</th>
                <th style="text-align: center; background: #f8f9fa; padding: 12px; font-weight: 600;">Score</th>
              </tr>
            </thead>
            <tbody>
              ${pillarRows}
            </tbody>
          </table>

          ${data.reportUrl ? `
            <div style="background: #f0f9ff; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <strong>Detailed Report Available</strong><br>
              <a href="${data.reportUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">View Full Report</a>
            </div>
          ` : ''}

          <div style="background: #f0f9ff; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <strong>What's Next?</strong><br>
            ${(() => {
              const pillarRecommendations = Object.entries(data.pillars)
                .filter(([, pillar]) => pillar.analyzed && pillar.recommendations && pillar.recommendations.length > 0)
                .map(([name, pillar]) => {
                  const grade = scoreToGrade(pillar.score);
                  const allRecommendations = pillar.recommendations!; // Show all recommendations
                  return `
                    <div style="margin: 15px 0;">
                      <strong style="text-transform: capitalize;">${name} (${grade}):</strong>
                      <ul style="margin: 5px 0 0 20px; padding: 0;">
                        ${allRecommendations.map(rec => `<li style="margin: 3px 0;">${rec}</li>`).join('')}
                      </ul>
                    </div>
                  `;
                }).join('');
              
              return pillarRecommendations || 'Review your detailed analysis and implement the recommended improvements to boost your website\'s performance and user experience.';
            })()}
          </div>

          <p>Analysis completed on: ${data.analysisDate}</p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
          <p>SiteGrade - Professional Website Analysis</p>
        </div>
      </div>
    `;

    const pillarText = Object.entries(data.pillars)
      .filter(([, pillar]) => pillar.analyzed)
      .map(([name, pillar]) => {
        const grade = scoreToGrade(pillar.score);
        return `${name}: ${grade}`;
      })
      .join('\n');

    const text = `
SiteGrade Analysis Complete - Grade ${overallGrade}

Hi there!

We've completed the analysis of your website: ${data.url}

Your Grades:
${pillarText}

Overall Grade: ${overallGrade}

${data.reportUrl ? `View Full Report: ${data.reportUrl}` : ''}

Analysis completed on: ${data.analysisDate}

SiteGrade - Professional Website Analysis
    `;

    return { subject, html, text };
  }

  generateAnalysisFailedTemplate(url: string, error: string): EmailTemplate {
    const subject = `SiteGrade Analysis Failed for ${url}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Analysis Failed</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: #ef4444; color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
            .url { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
            .error { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Analysis Failed</h1>
              <p>We encountered an issue analyzing your website</p>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>Unfortunately, we encountered an issue while analyzing your website:</p>
              <div class="url">${url}</div>
              
              <div class="error">
                <strong>Error Details:</strong><br>
                ${error}
              </div>

              <p><strong>Common causes and solutions:</strong></p>
              <ul>
                <li>Website is temporarily unavailable - please try again later</li>
                <li>Website blocks automated access - check robots.txt</li>
                <li>Invalid URL format - ensure URL includes http:// or https://</li>
                <li>Website requires authentication - public access needed for analysis</li>
              </ul>

              <p>You can try submitting your website again, or contact our support team if the issue persists.</p>
              
              <a href="https://sitegrade.co.uk/" class="button">Try Again</a>
            </div>
            <div class="footer">
              <p>SiteGrade - Professional Website Analysis</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
SiteGrade Analysis Failed

Hi there!

Unfortunately, we encountered an issue while analyzing your website: ${url}

Error Details: ${error}

Common causes and solutions:
- Website is temporarily unavailable - please try again later
- Website blocks automated access - check robots.txt  
- Invalid URL format - ensure URL includes http:// or https://
- Website requires authentication - public access needed for analysis

You can try submitting your website again, or contact our support team if the issue persists.

SiteGrade - Professional Website Analysis
    `;

    return { subject, html, text };
  }
}

// Email service factory
export function createEmailService(): EmailService {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (resendApiKey) {
    return new ResendEmailService(resendApiKey);
  } else {
    return new ConsoleEmailService();
  }
}

// Template generator singleton
let templateGenerator: EmailTemplateGenerator | null = null;

export function getEmailTemplateGenerator(): EmailTemplateGenerator {
  if (!templateGenerator) {
    templateGenerator = new EmailTemplateGenerator();
  }
  return templateGenerator;
}

// Convenience functions
export async function sendAnalysisCompleteEmail(data: AnalysisEmailData): Promise<boolean> {
  const emailService = createEmailService();
  const templateGenerator = getEmailTemplateGenerator();
  const template = templateGenerator.generateAnalysisCompleteTemplate(data);
  
  return emailService.sendEmail(data.email, template);
}

export async function sendAnalysisFailedEmail(url: string, email: string, error: string): Promise<boolean> {
  const emailService = createEmailService();
  const templateGenerator = getEmailTemplateGenerator();
  const template = templateGenerator.generateAnalysisFailedTemplate(url, error);
  
  return emailService.sendEmail(email, template);
}