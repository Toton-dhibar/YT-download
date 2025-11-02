# Architecture Overview

This document explains how the V2Ray xhttp Vercel proxy works.

## System Architecture

### High-Level Overview

```
┌─────────────┐          ┌──────────────┐          ┌─────────────────┐
│             │          │              │          │                 │
│  V2Ray      │  HTTPS   │   Vercel     │  HTTPS   │  Real V2Ray     │
│  Client     │─────────▶│   Edge CDN   │─────────▶│  Server         │
│             │          │              │          │                 │
└─────────────┘          └──────────────┘          └─────────────────┘
     User                 Proxy/CDN Layer           Origin Server
```

### Detailed Request Flow

```
┌───────────────────────────────────────────────────────────────────┐
│ 1. V2Ray Client Initiates Connection                             │
│    Protocol: VLESS + xhttp + TLS                                 │
│    Target: https://your-project.vercel.app/xhttp                 │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│ 2. DNS Resolution                                                 │
│    your-project.vercel.app → Vercel Edge IP                      │
│    Uses Anycast for nearest edge location                        │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│ 3. TLS Handshake with Vercel Edge                                │
│    Client ←──[TLS 1.3]──→ Vercel Edge                           │
│    Certificate: *.vercel.app (auto-provisioned)                  │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│ 4. Vercel Routing Layer                                          │
│    Reads: vercel.json                                            │
│    Matches: /xhttp/:path*                                        │
│    Routes to: /api/proxy (Edge Function)                         │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│ 5. Edge Function Processing (api/proxy.js)                       │
│    • Parse request URL and path                                  │
│    • Extract /xhttp path and query parameters                    │
│    • Prepare headers for forwarding                              │
│    • Remove Vercel-specific headers                              │
│    • Set target host header                                      │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│ 6. Outbound Request to Origin                                    │
│    Edge Function → https://ra.sdupdates.news/xhttp/...           │
│    New TLS handshake: Edge ←──[TLS]──→ Origin                   │
│    All headers and body forwarded                                │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│ 7. Real V2Ray Server Processing                                  │
│    • Decrypts VLESS traffic                                      │
│    • Processes V2Ray protocol                                    │
│    • Makes actual internet requests                              │
│    • Returns response                                            │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│ 8. Response Path (Reverse Flow)                                  │
│    Server → Edge Function → Vercel CDN → Client                  │
│    Same encryption: Double TLS                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. V2Ray Client

**Location**: User's device (Phone, Computer, etc.)

**Responsibilities**:
- Encrypt traffic using VLESS protocol
- Establish TLS connection to Vercel
- Use xhttp transport protocol
- Handle reconnections on timeout

**Configuration**:
```json
{
  "address": "your-project.vercel.app",
  "port": 443,
  "protocol": "vless",
  "streamSettings": {
    "network": "xhttp",
    "security": "tls"
  }
}
```

### 2. Vercel Edge Network

**Location**: Global CDN with 70+ edge locations

**Responsibilities**:
- TLS termination
- Route matching (via vercel.json)
- Load balancing
- DDoS protection
- SSL certificate management

**Key Features**:
- Anycast DNS (routes to nearest edge)
- Automatic HTTPS
- Global distribution
- Fast cold starts (~50-100ms)

### 3. Edge Function (api/proxy.js)

**Location**: Runs on Vercel Edge Runtime

**Responsibilities**:
- Parse incoming requests
- Reconstruct target URL
- Forward headers appropriately
- Proxy request body
- Return response

**Runtime**: Edge Runtime (V8 isolate)
- No Node.js APIs (lightweight)
- Uses Web APIs (fetch, Headers, Response)
- Deploys to all edge locations

**Code Flow**:
```javascript
Request → Parse URL → Build Target URL → 
Forward Headers → Fetch Origin → Return Response
```

### 4. Real V2Ray Server

**Location**: Your origin server (ra.sdupdates.news)

**Responsibilities**:
- V2Ray protocol processing
- Actual traffic proxying
- Internet access
- Response generation

**Unchanged**: Server configuration remains the same

## Network Topology

### Geographic Distribution

```
User Location: Anywhere
        │
        ▼
Vercel Edge: Nearest location (70+ worldwide)
        │
        ├── North America: 20+ locations
        ├── Europe: 20+ locations
        ├── Asia: 20+ locations
        └── Other: 10+ locations
        │
        ▼
Origin Server: Fixed location (ra.sdupdates.news)
        │
        ▼
Internet: Destination websites
```

### Latency Impact

**Without Vercel** (Direct):
```
Client → Origin Server → Internet
Latency: A + B
```

**With Vercel**:
```
Client → Vercel Edge → Origin Server → Internet
Latency: X + Y + B
```

Where:
- A = Client to Origin (could be far)
- X = Client to Edge (usually very close)
- Y = Edge to Origin (via optimized routes)
- B = Origin to Internet

**Usually**: X + Y < A (Vercel improves latency)

## Security Layers

### Encryption Flow

```
┌─────────────────────────────────────────────────────────┐
│ Application Layer (V2Ray VLESS Protocol)                │
│ └──▶ Encrypted by V2Ray with user's UUID               │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Transport Layer 1 (Client to Vercel)                    │
│ └──▶ TLS 1.3 encryption (*.vercel.app cert)            │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼ [Decrypted at Vercel Edge]
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Transport Layer 2 (Vercel to Origin)                    │
│ └──▶ TLS 1.3 encryption (ra.sdupdates.news cert)       │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼ [Decrypted at Origin]
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ V2Ray Processing (Origin Server)                        │
│ └──▶ VLESS decryption and routing                      │
└─────────────────────────────────────────────────────────┘
```

**Key Point**: Traffic is decrypted at Vercel Edge but remains encrypted with V2Ray protocol underneath.

### Trust Boundary

```
┌──────────────┐  Trust    ┌──────────────┐  Trust    ┌──────────────┐
│   Client     │═══════════│Vercel Edge   │═══════════│Origin Server │
│   (You)      │           │  (Vercel)    │           │  (You)       │
└──────────────┘           └──────────────┘           └──────────────┘
                                  ▲
                                  │
                          Vercel can see
                          decrypted traffic
                          (TLS terminated here)
