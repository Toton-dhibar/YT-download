export default async function handler(request, response) {
  try {
    // Remove /api/proxy from path if present
    let path = request.url.replace('/api/proxy', '');
    if (path === '') path = '/';
    
    const targetUrl = `https://ra.sdupdates.news${path}`;
    
    // Clone headers and set correct host
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (key.toLowerCase() === 'host') {
        headers.set('host', 'ra.sdupdates.news');
      } else if (!['content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }
    
    // Make the request to origin
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual'
    });
    
    // Copy response headers
    const responseHeaders = {};
    for (const [key, value] of res.headers.entries()) {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        response.setHeader(key, value);
      }
    }
    
    // Set CORS headers if needed
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', '*');
    
    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      response.status(200).end();
      return;
    }
    
    // Send response
    response.status(res.status);
    
    const buffer = await res.arrayBuffer();
    response.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Proxy error:', error);
    response.status(500).json({ 
      error: 'CDN Proxy Error',
      message: error.message 
    });
  }
}
