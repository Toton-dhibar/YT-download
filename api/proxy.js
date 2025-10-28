import { createProxyServer } from 'http-proxy';

const proxy = createProxyServer({
  target: 'http://20.192.29.205:80', // your real V2Ray server
  changeOrigin: true,
  ws: true,
  secure: false
});

export default function handler(req, res) {
  proxy.web(req, res, {}, err => {
    res.statusCode = 500;
    res.end('Proxy error: ' + err.message);
  });
}

export const config = {
  api: {
    bodyParser: false
  }
};
