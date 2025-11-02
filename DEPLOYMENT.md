# V2Ray xhttp Vercel CDN Proxy - Deployment Guide

This project provides a Vercel-based reverse proxy for V2Ray xhttp protocol, allowing you to route traffic through Vercel CDN to hide your real server IP address.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Deployment Instructions](#deployment-instructions)
- [V2Ray Client Configuration](#v2ray-client-configuration)
- [Vercel Limitations & Considerations](#vercel-limitations--considerations)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Setup:**
- **Real V2Ray Server**: `ra.sdupdates.news:443`
- **Protocol**: VLESS with xhttp transport + TLS
- **Path**: `/xhttp`
- **Vercel Proxy**: `https://<your-project>.vercel.app/xhttp/...`

**How it works:**
```
V2Ray Client → Vercel CDN (your-project.vercel.app) → Real Server (ra.sdupdates.news)
```

All traffic routes through Vercel's edge network, hiding your real server IP from clients.

---

## ✅ Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional, for command-line deployment):
   ```bash
   npm install -g vercel
   ```
3. **Git** (for repository-based deployment)
4. **Working V2Ray Server** on `ra.sdupdates.news:443` with xhttp enabled

---

## 📁 Project Structure

```
.
├── api/
│   └── proxy.js          # Edge function that forwards requests to real server
├── vercel.json           # Vercel configuration (routing, headers)
├── package.json          # Node.js project metadata
├── DEPLOYMENT.md         # This file
├── v2ray-client-config-example.json  # Example client configuration
└── README.md             # Project overview
```

### File Descriptions

#### `api/proxy.js`
- **Runtime**: Edge Function (no timeout limits, runs at edge locations)
- **Purpose**: Forwards all requests to `ra.sdupdates.news` while preserving:
  - HTTP methods (GET, POST, PUT, etc.)
  - Request headers (except problematic ones)
  - Request body (binary data for xhttp)
  - Response headers and body

#### `vercel.json`
- **Rewrites**: Routes `/xhttp/*` paths to the proxy function
- **Headers**: Sets cache control to prevent caching of proxy responses

---

## 🚀 Deployment Instructions

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "V2Ray xhttp proxy setup"
   git branch -M main
   git remote add origin https://github.com/yourusername/v2ray-vercel-proxy.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**:
   - **Project Name**: Choose a name (e.g., `v2ray-proxy`)
   - **Framework Preset**: None / Other
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (~30 seconds)
   - Note your deployment URL: `https://<project-name>.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd /path/to/this/project
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - What's your project's name? `v2ray-proxy` (or any name)
   - In which directory is your code located? `./`

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

6. **Note your deployment URL** from the output.

### Method 3: Deploy via Git Integration (Continuous Deployment)

1. Connect your GitHub repository to Vercel (Method 1 steps 1-2)
2. Every push to `main` branch will automatically deploy
3. Pull requests create preview deployments

---

## 🔧 V2Ray Client Configuration

After deploying, update your V2Ray client to use the Vercel domain instead of the real server.

### Original Configuration (Direct to Server)

```json
{
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "ra.sdupdates.news",
            "port": 443,
            "users": [
              {
                "id": "your-uuid-here",
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "tls",
        "tlsSettings": {
          "serverName": "ra.sdupdates.news",
          "allowInsecure": false
        },
        "xhttpSettings": {
          "path": "/xhttp",
          "host": "ra.sdupdates.news"
        }
      }
    }
  ]
}
```

### New Configuration (Via Vercel CDN)

Replace `<your-project>` with your actual Vercel project name:

```json
{
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "<your-project>.vercel.app",
            "port": 443,
            "users": [
              {
                "id": "your-uuid-here",
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "tls",
        "tlsSettings": {
          "serverName": "<your-project>.vercel.app",
          "allowInsecure": false
        },
        "xhttpSettings": {
          "path": "/xhttp",
          "host": "<your-project>.vercel.app"
        }
      }
    }
  ]
}
```

### Key Changes:
1. **address**: `ra.sdupdates.news` → `<your-project>.vercel.app`
2. **serverName**: `ra.sdupdates.news` → `<your-project>.vercel.app`
3. **host**: `ra.sdupdates.news` → `<your-project>.vercel.app`
4. **path**: Remains `/xhttp` (unchanged)
5. **port**: Remains `443` (unchanged)

### Example for v2rayN (Windows Client)

1. Open v2rayN
2. Click "Servers" → Edit your server
3. Update these fields:
   - **Address**: `<your-project>.vercel.app`
   - **Port**: `443`
   - **Transport**: `xhttp`
   - **Path**: `/xhttp`
   - **Host**: `<your-project>.vercel.app`
   - **TLS**: `tls`
   - **SNI**: `<your-project>.vercel.app`

---

## ⚠️ Vercel Limitations & Considerations

### 1. **Timeout Limits**

| Plan | Function Type | Timeout |
|------|--------------|---------|
| Hobby (Free) | Edge Functions | **No timeout limit** ✅ |
| Hobby (Free) | Serverless Functions | 10 seconds ❌ |
| Pro | Edge Functions | **No timeout limit** ✅ |
| Pro | Serverless Functions | 60 seconds |

**This proxy uses Edge Functions** (`runtime: 'edge'` in `api/proxy.js`), which have **no timeout limits**. This is perfect for long-lived xhttp connections.

### 2. **Request/Response Size Limits**

- **Request Body**: 4.5 MB limit for Edge Functions
- **Response Size**: Streaming responses supported (no hard limit)
- **Impact**: xhttp protocol streams data, so this should work fine for most use cases

### 3. **Bandwidth Limits**

| Plan | Bandwidth |
|------|-----------|
| Hobby (Free) | 100 GB/month |
| Pro | 1 TB/month |

If you exceed limits, you'll need to upgrade or traffic will be throttled.

### 4. **Cold Starts**

- **Edge Functions**: Deployed to 100+ global edge locations
- **Cold Start**: Typically < 100ms (very fast)
- **Impact**: Minimal, almost negligible for xhttp connections

### 5. **HTTP Protocol Support**

- ✅ HTTP/1.1: Fully supported
- ✅ HTTP/2: Supported
- ✅ HTTP/3: Supported by Vercel edge network
- ✅ WebSocket: Limited support (may not work for all xhttp modes)
- ✅ TLS 1.2 & 1.3: Supported

### 6. **Header Restrictions**

Some headers are automatically added/removed by Vercel:
- `X-Forwarded-For`: Set by Vercel (client IP)
- `X-Vercel-*`: Added by Vercel
- `CF-*`: Removed (Cloudflare headers)
- `Connection`: Managed by Vercel

The proxy code handles this by filtering out problematic headers.

### 7. **Caching**

- Default: Vercel may cache responses
- **This proxy**: Explicitly disables caching via `Cache-Control` headers
- xhttp connections require no caching for proper operation

### 8. **Rate Limiting**

Vercel has rate limits to prevent abuse:
- **Hobby**: 100 requests/minute per IP (approximate)
- **Pro**: Higher limits

If you hit rate limits, consider upgrading or distributing traffic.

### 9. **Geographic Distribution**

- Vercel Edge Network: 100+ locations globally
- Requests are routed to the nearest edge location
- Edge location then connects to `ra.sdupdates.news`
- **Benefit**: Lower latency for clients worldwide

### 10. **HTTPS/TLS**

- Vercel provides automatic HTTPS for all deployments
- Free SSL certificates via Let's Encrypt
- TLS 1.2 and 1.3 supported
- Custom domains: Supported on all plans

---

## 🔍 Troubleshooting

### Problem: "502 Bad Gateway"

**Possible causes:**
1. Real server (`ra.sdupdates.news`) is down or unreachable
2. Firewall blocking Vercel's IPs
3. xhttp configuration mismatch

**Solutions:**
- Check if `ra.sdupdates.news` is accessible: `curl -I https://ra.sdupdates.news/xhttp`
- Check V2Ray server logs
- Verify xhttp path is `/xhttp` on both server and proxy

### Problem: "Connection Timeout"

**Possible causes:**
1. Incorrect path configuration
2. Server-side timeout
3. Client configuration error

**Solutions:**
- Verify path in `vercel.json` and `api/proxy.js` match your V2Ray setup
- Check client configuration (path should be `/xhttp`)
- Test direct connection first (without proxy) to isolate issue

### Problem: "SSL Certificate Error"

**Possible causes:**
1. Wrong SNI configuration
2. Client not trusting Vercel's certificate

**Solutions:**
- Set `serverName` to `<your-project>.vercel.app` in client config
- Ensure `allowInsecure: false` in client config
- Update client's trusted certificates

### Problem: "Slow Connection"

**Possible causes:**
1. Vercel edge location far from client
2. Real server location far from Vercel edge
3. Network congestion

**Solutions:**
- Test direct connection speed vs proxied speed
- Check Vercel edge location: https://vercel.com/docs/edge-network/regions
- Consider using Vercel with custom domain in specific regions

### Problem: "Random Disconnections"

**Possible causes:**
1. Request size exceeds limits
2. Bandwidth limit exceeded
3. Rate limiting

**Solutions:**
- Check Vercel dashboard for errors
- Monitor bandwidth usage
- Upgrade plan if hitting limits

### Debugging Tips

1. **Check Vercel logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - View real-time logs for proxy requests
   - Look for `[Proxy]` log messages

2. **Test proxy directly**:
   ```bash
   curl -I https://<your-project>.vercel.app/xhttp
   ```
   Should return a response from the real server.

3. **Enable verbose logging** in V2Ray client:
   - Set log level to "debug"
   - Check client logs for connection details

4. **Compare direct vs proxied**:
   - Test direct connection to `ra.sdupdates.news`
   - Test proxied connection via Vercel
   - Compare latency, speed, and stability

---

## 🎉 Success Checklist

- [ ] Vercel project deployed successfully
- [ ] Proxy URL accessible: `https://<your-project>.vercel.app/xhttp`
- [ ] V2Ray client configuration updated with Vercel domain
- [ ] Test connection works through proxy
- [ ] Speed/latency acceptable
- [ ] No disconnections or errors in logs

---

## 📚 Additional Resources

- [Vercel Edge Functions Documentation](https://vercel.com/docs/functions/edge-functions)
- [V2Ray Documentation](https://www.v2ray.com/)
- [xhttp Protocol Specification](https://github.com/XTLS/Xray-core)
- [Vercel Limits Documentation](https://vercel.com/docs/limits)

---

## 🔒 Security Notes

1. **UUID/Secrets**: Never commit your V2Ray UUID to public repositories
2. **Server IP**: Using this proxy hides your server IP from clients
3. **TLS**: Always use TLS (this setup requires it)
4. **Vercel Logs**: Be aware Vercel may log requests (metadata only)

---

## 📝 License

This proxy setup is provided as-is for educational and personal use. Ensure compliance with Vercel's Terms of Service and your local laws regarding proxy/VPN usage.

---

**Need help?** Check Vercel's support documentation or V2Ray community forums.

**Happy Tunneling! 🚀**
