# V2Ray xhttp Vercel CDN Proxy

A Vercel Edge Function that acts as a reverse proxy/CDN for V2Ray xhttp servers, helping to hide your real server IP and provide DDoS protection through Vercel's global edge network.

## Overview

This project allows you to route V2Ray xhttp traffic through Vercel's CDN, providing:

- ✅ **IP Masking**: Hide your real V2Ray server IP address
- ✅ **DDoS Protection**: Benefit from Vercel's built-in protection
- ✅ **Global CDN**: Improved latency via Vercel's edge network
- ✅ **HTTPS/TLS**: Automatic HTTPS with Vercel's certificates
- ✅ **Easy Deployment**: Deploy in minutes with Vercel CLI or GitHub

## How It Works

```
V2Ray Client → Vercel CDN (your-project.vercel.app)
              → Edge Proxy Function
              → Your Real V2Ray Server (ra.sdupdates.news)
```

The Vercel Edge Function transparently forwards all requests from `/xhttp/*` to your real V2Ray server while preserving headers, methods, and request bodies.

## 📚 Documentation Index

**Start Here:**
- 📖 **[README.md](./README.md)** (this file) - Project overview
- 🚀 **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- 📋 **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project summary

**Deployment:**
- 📦 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- 🔧 **[deploy.sh](./deploy.sh)** - Interactive deployment script

**Configuration:**
- 📱 **[V2RAY_CONFIG.md](./V2RAY_CONFIG.md)** - Client configuration examples
- 📄 **[example-v2ray-config.json](./example-v2ray-config.json)** - Reference config

**Technical:**
- 🏗️ **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical deep-dive
- ❓ **[FAQ.md](./FAQ.md)** - 50+ questions answered
- 🔍 **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions to common issues

## Project Structure

```
.
├── api/
│   └── proxy.js           # Edge Function that proxies requests
├── vercel.json            # Vercel routing and configuration
├── package.json           # Project metadata
├── deploy.sh              # Interactive deployment script
├── example-v2ray-config.json  # Reference V2Ray config
│
├── README.md              # This file - Start here
├── QUICKSTART.md          # 5-minute quick start
├── PROJECT_SUMMARY.md     # Complete project summary
├── DEPLOYMENT.md          # Detailed deployment guide
├── V2RAY_CONFIG.md        # V2Ray client configuration
├── ARCHITECTURE.md        # Technical architecture
├── FAQ.md                 # Frequently asked questions
└── TROUBLESHOOTING.md     # Troubleshooting guide
```

## Quick Start

### 1. Clone or Download This Repository

```bash
git clone https://github.com/Toton-dhibar/YT-download.git
cd YT-download
```

### 2. Configure Your Target Server (if needed)

Edit `api/proxy.js` to set your V2Ray server domain:

```javascript
const TARGET_HOST = 'ra.sdupdates.news'; // Change this to your server
```

### 3. Deploy to Vercel

