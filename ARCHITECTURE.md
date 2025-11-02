# Architecture - V2Ray xhttp Vercel CDN Proxy

This document explains how the Vercel reverse proxy works at a technical level.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          V2Ray Client                                    │
│  (Desktop, Mobile, or Server running V2Ray)                             │
│                                                                          │
│  Config: address = "your-project.vercel.app"                            │
│          path = "/xhttp"                                                │
│          protocol = "vless"                                             │
│          transport = "xhttp"                                            │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTPS/TLS (443)
                             │ xhttp protocol
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Vercel Edge Network                               │
│  (100+ Global Edge Locations)                                           │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                       Edge Function                                │ │
│  │                     (api/proxy.js)                                 │ │
│  │                                                                    │ │
│  │  - Runtime: Edge                                                   │ │
│  │  - Timeout: Unlimited                                              │ │
│  │  - Receives: /xhttp/* requests                                     │ │
│  │  - Forwards to: https://ra.sdupdates.news/xhttp/*                  │ │
│  │                                                                    │ │
│  │  Steps:                                                            │ │
│  │  1. Extract path from request URL                                 │ │
│  │  2. Build target URL (ra.sdupdates.news + path)                   │ │
│  │  3. Copy request headers (filter problematic ones)                │ │
│  │  4. Forward request body (if present)                             │ │
│  │  5. Fetch from real server                                        │ │
│  │  6. Copy response headers (filter problematic ones)               │ │
│  │  7. Stream response body back to client                           │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Routing (vercel.json):                                                 │
│  /xhttp/:path* → api/proxy.js                                           │
│                                                                          │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTPS/TLS (443)
                             │ xhttp protocol
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Real V2Ray Server                                 │
│                    (ra.sdupdates.news:443)                              │
│                                                                          │
│  - Protocol: VLESS                                                      │
│  - Transport: xhttp                                                     │
│  - Path: /xhttp                                                         │
│  - TLS: Enabled                                                         │
│                                                                          │
│  Serves V2Ray xhttp requests and sends responses back                  │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### 1. Client Initiates Connection

```javascript
// V2Ray Client Configuration
{
  "address": "your-project.vercel.app",  // Vercel domain
  "port": 443,
  "protocol": "vless",
  "streamSettings": {
    "network": "xhttp",
    "xhttpSettings": {
      "path": "/xhttp"  // Proxy endpoint
    }
  }
}
```

### 2. Request Reaches Vercel Edge

```
Client Request:
  POST https://your-project.vercel.app/xhttp/some-path HTTP/2
  Host: your-project.vercel.app
  Content-Type: application/octet-stream
  User-Agent: V2Ray/5.x
  [Binary body data]
```

### 3. Vercel Routes to Edge Function

```javascript
// vercel.json routing
{
  "rewrites": [
    {
      "source": "/xhttp/:path*",      // Match any /xhttp/* path
      "destination": "/api/proxy"      // Route to proxy function
    }
  ]
}
```

### 4. Edge Function Processes Request

```javascript
// api/proxy.js (simplified)
export default async function handler(req) {
  // Extract path: /xhttp/some-path
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Build target URL
  const targetUrl = `https://ra.sdupdates.news${path}`;
  
  // Copy headers (filter problematic ones)
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!isExcluded(key)) {
      headers.set(key, value);
    }
  });
  headers.set('Host', 'ra.sdupdates.news');
  
  // Forward request to real server
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: headers,
    body: req.body  // Stream body
  });
  
  // Return response
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  });
}
```

### 5. Proxy Forwards to Real Server

```
Proxied Request:
  POST https://ra.sdupdates.news/xhttp/some-path HTTP/2
  Host: ra.sdupdates.news
  Content-Type: application/octet-stream
  User-Agent: V2Ray/5.x
  [Binary body data]
```

### 6. Real Server Responds

```
Server Response:
  HTTP/2 200 OK
  Content-Type: application/octet-stream
  [Binary response data]
```

### 7. Edge Function Returns Response

```
Client Receives:
  HTTP/2 200 OK
  Content-Type: application/octet-stream
  [Binary response data]
```

### 8. V2Ray Client Processes Response

V2Ray client decrypts and processes the xhttp response, completing the connection.

## 🔐 Security Flow

```
┌──────────────┐     TLS/HTTPS      ┌─────────────┐     TLS/HTTPS      ┌──────────┐
│   V2Ray      │ ════════════════▶  │   Vercel    │ ════════════════▶  │  Real    │
│   Client     │   Encrypted (1)    │   Edge      │   Encrypted (2)    │  Server  │
│              │ ◀════════════════  │   Network   │ ◀════════════════  │          │
└──────────────┘                    └─────────────┘                    └──────────┘
```

**Two separate TLS connections:**

1. **Client → Vercel**: TLS connection to `your-project.vercel.app`
2. **Vercel → Server**: TLS connection to `ra.sdupdates.news`

**Key Points:**
- ✅ End-to-end encryption (TLS on both hops)
- ✅ Real server IP hidden from client
- ✅ Client IP visible to Vercel (but not to real server directly)
- ✅ Vercel sees encrypted xhttp traffic (can't decrypt V2Ray payload)

## 📦 Data Flow

### Request Body Handling

```javascript
// Edge function streams request body
const response = await fetch(targetUrl, {
  body: req.body  // PassThrough stream
});

// No buffering in memory!
// Large uploads work fine (within 4.5 MB limit)
```

### Response Body Handling

```javascript
// Edge function streams response body
return new Response(response.body, {
  // Stream from server to client
  // No buffering required
});

// Large downloads work fine (no size limit)
```

**Benefits:**
- 🚀 Low latency (streaming, not buffering)
- 💾 Low memory usage
- 📊 Supports large files (responses)

## 🌐 Geographic Distribution

```
                            Vercel Edge Network
                           (100+ Locations)
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
        ┌────────▼─────┐  ┌────────▼─────┐  ┌────────▼─────┐
        │   Americas   │  │    Europe    │  │  Asia-Pacific │
        │              │  │              │  │              │
        │ • US East    │  │ • Frankfurt  │  │ • Tokyo      │
        │ • US West    │  │ • London     │  │ • Singapore  │
        │ • Brazil     │  │ • Amsterdam  │  │ • Sydney     │
        └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
               │                 │                 │
               └─────────────────┼─────────────────┘
                                 │
                                 ▼
                        Real V2Ray Server
                      (ra.sdupdates.news)
                    Single Location (Origin)
```

**Traffic Pattern:**
1. Client connects to **nearest Vercel edge**
2. Edge forwards to **origin server** (ra.sdupdates.news)
3. Response flows back through same edge
4. Edge caches nothing (Cache-Control: no-cache)

**Benefits:**
- 🌍 Lower latency for clients worldwide
- 🚀 Faster initial connection (to nearest edge)
- 🔄 Consistent performance

## ⚡ Performance Characteristics

### Latency Breakdown

```
Total Latency = Client→Edge + Edge→Server + Processing

Example (Client in Europe):
├─ Client → Edge (Europe):     ~20ms   (to nearest edge)
├─ Edge → Server (Asia):       ~150ms  (depends on server location)
├─ Processing (Edge):           ~5ms   (minimal)
└─ TOTAL:                      ~175ms
```

**Direct Connection (for comparison):**
```
Client → Server (Asia):        ~150ms  (direct, no proxy)
```

**Overhead:** ~25ms (edge routing + processing)

### Throughput

- **Upload**: Limited by client → edge link (typically 10-100 Mbps)
- **Download**: Limited by edge → client link (typically 100+ Mbps)
- **Edge Function**: No artificial limits (streams data)

### Concurrent Connections

- **Vercel Free**: Up to 1,000 concurrent requests per deployment
- **Vercel Pro**: Up to 10,000 concurrent requests per deployment

Sufficient for most personal V2Ray usage.

## 🛡️ Failure Modes

### 1. Real Server Down

```
Client → Vercel Edge → ❌ Server (down)
                  ↓
          502 Bad Gateway
```

Edge function returns error JSON with 502 status.

### 2. Vercel Edge Issue

```
Client → ❌ Vercel Edge (issue)
         ↓
   503 Service Unavailable
```

Vercel automatically routes to healthy edge location.

### 3. Network Timeout

```
Client → Vercel Edge → Server (slow)
                  ↓
         Waits indefinitely
           (no timeout)
```

Edge Functions have no timeout, so long-lived connections work.

## 🔧 Configuration

### Change Target Server

```javascript
// api/proxy.js
const TARGET_SERVER = 'https://your-new-server.com';
```

### Change Path

```javascript
// vercel.json
{
  "rewrites": [
    { "source": "/your-path/:path*", "destination": "/api/proxy" }
  ]
}

// api/proxy.js
// No changes needed - path is extracted from request URL
```

### Add Custom Headers

```javascript
// api/proxy.js - in header forwarding section
headers.set('X-Custom-Header', 'custom-value');
```

### Add Authentication

```javascript
// api/proxy.js - before fetch
headers.set('Authorization', `Bearer ${process.env.AUTH_TOKEN}`);

// Then set AUTH_TOKEN in Vercel dashboard
```

## 📊 Monitoring

### Vercel Dashboard Logs

```
[Proxy] POST /xhttp/abc123 -> https://ra.sdupdates.news/xhttp/abc123
[Proxy] Response: 200 OK

[Proxy] GET /xhttp/xyz789 -> https://ra.sdupdates.news/xhttp/xyz789
[Proxy] Response: 404 Not Found

[Proxy] Error: fetch failed
```

### Metrics Available

- Request count
- Response times (P50, P95, P99)
- Error rates
- Bandwidth usage

Access via Vercel Dashboard → Functions → proxy.js

## 🎯 Summary

This architecture provides:

✅ **Transparent Proxying**: Client sees Vercel domain, traffic goes to real server
✅ **Performance**: Minimal overhead (~25ms), streaming data, no timeouts
✅ **Scalability**: 100+ edge locations, thousands of concurrent connections
✅ **Security**: End-to-end TLS, IP masking, no data logging
✅ **Simplicity**: 3 files, no dependencies, no build step

**Perfect for V2Ray xhttp tunneling! 🚀**

---

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
