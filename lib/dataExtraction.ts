import puppeteer, { Browser, Page } from 'puppeteer';

// Function to handle cookie consent prompts
async function handleCookieConsent(page: Page): Promise<void> {
  try {
    // Wait a bit for any cookie banners to appear
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Common cookie consent button selectors (attribute-based)
    const consentSelectors = [
      'button[id*="accept"]',
      'button[class*="accept"]',
      'button[id*="consent"]',
      'button[class*="consent"]',
      'button[id*="agree"]',
      'button[class*="agree"]',
      'button[id*="allow"]',
      'button[class*="allow"]',
      'button[id*="cookie"]',
      'button[class*="cookie"]',
      '[data-testid*="accept"]',
      '[data-testid*="consent"]',
      '[data-testid*="agree"]',
      'a[id*="accept"]',
      'a[class*="accept"]',
      'a[id*="consent"]',
      'a[class*="consent"]',
      // Common frameworks
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
      '.cc-allow',
      '.cc-dismiss',
      '.cookie-accept',
      '.accept-cookies',
      '.gdpr-accept',
      '.consent-accept'
    ];
    
    // Try to find and click consent buttons by selector
    for (const selector of consentSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.isIntersectingViewport();
          if (isVisible) {
            await element.click();
            await new Promise(resolve => setTimeout(resolve, 1500));
            return; // Exit early if we found and clicked a button
          }
        }
      } catch {
        continue;
      }
    }
    
    // Try clicking elements with common consent text content
    const clicked = await page.evaluate(() => {
      const consentTexts = [
        'Accept', 'Accept All', 'Accept all', 'I Accept', 'Agree', 'I Agree', 
        'Allow All', 'Allow all', 'OK', 'Got it', 'Continue', 'Proceed',
        'Accept Cookies', 'Accept all cookies', 'Agree and continue',
        'Akzeptieren', 'Alle akzeptieren', 'Accepter', 'Accepter tout',
        'Aceptar', 'Aceptar todo', 'Accetta', 'Accetta tutto'
      ];
      
      for (const text of consentTexts) {
        const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"], [onclick]'));
        const matchingElement = elements.find(el => {
          const textContent = el.textContent?.trim() || '';
          return textContent.toLowerCase() === text.toLowerCase() ||
                 textContent.toLowerCase().includes(text.toLowerCase());
        });
        
        if (matchingElement && matchingElement instanceof HTMLElement) {
          const rect = matchingElement.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            matchingElement.click();
            return true;
          }
        }
      }
      return false;
    });
    
    if (clicked) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
  } catch (error) {
    // Silently continue if cookie consent handling fails
  }
}

export interface ExtractedData {
  url: string;
  html: string;
  screenshot: Buffer;
  metaTags: Record<string, string>;
  headings: { level: number; text: string; id?: string }[];
  images: { src: string; alt: string; width?: number; height?: number }[];
  links: { href: string; text: string; internal: boolean }[];
  cookies: { name: string; value: string; domain: string; httpOnly: boolean }[];
  scripts: string[];
  styles: string[];
  performance: {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint?: number;
  };
  viewport: { width: number; height: number };
  title: string;
  description: string;
  canonicalUrl?: string;
  lang?: string;
  charset?: string;
}

export interface ExtractionOptions {
  viewport?: { width: number; height: number };
  timeout?: number;
  waitForSelector?: string;
  userAgent?: string;
  fullPageScreenshot?: boolean;
}

class DataExtractionEngine {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async extractWebsiteData(
    url: string, 
    options: ExtractionOptions = {}
  ): Promise<ExtractedData> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const page = await this.browser.newPage();
    
