export default async function handler(req, res) {
  const targetUrl = "https://ra.sdupdates.news" + req.url.replace("/xhttp", "");
  
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: "ra.sdupdates.news"
    },
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body
  });

  res.status(response.status);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const buffer = await response.arrayBuffer();
  res.send(Buffer.from(buffer));
}
