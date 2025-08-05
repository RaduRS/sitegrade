import { NextResponse } from 'next/server';

// Common API response utilities to improve DRY principles
export const ApiResponses = {
  success: (data: unknown, status = 200) => 
    NextResponse.json(data, { status }),

  error: (message: string, status = 500) => 
    NextResponse.json({ error: message }, { status }),

  notFound: (message = 'Resource not found') => 
    NextResponse.json({ error: message }, { status: 404 }),

  badRequest: (message = 'Bad request') => 
    NextResponse.json({ error: message }, { status: 400 }),

  methodNotAllowed: (message = 'Method not allowed') => 
    NextResponse.json({ error: message }, { status: 405 }),

  tooManyRequests: (message = 'Too many requests') => 
    NextResponse.json({ error: message }, { status: 429 }),

  internalError: (message = 'Internal server error') => 
    NextResponse.json({ error: message }, { status: 500 })
};

// Common validation utilities
export const Validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  required: (value: unknown, fieldName: string): string | null => {
    if (!value) {
      return `${fieldName} is required`;
    }
    return null;
  },

  url: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
};

// Error handling wrapper for API routes
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch {
      return ApiResponses.internalError();
    }
  };
}

// Database operation utilities
export const DatabaseUtils = {
  handleSupabaseError: (error: unknown, operation: string) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Database ${operation} failed:`, message);
    return ApiResponses.internalError(`Failed to ${operation}`);
  }
};