interface SecurityAnalysisResult {
  score: number;
  insights: string;
  recommendations: string[];
  issues: string[];
  analyzed: boolean;
  certificates?: {
    valid: boolean;
    issuer?: string;
    expiresAt?: string;
  };
  headers?: {
    [key: string]: string | boolean;
  };
}

export async function analyzeSecurity(url: string): Promise<SecurityAnalysisResult> {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];
  let certificates;
  let headers: Record<string, string> = {};

  try {
    // Check HTTPS
    if (!url.startsWith('https://')) {
      score -= 30;
      issues.push('Website not using HTTPS');
      recommendations.push('Implement SSL/TLS certificate and redirect HTTP to HTTPS');
    }

    // Fetch the page to check security headers
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'SiteGrade-Security-Analyzer/1.0'
      }
    });

    headers = Object.fromEntries(response.headers.entries());

    // Check security headers
    const securityChecks = [
      {
        header: 'strict-transport-security',
        name: 'HSTS (HTTP Strict Transport Security)',
        points: 15,
        recommendation: 'Add HSTS header to prevent protocol downgrade attacks'
      },
      {
        header: 'x-frame-options',
        name: 'X-Frame-Options',
        points: 10,
        recommendation: 'Add X-Frame-Options header to prevent clickjacking attacks'
      },
      {
        header: 'x-content-type-options',
        name: 'X-Content-Type-Options',
        points: 8,
        recommendation: 'Add X-Content-Type-Options: nosniff header to prevent MIME type sniffing'
      },
      {
        header: 'x-xss-protection',
        name: 'X-XSS-Protection',
        points: 8,
        recommendation: 'Add X-XSS-Protection header to enable XSS filtering'
      },
      {
        header: 'content-security-policy',
        name: 'Content Security Policy (CSP)',
        points: 20,
        recommendation: 'Implement Content Security Policy to prevent XSS and injection attacks'
      },
      {
        header: 'referrer-policy',
        name: 'Referrer Policy',
        points: 5,
        recommendation: 'Add Referrer-Policy header to control referrer information'
      }
    ];

    securityChecks.forEach(check => {
      if (!headers[check.header] && !headers[check.header.toLowerCase()]) {
        score -= check.points;
        issues.push(`Missing ${check.name} header`);
        recommendations.push(check.recommendation);
      }
    });

    // Check for server information disclosure
    const serverHeader = headers['server'] || headers['Server'];
    if (serverHeader && !serverHeader.includes('cloudflare')) {
      score -= 5;
      issues.push('Server information disclosed in headers');
      recommendations.push('Hide or minimize server information in response headers');
    }

    // Check for powered-by headers
    const poweredBy = headers['x-powered-by'] || headers['X-Powered-By'];
    if (poweredBy) {
      score -= 5;
      issues.push('Technology stack disclosed in headers');
      recommendations.push('Remove X-Powered-By header to avoid technology disclosure');
    }

    // Additional security checks for HTTPS sites
    if (url.startsWith('https://')) {
      try {
        // Note: In a real implementation, you'd use a proper SSL checker
        // For now, we'll do basic certificate validation through the response
        certificates = {
          valid: response.ok,
          issuer: 'Certificate validation requires specialized tools',
          expiresAt: 'Certificate expiration requires specialized tools'
        };
      } catch (error) {
        score -= 10;
        issues.push('SSL certificate validation failed');
        recommendations.push('Ensure SSL certificate is valid and properly configured');
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    const insights = generateSecurityInsights(score, issues);

    return {
      score,
      insights,
      recommendations,
      issues,
      analyzed: true,
      certificates,
      headers: {
        hasHSTS: !!(headers['strict-transport-security'] || headers['Strict-Transport-Security']),
        hasXFrameOptions: !!(headers['x-frame-options'] || headers['X-Frame-Options']),
        hasXContentTypeOptions: !!(headers['x-content-type-options'] || headers['X-Content-Type-Options']),
        hasXXSSProtection: !!(headers['x-xss-protection'] || headers['X-XSS-Protection']),
        hasCSP: !!(headers['content-security-policy'] || headers['Content-Security-Policy']),
        hasReferrerPolicy: !!(headers['referrer-policy'] || headers['Referrer-Policy'])
      }
    };

  } catch (error) {
    console.error('Security analysis error:', error);
    return {
      score: 0,
      insights: 'Security analysis failed due to an error',
      recommendations: ['Please try again later'],
      issues: ['Analysis error occurred'],
      analyzed: false
    };
  }
}

function generateSecurityInsights(score: number, issues: string[]): string {
  if (score >= 90) {
    return 'Excellent security configuration! Your website implements most security best practices.';
  } else if (score >= 75) {
    return 'Good security foundation with minor improvements needed. Address the identified issues to enhance protection.';
  } else if (score >= 60) {
    return 'Moderate security implementation. Several important security headers and practices need attention.';
  } else if (score >= 40) {
    return 'Poor security configuration. Many critical security measures are missing, leaving your site vulnerable.';
  } else {
    return 'Very poor security implementation. Major security improvements needed to protect against common attacks.';
  }
}