export default async function handler(request, response) {
  // WebSocket upgrade handling
  if (request.headers.upgrade === 'websocket') {
    return response.status(426).json({ error: 'WebSocket not supported in this function' });
  }

  // HTTP proxy logic
  const targetUrl = 'https://your-v2ray-server.com';
  
  try {
    const proxyResponse = await fetch(`${targetUrl}${request.url}`, {
      method: request.method,
      headers: {
        ...request.headers,
        host: new URL(targetUrl).host
      },
      body: request.body
    });

    // Copy headers
    for (const [key, value] of proxyResponse.headers) {
      response.setHeader(key, value);
    }

    response.status(proxyResponse.status);
    response.send(await proxyResponse.text());
  } catch (error) {
    response.status(500).json({ error: 'Proxy error' });
  }
}
