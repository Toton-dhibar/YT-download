/**
 * Vercel Edge Function for proxying V2Ray xhttp traffic
 * This forwards all requests to the real V2Ray server while hiding its IP
 */
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Extract the path from the request URL
  // Vercel rewrites preserve the original path in the URL
  const url = new URL(req.url);
  
  // The pathname will still contain /xhttp/... from the original request
  // because Vercel's rewrite is internal (doesn't change the URL visible to the function)
  const path = url.pathname + url.search;
  
  // Build the target URL - preserve the full path including /xhttp
  const targetUrl = `https://ra.sdupdates.news${path}`;
  
  // Prepare headers - forward all except 'host'
  const headers = new Headers(req.headers);
  headers.set('host', 'ra.sdupdates.news');
  
  // Remove Vercel-specific headers that shouldn't be forwarded
  headers.delete('x-vercel-id');
  headers.delete('x-vercel-deployment-url');
  headers.delete('x-vercel-forwarded-for');
  
  try {
    // Forward the request with the same method and body
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS' ? req.body : undefined,
      // Important for xhttp: don't follow redirects automatically
      redirect: 'manual',
    });
    
    // Create response with same status and headers
    const responseHeaders = new Headers(response.headers);
    
    // Remove headers that might cause issues
    responseHeaders.delete('content-encoding');
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
      error: 'Proxy failed',
      message: error.message 
    }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
