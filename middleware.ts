import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next();
  
  // Generate a nonce for inline scripts
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Enhanced security headers for A+ rating
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  
  // Cross-Origin headers for better security (less restrictive to avoid breaking functionality)
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Strict CSP without unsafe-inline and unsafe-eval
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Keep unsafe-inline only for styles as it's safer
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://www.google-analytics.com https://ssl.google-analytics.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://yfkvnfyzjjswtylulmvk.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Remove or restrict CORS for better security
  response.headers.delete('Access-Control-Allow-Origin');
  
  // Add the nonce to the response for use in scripts
  response.headers.set('X-Nonce', nonce);

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};