    try {
      // Configure page
      const viewport = options.viewport || { width: 1920, height: 1080 };
      await page.setViewport(viewport);
      
      const userAgent = options.userAgent || 
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      await page.setUserAgent(userAgent);

      // Performance tracking
      const startTime = Date.now();
      let domContentLoadedTime = 0;

      // Listen for performance events
      page.on('domcontentloaded', () => {
        domContentLoadedTime = Date.now() - startTime;
      });

      // Navigate to the URL with reduced timeouts for faster processing
      let response;
      try {
        response = await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 20000  // Reduced from 45s to 20s
        });
      } catch {
        // Try with basic load as fallback (skip networkidle0 to avoid long waits)
        response = await page.goto(url, { 
          waitUntil: 'load',
          timeout: 15000  // Reduced from 30s to 15s
        });
      }

      if (!response || !response.ok()) {
        throw new Error(`Failed to load page: ${response?.status()} ${response?.statusText()}`);
      }

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 5000 }).catch(() => {
          // Selector not found, continuing...
        });
      }

      // Handle cookie consent prompts automatically
      await handleCookieConsent(page);

      const loadTime = Date.now() - startTime;

      // Get performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const paint = performance.getEntriesByType('paint');
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
        
        return {
          firstContentfulPaint: fcp?.startTime || 0
        };
      });

      // Extract all data in one evaluation for efficiency
      const extractedData = await page.evaluate((currentUrl: string) => {
        // Helper function to resolve relative URLs
        const resolveUrl = (url: string): string => {
          try {
            return new URL(url, currentUrl).href;
          } catch {
            return url;
          }
        };

        // Extract meta tags
        const metaTags: Record<string, string> = {};
        document.querySelectorAll('meta').forEach(meta => {
          const name = meta.getAttribute('name') || 
                      meta.getAttribute('property') || 
                      meta.getAttribute('http-equiv');
          const content = meta.getAttribute('content');
          if (name && content) {
            metaTags[name.toLowerCase()] = content;
          }
        });

        // Extract headings with hierarchy
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          .map(h => ({
            level: parseInt(h.tagName[1]),
            text: h.textContent?.trim() || '',
            id: h.id || undefined
          }))
          .filter(h => h.text.length > 0);

        // Extract images with dimensions
        const images = Array.from(document.querySelectorAll('img'))
          .map(img => ({
            src: resolveUrl(img.src),
            alt: img.alt || '',
            width: img.naturalWidth || undefined,
            height: img.naturalHeight || undefined
          }))
          .filter(img => img.src && !img.src.startsWith('data:'));

        // Extract links and categorize as internal/external
        const links = Array.from(document.querySelectorAll('a[href]'))
          .map(a => {
            const anchorElement = a as HTMLAnchorElement;
            const href = resolveUrl(anchorElement.href);
            const text = anchorElement.textContent?.trim() || '';
            const isInternal = href.startsWith(currentUrl) || 
                              href.startsWith('/') || 
                              !href.includes('://');
            
            return {
              href,
              text,
              internal: isInternal
            };
          })
          .filter(link => link.href && link.text);

        // Extract external scripts
        const scripts = Array.from(document.querySelectorAll('script[src]'))
          .map(script => resolveUrl(script.getAttribute('src') || ''))
          .filter(Boolean);

        // Extract external stylesheets
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map(link => resolveUrl(link.getAttribute('href') || ''))
          .filter(Boolean);

        // Extract basic page info
        const title = document.title || '';
        const description = metaTags['description'] || '';
        const canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        const canonicalUrl = canonicalElement?.href || undefined;
        const lang = document.documentElement.lang || undefined;
        const charset = document.characterSet || undefined;

        return {
          html: document.documentElement.outerHTML,
          metaTags,
          headings,
          images,
          links,
          scripts,
          styles,
          title,
          description,
          canonicalUrl: canonicalUrl ? resolveUrl(canonicalUrl) : undefined,
          lang,
          charset
        };
      }, url);

      // Take screenshot
      const screenshotBuffer = await page.screenshot({
        fullPage: options.fullPageScreenshot !== false,
        type: 'jpeg',
        quality: 80
      });
      const screenshot = Buffer.from(screenshotBuffer);

      // Get cookies
      const cookies = await page.cookies();

      return {
        url,
        ...extractedData,
        screenshot,
        cookies: cookies.map(cookie => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          httpOnly: cookie.httpOnly
        })),
        performance: {
          loadTime,
          domContentLoaded: domContentLoadedTime,
          firstContentfulPaint: performanceMetrics.firstContentfulPaint
        },
        viewport
      };

    } catch (error) {
      throw new Error(`Data extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton instance for reuse
let extractionEngine: DataExtractionEngine | null = null;

export async function extractWebsiteData(
  url: string, 
  options?: ExtractionOptions
): Promise<ExtractedData> {
  if (!extractionEngine) {
    extractionEngine = new DataExtractionEngine();
  }
  
  const maxRetries = 2;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {

      return await extractionEngine.extractWebsiteData(url, {
        ...options,
        timeout: attempt === 1 ? 45000 : 60000 // Increase timeout on retry
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw lastError || new Error('Data extraction failed after all retries');
}

export async function closeExtractionEngine(): Promise<void> {
  if (extractionEngine) {
    await extractionEngine.close();
    extractionEngine = null;
  }
}

// Utility function to validate URL
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// Utility function to normalize URL
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove trailing slash and fragments
    return urlObj.origin + urlObj.pathname.replace(/\/$/, '') + urlObj.search;
  } catch {
    return url;
  }
}