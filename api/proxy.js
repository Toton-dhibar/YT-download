/**
 * Vercel Edge Function for proxying V2Ray xhttp traffic
 * 
 * This proxy forwards all requests from Vercel CDN to the real V2Ray server,
 * preserving headers, methods, and request bodies as required by xhttp protocol.
 * 
 * Target: https://ra.sdupdates.news/xhttp/...
 */

export const config = {
  runtime: 'edge', // Use Edge runtime for better performance and no timeout limits
};

export default async function handler(req) {
  const TARGET_SERVER = 'https://ra.sdupdates.news';
  
  try {
    // Extract the path from the request URL
    const url = new URL(req.url);
    const path = url.pathname; // This will be /xhttp/... due to Vercel routing
    const search = url.search; // Preserve query parameters
    
    // Construct target URL - preserve the full path including /xhttp
    const targetUrl = `${TARGET_SERVER}${path}${search}`;
    
    console.log(`[Proxy] ${req.method} ${path}${search} -> ${targetUrl}`);
    
    // Prepare headers for the upstream request
    const headers = new Headers();
    
    // Copy relevant headers from the original request
    // Exclude headers that Vercel/Cloudflare sets or that shouldn't be forwarded
    const excludedHeaders = [
      'host',
      'x-forwarded-for',
      'x-forwarded-proto',
      'x-forwarded-host',
      'x-real-ip',
      'cf-connecting-ip',
      'cf-ray',
      'cf-visitor',
      'x-vercel-',
      'connection',
      'transfer-encoding',
    ];
    
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      const shouldExclude = excludedHeaders.some(excluded => 
        lowerKey === excluded || lowerKey.startsWith(excluded)
      );
      
      if (!shouldExclude) {
        headers.set(key, value);
      }
    });
    
    // Set the correct Host header for the target server
    headers.set('Host', 'ra.sdupdates.news');
    
    // Prepare the request options
    const requestOptions = {
      method: req.method,
      headers: headers,
    };
    
    // Add body for non-GET/HEAD requests
    // xhttp protocol may use POST or other methods with binary data
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      requestOptions.body = req.body;
    }
    
    // Forward the request to the real V2Ray server
    const response = await fetch(targetUrl, requestOptions);
    
    // Create response headers
    const responseHeaders = new Headers();
    
    // Copy response headers from upstream, excluding problematic ones
    const excludedResponseHeaders = [
      'connection',
      'transfer-encoding',
      'keep-alive',
    ];
    
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!excludedResponseHeaders.includes(lowerKey)) {
        responseHeaders.set(key, value);
      }
    });
    
    // Add CORS headers if needed (optional, remove if not required)
    // responseHeaders.set('Access-Control-Allow-Origin', '*');
    
    console.log(`[Proxy] Response: ${response.status} ${response.statusText}`);
    
    // Return the response with the body stream
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('[Proxy] Error:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: 'Proxy error',
        message: error.message,
        timestamp: new Date().toISOString()
      }), 
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