```

## Request/Response Examples

### Example 1: Simple Web Request

```
1. Client requests: https://example.com/page.html
   │
2. V2Ray client wraps in VLESS + xhttp
   └──▶ POST https://your-project.vercel.app/xhttp
        Body: [Encrypted V2Ray data]
   │
3. Vercel Edge receives and routes to api/proxy.js
   │
4. Edge Function forwards:
   └──▶ POST https://ra.sdupdates.news/xhttp
        Body: [Same encrypted data]
   │
5. Origin V2Ray server processes:
   └──▶ Decrypts → Fetches example.com → Encrypts response
   │
6. Response flows back through same path
   │
7. Client receives and displays page
```

### Example 2: Streaming Data

```
Client sends continuous requests (HTTP chunked encoding)
   ↓
Vercel Edge forwards each chunk
   ↓
Origin processes and responds
   ↓
Every 10-30 seconds: Timeout
   ↓
V2Ray client automatically reconnects
   ↓
Streaming continues (with brief pause)
```

## Scalability

### Horizontal Scaling

```
Multiple Clients          Multiple Edge Locations
    Client 1 ─────────────▶ Edge LA
    Client 2 ─────────────▶ Edge NY          Origin Server
    Client 3 ─────────────▶ Edge London  ────▶ ra.sdupdates.news
    Client 4 ─────────────▶ Edge Tokyo
    Client N ─────────────▶ Edge Sydney
```

**Benefits**:
- Load distributed across Vercel's edge
- Origin sees traffic from multiple edge IPs
- Clients use nearest edge location

### Vertical Scaling (Multiple Proxies)

```
Client                  Vercel Proxies              Origin Servers
  │                    proxy1.vercel.app ────────▶ server1.com
  ├─── Round-robin ──▶ proxy2.vercel.app ────────▶ server2.com
  │                    proxy3.vercel.app ────────▶ server3.com
  └────────────────────────────────────────────────────────────
      Load balancing         Distribution          Multiple origins
```

## Performance Characteristics

### Latency Breakdown

| Segment | Typical Latency |
|---------|----------------|
| Client → Edge | 10-50ms (nearby) |
| Edge processing | 1-5ms |
| Edge → Origin | 50-200ms (depends on location) |
| Origin processing | 10-50ms |
| **Total Added** | **70-300ms** |

**Comparison**:
- Direct connection: May be higher if origin is far
- Through Vercel: Usually lower due to edge proximity

### Throughput

| Metric | Limit | Impact |
|--------|-------|--------|
| Single request | 4.5 MB | Chunks larger transfers |
| Concurrent requests | No hard limit | Depends on client |
| Bandwidth | 100GB/month (free) | Limits monthly usage |

## Failure Modes

### Edge Function Timeout

```
Request starts → Processing → 10 seconds → Timeout
                                              │
                                              ▼
                            Returns 504 Gateway Timeout
                                              │
                                              ▼
                            Client detects error
                                              │
                                              ▼
                            V2Ray auto-reconnects
```

### Origin Server Down

```
Edge Function tries to connect → Connection refused
                                         │
                                         ▼
                            Returns 502 Bad Gateway
                                         │
                                         ▼
                            Client tries again
```

### Network Partition

```
Client ←─[Connected]─→ Edge ←─[Disconnected]─✗ Origin
                                                  │
                                                  ▼
                            502 errors to client
                                                  │
                                                  ▼
                        Client may try direct connection
```

## Monitoring Points

### Client-Side Metrics

- Connection success rate
- Reconnection frequency
- Bandwidth usage
- Latency measurements

### Vercel Dashboard Metrics

- Request count
- Error rate (4xx, 5xx)
- Function execution time
- Bandwidth usage

### Origin Server Metrics

- Incoming connections from Vercel IPs
- Traffic volume
- Error logs
- Performance metrics

## Comparison: Direct vs. Through Vercel

| Aspect | Direct Connection | Through Vercel |
|--------|------------------|----------------|
| **IP Visible** | Your real IP | Vercel edge IPs |
| **Latency** | Variable | Usually better (CDN) |
| **Reliability** | Depends on network | High (CDN redundancy) |
| **DDoS Protection** | None | Vercel's protection |
| **Cost** | ISP bandwidth | Vercel pricing |
| **Setup Complexity** | Simple | Need deployment |
| **Timeouts** | None | 10-30 seconds |
| **Bandwidth Limits** | ISP limits | Vercel tier limits |

## Summary

This architecture provides:

✅ **IP Obfuscation**: Real server IP hidden
✅ **Global Distribution**: 70+ edge locations
✅ **Automatic Scaling**: Handles traffic spikes
✅ **SSL/TLS**: Automatic certificate management
✅ **DDoS Protection**: Vercel's infrastructure

⚠️ **Trade-offs**:
- Timeout limitations
- Bandwidth costs
- Trust Vercel with traffic
- Added complexity

**Best suited for**: Personal use, browsing, IP hiding
**Not ideal for**: 24/7 production, heavy streaming, large transfers
