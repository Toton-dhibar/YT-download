export async function GET(request) {
  return proxyRequest(request);
}

export async function POST(request) {
  return proxyRequest(request);
}

export async function PUT(request) {
  return proxyRequest(request);
}

export async function DELETE(request) {
  return proxyRequest(request);
}

export async function PATCH(request) {
  return proxyRequest(request);
}

export async function HEAD(request) {
  return proxyRequest(request);
}

export async function OPTIONS(request) {
  return proxyRequest(request);
}

async function proxyRequest(request) {
  const targetUrl = `https://ra.sdupdates.news${request.nextUrl.pathname}${request.nextUrl.search}`;
  
  try {
    const proxyResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        'host': 'ra.sdupdates.news',
        'x-forwarded-host': 'ra.sdupdates.news',
        'x-real-ip': request.ip || request.headers.get('x-real-ip') || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'x-forwarded-proto': 'https'
      },
      body: request.body,
      duplex: 'half'
    });

    const response = new Response(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: proxyResponse.headers
    });

    return response;
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
  }
