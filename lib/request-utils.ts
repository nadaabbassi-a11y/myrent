import { NextRequest } from 'next/server';

/**
 * Extract IP address from request
 */
export function getClientIP(request: NextRequest): string | null {
  // Try various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return null;
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: NextRequest): string | null {
  return request.headers.get('user-agent');
}


