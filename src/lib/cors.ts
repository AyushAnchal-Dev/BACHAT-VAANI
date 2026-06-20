// Reusable CORS helper for Next.js App Router API routes
// Usage: call `handleCors(request)` at the top of your route handler.

export function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS || '';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export function handleCors(request: Request) {
  const allowed = getAllowedOrigins();
  const origin = request.headers.get('origin') || '';

  // In development, allow localhost if no ALLOWED_ORIGINS configured
  const devAllowed = process.env.NODE_ENV !== 'production' && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'));

  const isAllowed = devAllowed || allowed.includes(origin);

  const headers = new Headers();
  headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');

  if (isAllowed) {
    headers.set('Access-Control-Allow-Origin', origin || '');
  } else {
    // Do not use wildcard in production — omit the header to reject cross-origin requests
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  return { headers };
}
