/**
 * Vercel Edge Function - V2Ray xhttp Reverse Proxy
 * 
 * This proxy forwards all requests to the real V2Ray server while hiding its IP.
 * It properly handles xhttp protocol traffic with all headers, methods, and bodies.
 * 
 * Target Server: https://ra.sdupdates.news
 * Path: /xhttp/*
 * 
 * Important Notes:
 * - Vercel Edge Functions have a 25-second timeout for responses
 * - Requests can be up to 4.5MB in size
 * - Streaming is supported but may have limitations
 * - WebSocket connections are NOT supported (xhttp uses standard HTTP)
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    
    // Build target URL - preserve the exact path including /xhttp
    const targetUrl = `https://ra.sdupdates.news${url.pathname}${url.search}`;
    
    // Prepare headers - forward all headers except host-specific ones
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      // Skip headers that should not be forwarded
      const lowerKey = key.toLowerCase();
      if (!['host', 'connection', 'x-forwarded-for', 'x-forwarded-proto', 'x-forwarded-host'].includes(lowerKey)) {
        headers.set(key, value);
      }
    });
    
    // Set the correct host for the target server
    headers.set('Host', 'ra.sdupdates.news');
    
    // Forward the original request info (optional, for logging on backend)
    headers.set('X-Forwarded-For', req.headers.get('x-forwarded-for') || 'unknown');
    headers.set('X-Real-IP', req.headers.get('x-real-ip') || 'unknown');
    
    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers: headers,
      redirect: 'manual', // Don't follow redirects automatically
    };
    
    // Add body for methods that support it
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = req.body;
    }
    
    // Make the request to the real server
    const response = await fetch(targetUrl, fetchOptions);
    
    // Create response headers
    const responseHeaders = new Headers(response.headers);
    
    // Remove headers that shouldn't be forwarded back
    responseHeaders.delete('connection');
    responseHeaders.delete('keep-alive');
    responseHeaders.delete('transfer-encoding');
    
    // Return the proxied response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ 
      error: 'Proxy error', 
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
