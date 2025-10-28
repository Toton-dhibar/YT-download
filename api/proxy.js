import { createProxyServer } from 'http-proxy';

const proxy = createProxyServer({
  target: 'https://129.154.235.90:443', // your real V2Ray server
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
