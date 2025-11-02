# Architecture Overview

This document explains the technical architecture of the V2Ray xhttp Vercel proxy.

## High-Level Architecture

```
┌─────────────┐
│  V2Ray      │
│  Client     │
│             │
└──────┬──────┘
       │ VLESS/xhttp over TLS
       │ (Encrypted V2Ray traffic)
       │
       ▼
┌──────────────────────────────┐
│  Vercel Edge Network         │
│  (Global CDN)                │
│                              │
│  ┌────────────────────────┐  │
│  │  Edge Function         │  │
│  │  (api/proxy.js)        │  │
│  │                        │  │
│  │  - Parse incoming URL  │  │
│  │  - Forward headers     │  │
│  │  - Stream req/resp     │  │
│  └────────────────────────┘  │
└──────────────┬───────────────┘
               │ HTTPS
               │ (Proxied traffic)
               │
               ▼
       ┌───────────────┐
       │  Real V2Ray   │
       │  Server       │
       │               │
       │ ra.sdupdates  │
       │    .news:443  │
       └───────────────┘
```

## Request Flow

### 1. Client Request
```
Client → https://your-project.vercel.app/xhttp/some-path?query=1
```

**Request Components:**
- Protocol: HTTPS
- Host: `your-project.vercel.app`
- Path: `/xhttp/some-path`
- Query: `?query=1`
- Headers: Standard HTTP headers + V2Ray protocol headers
- Body: Encrypted V2Ray data (if POST/PUT)

### 2. Vercel Routing

**vercel.json Configuration:**
```json
{
  "rewrites": [
    {
      "source": "/xhttp/:path*",
      "destination": "/api/proxy"
    }
  ]
}
```

**What happens:**
1. Request hits Vercel edge server (nearest to client)
2. Matches rewrite rule: `/xhttp/:path*`
3. Routes to Edge Function: `/api/proxy`
4. Preserves original URL (path, query, headers)

### 3. Edge Function Processing

**api/proxy.js (Edge Runtime):**

```javascript
// Input: https://your-project.vercel.app/xhttp/some-path?query=1
const url = new URL(req.url);
// url.pathname = "/xhttp/some-path"
// url.search = "?query=1"

// Target construction
const targetPath = url.pathname + url.search;
// targetPath = "/xhttp/some-path?query=1"

const targetUrl = "https://ra.sdupdates.news" + targetPath;
// targetUrl = "https://ra.sdupdates.news/xhttp/some-path?query=1"
```

**Header Processing:**
```javascript
// Original headers from client
{
  "Host": "your-project.vercel.app",
  "User-Agent": "v2ray-core/5.0",
  "X-Custom-Header": "value",
  ...
}

// Modified headers for backend
{
  "Host": "ra.sdupdates.news",        // Changed!
  "User-Agent": "v2ray-core/5.0",     // Preserved
  "X-Custom-Header": "value",         // Preserved
  // Vercel-specific headers removed
}
```

**Request Options:**
```javascript
{
  method: "POST",          // Preserved from client
  headers: modifiedHeaders,
  body: req.body,          // Streamed through
  redirect: "manual"       // Don't auto-follow
}
```

### 4. Backend Request

```
Edge Function → https://ra.sdupdates.news/xhttp/some-path?query=1
```

**Request to Real Server:**
- Same method (GET/POST/PUT/DELETE)
- Same path and query
- Modified Host header
- Same body (streamed)

### 5. Backend Response

**V2Ray Server Response:**
```
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Length: 1234
X-Custom-Response: value
[binary data]
```

**Edge Function Processing:**
```javascript
// Get response from backend
const response = await fetch(targetUrl, fetchOptions);

// Prepare response headers
const responseHeaders = new Headers(response.headers);
responseHeaders.delete('content-encoding'); // Let Vercel handle

// Stream response back
return new Response(response.body, {
  status: response.status,
  statusText: response.statusText,
  headers: responseHeaders,
});
```

### 6. Client Response

```
Client ← Edge Function ← Backend
```

