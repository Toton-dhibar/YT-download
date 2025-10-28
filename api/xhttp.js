import http from 'http';

export default async function handler(req, res) {
  const headers = { ...req.headers };
  delete headers['host'];
  delete headers['x-vercel-id'];

  const options = {
    hostname: '20.192.29.205',
    port: 80, // Your v2ray server port
    path: req.url,
    method: req.method,
    headers: headers
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on('error', (err) => {
    res.status(500).json({ error: 'Proxy failed' });
  });

  req.pipe(proxy);
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
