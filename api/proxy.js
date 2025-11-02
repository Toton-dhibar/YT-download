/**
 * Vercel Edge Function to proxy V2Ray xhttp traffic
 * Forwards all requests from /xhttp/* to the real V2Ray server
 * 
 * Target: https://ra.sdupdates.news/xhttp/*
 * Protocol: VLESS with xhttp + TLS
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Extract the path after /api/proxy
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/proxy', '');
  const search = url.search;
  
  // Construct target URL - preserve the full path including /xhttp
  const targetUrl = `https://ra.sdupdates.news/xhttp${path}${search}`;
  
  try {
    // Prepare headers for forwarding
    const forwardHeaders = new Headers(req.headers);
    
    // Update host header to target server
    forwardHeaders.set('host', 'ra.sdupdates.news');
    
    // Remove Vercel-specific headers that shouldn't be forwarded
    forwardHeaders.delete('x-vercel-id');
    forwardHeaders.delete('x-vercel-proxy-signature');
    forwardHeaders.delete('x-vercel-sc-host');
    forwardHeaders.delete('x-vercel-deployment-url');
    
    // Forward request to real V2Ray server
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      // Important: Don't follow redirects, pass them through
      redirect: 'manual',
    });
    
    // Prepare response headers
    const responseHeaders = new Headers(response.headers);
    
    // Remove headers that might cause issues with Vercel CDN
    responseHeaders.delete('transfer-encoding');
    
    // Add CORS headers if needed (optional, uncomment if required)
    // responseHeaders.set('access-control-allow-origin', '*');
    // responseHeaders.set('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // responseHeaders.set('access-control-allow-headers', '*');
    
    // Return the proxied response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({
      error: 'Proxy request failed',
      message: error.message,
    }), {
      status: 502,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}
