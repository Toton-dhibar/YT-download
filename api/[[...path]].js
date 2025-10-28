import http from 'http';

export default async function handler(req, res) {
  const path = req.query.path ? '/' + req.query.path.join('/') : '/';
  
  const options = {
    hostname: '20.192.29.205',
    port: 80,
    path: path,
    method: req.method,
    headers: { ...req.headers, host: '4.234.66.71' }
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
  },
};