**Received by Client:**
- Same status code (200, 404, 500, etc.)
- Same headers (except filtered ones)
- Same body (streamed, not buffered)

## Data Flow Details

### Upload (Client → Server)

```
┌─────────────┐
│   Client    │
│             │ 1. Generate V2Ray packet
│  [V2Ray]    │    (encrypted payload)
└──────┬──────┘
       │
       │ 2. Wrap in HTTPS POST
       │    Host: your-project.vercel.app
       │    Path: /xhttp
       │    Body: [encrypted data]
       ▼
┌──────────────┐
│ Vercel Edge  │
│             │ 3. Parse request
│  [proxy.js] │    Extract path, headers, body
└──────┬──────┘
       │
       │ 4. Forward to backend
       │    Host: ra.sdupdates.news
       │    Path: /xhttp
       │    Body: [encrypted data]
       ▼
┌──────────────┐
│  V2Ray       │
│  Server      │ 5. Decrypt V2Ray packet
│             │    Process request
│  [Backend]   │    Generate response
└──────────────┘
```

### Download (Server → Client)

```
┌──────────────┐
│  V2Ray       │
│  Server      │ 1. Encrypt response data
│             │
│  [Backend]   │
└──────┬──────┘
       │
       │ 2. Send HTTPS response
       │    Status: 200 OK
       │    Body: [encrypted data]
       ▼
┌──────────────┐
│ Vercel Edge  │
│             │ 3. Stream response
│  [proxy.js] │    (No buffering)
└──────┬──────┘
       │
       │ 4. Forward to client
       │    Status: 200 OK
       │    Body: [encrypted data]
       ▼
┌─────────────┐
│   Client    │
│             │ 5. Receive & decrypt
│  [V2Ray]    │    Process data
└─────────────┘
```

## Technical Components

### Edge Function Runtime

**Why Edge Runtime?**
- ✅ Low latency (deployed globally)
- ✅ Automatic scaling
- ✅ Streaming support (no buffering)
- ✅ Minimal cold starts

**Configuration:**
```javascript
export const config = {
  runtime: 'edge',
};
```

**Characteristics:**
- Runs on V8 isolates (not Node.js)
- Supports Web APIs (fetch, Headers, Response)
- No filesystem access
- Limited to 4.5 MB request/response
- Timeout: 10s (Hobby) / 60s+ (Pro)

### Header Handling

**Removed Headers:**
```javascript
// Vercel-specific (shouldn't be forwarded)
headers.delete('x-vercel-id');
headers.delete('x-vercel-deployment-url');
headers.delete('x-vercel-forwarded-for');

// Response processing (let Vercel handle)
responseHeaders.delete('content-encoding');
```

**Modified Headers:**
```javascript
// Critical for backend routing
headers.set('Host', TARGET_HOST);
```

**Preserved Headers:**
- User-Agent
- Content-Type
- Content-Length
- Authorization
- Custom V2Ray headers
- All other standard headers

### Body Streaming

**For Uploads (POST/PUT):**
```javascript
if (req.method !== 'GET' && req.method !== 'HEAD') {
  fetchOptions.body = req.body;
}
```

- `req.body` is a ReadableStream
- Streamed to backend (not buffered)
- Supports chunked transfer encoding
- Limited to 4.5 MB per request

**For Downloads:**
```javascript
return new Response(response.body, {
  status: response.status,
  headers: responseHeaders,
});
```

- `response.body` is a ReadableStream
- Streamed to client (not buffered)
- Supports large responses within limits
- Efficient memory usage

## Error Handling

### Network Errors

