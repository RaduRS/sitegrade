interface ExtractedDataForSEO {
  title: string;
  description: string;
  headings: Array<{ level: number; text: string; id?: string }>;
  images: Array<{ src: string; alt: string; width?: number; height?: number }>;
  url?: string;
  html?: string;
}

interface SEOAnalysisResult {
  score: number;
  insights: string;
  recommendations: string[];
  issues: string[];
  analyzed: boolean;
}

export async function analyzeSEO(extractedData: ExtractedDataForSEO): Promise<SEOAnalysisResult> {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];
  const url = extractedData.url;

  try {
    // Check title
    if (!extractedData.title) {
      score -= 20;
      issues.push('Missing page title');
      recommendations.push('Add a descriptive page title');
    } else if (extractedData.title.length < 30 || extractedData.title.length > 60) {
      score -= 10;
      issues.push('Title length not optimal (30-60 characters recommended)');
      recommendations.push('Optimize title length to 30-60 characters');
    }

    // Check meta description
    if (!extractedData.description) {
      score -= 15;
      issues.push('Missing meta description');
      recommendations.push('Add a compelling meta description');
    } else if (extractedData.description.length < 120 || extractedData.description.length > 160) {
      score -= 8;
      issues.push('Meta description length not optimal (120-160 characters recommended)');
      recommendations.push('Optimize meta description length to 120-160 characters');
    }

    // Check headings structure
    const h1Count = extractedData.headings.filter((h) => h.level === 1).length;
    if (h1Count === 0) {
      score -= 15;
      issues.push('Missing H1 heading');
      recommendations.push('Add a clear H1 heading to your page');
    } else if (h1Count > 1) {
      score -= 10;
      issues.push('Multiple H1 headings found');
      recommendations.push('Use only one H1 heading per page');
    }

    // Check images alt text
    const imagesWithoutAlt = extractedData.images.filter((img) => !img.alt).length;
    if (imagesWithoutAlt > 0) {
      score -= Math.min(20, imagesWithoutAlt * 2);
      issues.push(`${imagesWithoutAlt} images missing alt text`);
      recommendations.push('Add descriptive alt text to all images');
    }

    // Advanced SEO checks if URL and HTML are available
    if (url && extractedData.html) {
      await performAdvancedSEOChecks(url, extractedData.html, score, issues, recommendations);
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    const insights = generateSEOInsights(score, issues);

    return {
      score,
      insights,
      recommendations,
      issues,
      analyzed: true
    };

  } catch (error) {
    console.error('SEO analysis error:', error);
    return {
      score: 0,
      insights: 'SEO analysis failed due to an error',
      recommendations: ['Please try again later'],
      issues: ['Analysis error occurred'],
      analyzed: false
    };
  }
}

async function performAdvancedSEOChecks(
  url: string, 
  html: string, 
  score: number, 
  issues: string[], 
  recommendations: string[]
): Promise<void> {
  // Check robots.txt
  const robotsUrl = new URL('/robots.txt', url).toString();
  try {
    const robotsResponse = await fetch(robotsUrl);
    if (!robotsResponse.ok) {
      score -= 10;
      issues.push('Missing robots.txt file');
      recommendations.push('Create a robots.txt file to guide search engine crawlers');
    }
  } catch {
    score -= 10;
    issues.push('Missing robots.txt file');
    recommendations.push('Create a robots.txt file to guide search engine crawlers');
  }

  // Check for canonical tag
  if (!html.includes('<link rel="canonical"')) {
    score -= 12;
    issues.push('Missing canonical tag');
    recommendations.push('Add canonical tags to prevent duplicate content issues');
  }

  // Check for Open Graph tags
  const hasOgTitle = html.includes('property="og:title"');
  const hasOgDescription = html.includes('property="og:description"');
  const hasOgImage = html.includes('property="og:image"');
  const hasOgUrl = html.includes('property="og:url"');

  if (!hasOgTitle || !hasOgDescription || !hasOgImage || !hasOgUrl) {
    score -= 8;
    issues.push('Incomplete Open Graph metadata');
    recommendations.push('Add complete Open Graph tags for better social media sharing');
  }

  // Check for Twitter Card tags
  const hasTwitterCard = html.includes('name="twitter:card"');
  const hasTwitterTitle = html.includes('name="twitter:title"');
  const hasTwitterDescription = html.includes('name="twitter:description"');

  if (!hasTwitterCard || !hasTwitterTitle || !hasTwitterDescription) {
    score -= 6;
    issues.push('Missing Twitter Card metadata');
    recommendations.push('Add Twitter Card tags for better Twitter sharing');
  }

  // Check for structured data
  const hasStructuredData = html.includes('application/ld+json') || 
                           html.includes('itemscope') || 
                           html.includes('microdata');
  
  if (!hasStructuredData) {
    score -= 10;
    issues.push('Missing structured data');
    recommendations.push('Add structured data (JSON-LD) to help search engines understand your content');
  }

  // Check for sitemap
  const sitemapUrl = new URL('/sitemap.xml', url).toString();
  try {
    const sitemapResponse = await fetch(sitemapUrl);
    if (!sitemapResponse.ok) {
      score -= 8;
      issues.push('Missing sitemap.xml');
      recommendations.push('Create and submit a sitemap.xml to help search engines index your site');
    }
  } catch {
    score -= 8;
    issues.push('Missing sitemap.xml');
    recommendations.push('Create and submit a sitemap.xml to help search engines index your site');
  }
}

function generateSEOInsights(score: number, issues: string[]): string {
  if (score >= 90) {
    return 'Excellent SEO optimization! Your website follows most SEO best practices.';
  } else if (score >= 75) {
    return 'Good SEO foundation with room for improvement. Address the identified issues to boost your search rankings.';
  } else if (score >= 60) {
    return 'Moderate SEO optimization. Several important SEO elements need attention to improve search visibility.';
  } else if (score >= 40) {
    return 'Poor SEO optimization. Many critical SEO elements are missing, significantly impacting search rankings.';
  } else {
    return 'Very poor SEO optimization. Major SEO improvements needed to achieve any search visibility.';
  }
}