**Option A: Vercel CLI (Recommended)**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: GitHub Integration**
1. Push this repo to your GitHub
2. Import on [vercel.com/new](https://vercel.com/new)
3. Deploy automatically

**Option C: Direct Upload**
1. Zip the project files
2. Upload at [vercel.com/new](https://vercel.com/new)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### 4. Configure Your V2Ray Client

Update your V2Ray client to use your Vercel domain instead of the direct server:

**Key Changes**:
- **Address**: `your-project.vercel.app` (instead of `ra.sdupdates.news`)
- **Port**: `443`
- **Path**: `/xhttp` (same as before)
- **TLS/SNI**: `your-project.vercel.app` (important!)
- **Host**: `your-project.vercel.app`

See [V2RAY_CONFIG.md](./V2RAY_CONFIG.md) for complete configuration examples for all major V2Ray clients.

### 5. Test Your Connection

```bash
# Test endpoint availability
curl -v https://your-project.vercel.app/xhttp/

# Connect with your V2Ray client and test
```

## Features

### ✅ Full HTTP Transparency
- Preserves all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Forwards all headers (except Vercel-specific ones)
- Maintains request/response bodies
- Handles binary data correctly

### ✅ Optimized for V2Ray xhttp
- Uses Vercel Edge Runtime for low latency
- Streams responses (no buffering)
- Supports HTTP/1.1 and HTTP/2
- Minimal overhead

### ✅ Security Features
- TLS/HTTPS enforced by Vercel
- No credential storage (transparent proxy)
- Error handling without exposing internal details
- Cache-Control headers to prevent caching

## Vercel Limitations

### ⚠️ Important Constraints

| Limit | Hobby (Free) | Pro ($20/mo) |
|-------|-------------|--------------|
| **Timeout** | 10 seconds | 60+ seconds |
| **Request/Response Size** | 4.5 MB | 4.5 MB |
| **Bandwidth** | 100 GB/month | 1 TB/month |
| **Concurrent Executions** | 100 | 1,000 |

### Recommendations

- ✅ **Ideal for**: Control traffic, web browsing, messaging
- ⚠️ **May struggle with**: Large file downloads, long-lived connections
- 💡 **Best practice**: Use Pro plan for reliable V2Ray usage
- 📊 **Monitor**: Keep an eye on Vercel analytics for bandwidth usage

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed explanation of limitations.

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Complete deployment guide
  - Step-by-step deployment instructions
  - Configuration options
  - Troubleshooting guide
  - Vercel limitations explained
  
- **[V2RAY_CONFIG.md](./V2RAY_CONFIG.md)**: V2Ray client configuration
  - Configuration examples for all major clients
  - Parameter explanations
  - Testing procedures
  - Advanced multi-server setup

## Testing Locally

Test the proxy locally before deploying:

```bash
# Install Vercel CLI
npm install -g vercel

# Run local development server
vercel dev

# Test on http://localhost:3000/xhttp/
```

## Configuration Options

### Using Environment Variables

For easier configuration management, you can use environment variables:

1. **In Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add: `TARGET_HOST` = `your-server.com`

2. **Update api/proxy.js**:
   ```javascript
   const TARGET_HOST = process.env.TARGET_HOST || 'ra.sdupdates.news';
   ```

3. **Redeploy**

### Using Custom Domains

1. Add your domain in Vercel project settings
2. Update DNS records as instructed
3. Use custom domain in V2Ray client configuration

## Security Considerations

- 🔒 **TLS Encryption**: All traffic encrypted via HTTPS
- 🔒 **No Credential Storage**: Proxy doesn't store or log credentials
- 🔒 **V2Ray Authentication**: Handled by your V2Ray server (UUID-based)
- 🔒 **DDoS Protection**: Vercel's built-in protection
- 🔒 **IP Hiding**: Your real server IP is not exposed to clients

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Check if your V2Ray server is accessible
2. **504 Gateway Timeout**: Request took too long (upgrade to Pro plan)
3. **Connection Failed**: Verify SNI/Host headers match Vercel domain
4. **Slow Performance**: May have cold start on first request

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for detailed troubleshooting.

## Performance Tips

1. **Choose Pro Plan**: Better timeouts and reduced cold starts
2. **Server Location**: Place V2Ray server close to Vercel regions
3. **Keep Connections Active**: Periodic traffic prevents cold starts
4. **Monitor Usage**: Use Vercel Analytics to track performance

## Monitoring

View logs and analytics:

```bash
# Real-time logs
vercel logs --follow

# Or via Vercel Dashboard
# Project → Deployments → Select deployment → View logs
```

## Cost Breakdown

### Hobby Plan (Free)
- ✅ 100 GB bandwidth/month
- ✅ Suitable for light personal use
- ⚠️ 10-second timeout limit

### Pro Plan ($20/month)
- ✅ 1 TB bandwidth/month
- ✅ 60+ second timeouts
- ✅ Better performance
- ✅ Recommended for regular use

## FAQ

**Q: Will this slow down my connection?**
A: Expect 50-200ms additional latency. Vercel's edge network may actually improve latency if you're far from your server.

**Q: Can Vercel see my V2Ray traffic?**
A: Traffic is encrypted end-to-end. Vercel sees encrypted HTTPS traffic only.

**Q: What if I exceed bandwidth limits?**
A: Vercel will notify you. Upgrade to Pro or add additional bandwidth.

**Q: Can I use this with other V2Ray transports?**
A: This is optimized for xhttp. Other transports may work but aren't tested.

**Q: Is this against Vercel's Terms of Service?**
A: Review Vercel's ToS. This is a standard HTTP reverse proxy use case.

## Contributing

Contributions welcome! Areas for improvement:
- Multi-server routing
- Advanced header manipulation
- Rate limiting
- Monitoring/logging enhancements

## License

This project is provided as-is for educational and personal use.

## Support

- **Issues**: Open an issue on GitHub
- **V2Ray Help**: https://www.v2ray.com/
- **Vercel Help**: https://vercel.com/support

## Related Projects

- [V2Ray](https://www.v2ray.com/) - The V2Ray project
- [v2ray-core](https://github.com/v2fly/v2ray-core) - V2Ray core
- [Vercel](https://vercel.com/) - Deployment platform

---

**⚠️ Important**: Use responsibly and in compliance with all applicable laws and terms of service.