```javascript
try {
  const response = await fetch(targetUrl, fetchOptions);
  // ... forward response
} catch (error) {
  return new Response(JSON.stringify({ 
    error: 'Proxy error', 
    message: error.message 
  }), {
    status: 502,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

**Error Types:**
- Network timeout
- DNS resolution failure
- Connection refused
- SSL/TLS errors

**Client sees:**
```json
HTTP/1.1 502 Bad Gateway
{
  "error": "Proxy error",
  "message": "fetch failed"
}
```

### Backend Errors

**Scenario:** Backend returns 500, 503, etc.

```javascript
// Edge function forwards as-is
return new Response(response.body, {
  status: response.status,  // 500, 503, etc.
  statusText: response.statusText,
  headers: responseHeaders,
});
```

Client receives the exact backend error.

## Performance Characteristics

### Latency Breakdown

**Direct Connection:**
```
Client → Server
Latency: X ms
```

**Via Vercel:**
```
Client → Vercel Edge → Server
Latency: X + Y + Z ms
```

Where:
- X = Client to Vercel edge (~20-50ms for nearest edge)
- Y = Processing time (~1-5ms for Edge Function)
- Z = Vercel edge to Server (~same as if direct)

**Typical overhead:** +50-200ms

### Throughput

**Factors:**
- Vercel bandwidth limits (100GB/month → 1TB/month)
- Request size limits (4.5 MB per request)
- Response streaming (no buffering)
- Concurrent execution limits (100 → 1,000)

**Best Performance:**
- Small, frequent requests (< 1 MB)
- HTTP/2 multiplexing
- Persistent connections (where possible)

### Caching

**Current Configuration:**
```json
{
  "headers": [
    {
      "source": "/xhttp/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

**Effect:**
- Every request hits the Edge Function
- No CDN caching (correct for V2Ray)
- Fresh data every time

## Security Model

### TLS Encryption Layers

```
┌──────────────────────────────────────┐
│  Client ← TLS 1.3 → Vercel Edge     │ ← First TLS tunnel
└──────────────────────────────────────┘
            |
            | V2Ray encrypted payload
            | (encrypted with V2Ray keys)
            |
┌──────────────────────────────────────┐
│  Vercel Edge ← TLS 1.3 → Backend    │ ← Second TLS tunnel
└──────────────────────────────────────┘
```

**Double encryption:**
1. V2Ray protocol encryption (end-to-end)
2. HTTPS/TLS transport (hop-by-hop)

**What Vercel sees:**
- HTTPS encrypted traffic
- Cannot decrypt V2Ray payload
- Only sees encrypted bytes

### Authentication

**V2Ray Level:**
- UUID-based authentication
- Handled by V2Ray server
- Edge Function is transparent

**Vercel Level:**
- No authentication required
- Public endpoint (as designed)
- Could add API key if needed

### IP Hiding

**Client perspective:**
```
Client → Sees: your-project.vercel.app
Client → Doesn't see: ra.sdupdates.news
```

**Server perspective:**
```
Server → Sees: Vercel edge IP (e.g., 76.76.21.21)
Server → Doesn't see: Client IP directly
```

**Benefits:**
- Real server IP hidden from clients
- Client IP hidden from real server (via Vercel)
- DDoS attacks hit Vercel (not your server)

## Limitations & Constraints

### Vercel Platform Limits

| Limit | Value | Impact |
|-------|-------|--------|
| Max request body | 4.5 MB | Large uploads fail |
| Max response body | 4.5 MB | Large downloads fail |
| Execution timeout | 10s (Hobby) | Long requests timeout |
| Execution timeout | 60s (Pro) | Better for V2Ray |
| Bandwidth | 100GB (Hobby) | Monitor usage |
| Bandwidth | 1TB (Pro) | Suitable for regular use |

### Edge Runtime Limits

**Not available:**
- Node.js APIs (fs, net, etc.)
- Binary modules
- Long-lived WebSocket connections

**Available:**
- Fetch API
- Streaming responses
- Web Crypto API
- Headers, URL parsing

## Monitoring & Observability

### Logging

**Console logs:**
```javascript
console.error('Proxy error:', error);
```

**View logs:**
```bash
vercel logs --follow
```

**Log retention:**
- Hobby: Recent logs only
- Pro: Extended retention

### Metrics

**Vercel Analytics:**
- Request count
- Response times
- Error rates
- Bandwidth usage
- Geographic distribution

**Access:**
- Vercel Dashboard → Analytics
- Or via Vercel API

## Deployment Process

### Build Step

**No build required:**
- Pure JavaScript (ES modules)
- No compilation needed
- No dependencies to install

### Deployment

```bash
vercel --prod
```

**What happens:**
1. Upload: api/proxy.js + vercel.json
2. Validation: Check configuration
3. Deploy: Push to edge network
4. Propagate: ~30 seconds global propagation
5. Ready: Available at *.vercel.app

### Rollback

```bash
vercel rollback [deployment-url]
```

**Effect:**
- Instant rollback to previous version
- No downtime
- Global propagation ~30 seconds

## Optimization Strategies

### Reduce Cold Starts

1. **Use Pro plan**: Reduced cold start times
2. **Keep warm**: Periodic requests (e.g., health check)
3. **Edge runtime**: Faster than serverless functions

### Improve Latency

1. **Custom domain with geo-routing**: Route to nearest edge
2. **HTTP/2**: Enable multiplexing
3. **Minimize hops**: Choose server near Vercel regions

### Increase Throughput

1. **Upgrade plan**: More bandwidth
2. **Compress data**: At V2Ray level
3. **Batch requests**: Where possible

## Alternatives & Comparisons

### vs. Cloudflare Workers

| Feature | Vercel Edge | Cloudflare Workers |
|---------|-------------|-------------------|
| Free tier bandwidth | 100 GB | 100 GB |
| Free tier timeout | 10s | 10s |
| Edge locations | ~40+ | 275+ |
| Ease of deployment | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Request size limit | 4.5 MB | 100 MB (paid) |

### vs. AWS Lambda@Edge

| Feature | Vercel Edge | Lambda@Edge |
|---------|-------------|-------------|
| Setup complexity | Simple | Complex |
| Cold starts | Minimal | Higher |
| Pricing | Simple | Pay per request |
| Timeout | 10-60s | 30s |

### vs. Direct Connection

| Aspect | Vercel Proxy | Direct |
|--------|-------------|--------|
| Latency | +50-200ms | 0ms extra |
| IP masking | ✅ Yes | ❌ No |
| DDoS protection | ✅ Vercel | ⚠️ Your server |
| Cost | $0-20/mo | $0 |
| Bandwidth limit | 100GB-1TB | Unlimited* |

*Subject to your server's capacity

## Troubleshooting Decision Tree

```
Connection Failed?
├─ Can reach vercel.app? ──NO──> DNS/Network issue
│                         YES
│                          │
├─ Returns 502? ──YES──> Backend unreachable
│            NO          - Check ra.sdupdates.news
│             │          - Verify firewall
│             │
├─ Returns 504? ──YES──> Timeout issue
│            NO          - Request too slow
│             │          - Upgrade to Pro
│             │
├─ Returns 403? ──YES──> Access denied
│            NO          - Check Vercel settings
│             │          - Check backend firewall
│             │
└─ V2Ray error? ──YES──> Authentication issue
                         - Verify UUID
                         - Check encryption settings
                         - Verify path (/xhttp)
```

## Future Enhancements

Possible improvements:

1. **Multi-backend routing**: Route to different servers based on path
2. **Request limiting**: Add rate limiting for abuse prevention
3. **Health checks**: Automatic backend health monitoring
4. **Failover**: Multiple backend servers with automatic failover
5. **Metrics collection**: Custom analytics and monitoring
6. **WebSocket support**: If Vercel adds better WS support
7. **Request transformation**: Modify requests based on rules

## Conclusion

This architecture provides:
- ✅ Simple, transparent HTTP proxy
- ✅ Global edge distribution
- ✅ IP masking and DDoS protection
- ✅ Easy deployment and management
- ✅ Suitable for V2Ray xhttp protocol

Trade-offs:
- ⚠️ Additional latency (+50-200ms)
- ⚠️ Bandwidth limits (100GB free)
- ⚠️ Request size limits (4.5 MB)
- ⚠️ Timeout limits (10s free, 60s pro)

Best for:
- Personal V2Ray usage
- Hiding server IP
- Leveraging CDN benefits
- Simple deployment needs
