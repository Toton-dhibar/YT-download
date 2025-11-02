# V2Ray xhttp Vercel Reverse Proxy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Toton-dhibar/YT-download)

A production-ready Vercel Edge Function that acts as a reverse proxy for V2Ray xhttp servers, hiding your real server IP behind Vercel's global CDN infrastructure.

## 🎯 Features

- ✅ **IP Masking**: Hide your V2Ray server IP using Vercel's CDN
- ✅ **Full Protocol Support**: Compatible with V2Ray's xhttp protocol over TLS
- ✅ **Edge Functions**: Fast, globally distributed with low latency
- ✅ **Zero Configuration**: Deploy in 2 minutes
- ✅ **HTTPS by Default**: Automatic SSL/TLS encryption
- ✅ **Transparent Proxying**: Forwards all headers, methods, and bodies
- ✅ **Free Tier Available**: 100GB bandwidth/month on Vercel Hobby plan

## 📋 Quick Start

### 1. Deploy to Vercel

**Option A: One-Click Deploy**
```
Click the "Deploy with Vercel" button above → Sign in → Deploy
```

**Option B: CLI Deploy**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option C: Git Integration**
```
Fork this repo → Import to Vercel → Deploy
```

### 2. Get Your Deployment URL

After deployment, you'll receive a URL like:
```
https://your-project.vercel.app
```

### 3. Update V2Ray Client

Change these settings in your V2Ray client:

| Setting | From | To |
|---------|------|-----|
| **Address** | `ra.sdupdates.news` | `your-project.vercel.app` |
| **Port** | `443` | `443` |
| **Path** | `/xhttp` | `/xhttp` |
| **TLS/SNI** | `ra.sdupdates.news` | `your-project.vercel.app` |
| **Host** | `ra.sdupdates.news` | `your-project.vercel.app` |

### 4. Test Connection

```bash
# Test proxy endpoint
curl -I https://your-project.vercel.app/xhttp

# Connect with your V2Ray client
```

## 📁 Project Structure

```
.
├── api/
│   └── proxy.js                 # Edge Function - handles all proxying
├── vercel.json                  # Vercel configuration
├── package.json                 # Project metadata
├── VERCEL-PROXY-SETUP.md       # Complete setup guide
├── DEPLOYMENT.md                # Quick deployment guide
├── v2ray-client-examples.json  # Client configuration examples
└── README.md                    # This file
```

## 📖 Documentation

- **[Complete Setup Guide](./VERCEL-PROXY-SETUP.md)** - Detailed configuration, troubleshooting, limitations
- **[Deployment Guide](./DEPLOYMENT.md)** - Quick deployment instructions
- **[Client Examples](./v2ray-client-examples.json)** - V2Ray client configuration examples

## 🔧 Configuration

### Change Target Server

Edit `api/proxy.js` (lines 34 and 48):

```javascript
// Change target URL
const targetUrl = `https://YOUR-SERVER.com${url.pathname}${url.search}`;

// Change Host header
headers.set('Host', 'YOUR-SERVER.com');
```

Then redeploy:
```bash
vercel --prod
```

### Adjust Routing

Edit `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/your-path/:path*", "destination": "/api/proxy" }
  ]
}
```

## ⚠️ Vercel Limitations

| Limitation | Free/Hobby | Pro | Impact |
|------------|------------|-----|--------|
| **Timeout** | 25s | 60s | Long requests may timeout |
| **Request Size** | 4.5 MB | 4.5 MB | Large transfers may fail |
| **Bandwidth** | 100 GB/mo | 1 TB/mo | Heavy usage needs paid plan |
| **WebSocket** | ❌ Not supported | ❌ Not supported | xhttp uses HTTP (✅ works) |

**Note**: xhttp protocol uses standard HTTP/HTTPS, not WebSockets, so it works perfectly with Vercel Edge Functions.

## 🧪 Testing

### Test Proxy Connectivity
```bash
curl -I https://your-project.vercel.app/xhttp
```

### Test with V2Ray Client
1. Update client configuration with Vercel domain
2. Start V2Ray client
3. Test internet access
4. Verify IP is masked (check "what's my IP" website)

### Check Logs
```bash
vercel logs
```

## 🔍 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 502 Bad Gateway | Target server down | Check V2Ray server status |
| 504 Timeout | Request > 25s | Upgrade to Pro or optimize |
| Slow connection | CDN latency | Expected; direct is faster |
| Can't connect | Wrong config | Verify domain/path/TLS settings |

See [VERCEL-PROXY-SETUP.md](./VERCEL-PROXY-SETUP.md) for detailed troubleshooting.

## 🔒 Security & Privacy

- ✅ **IP Hidden**: Your server IP is masked by Vercel's CDN
- ✅ **End-to-End TLS**: All traffic encrypted
- ⚠️ **Vercel Can See Traffic**: Vercel logs requests (privacy consideration)
- ✅ **DDoS Protection**: Basic protection from Vercel infrastructure

## 📊 Monitoring

View your deployment metrics:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Check **Analytics** for bandwidth and requests
4. View **Logs** for errors and debugging

## 🚀 Advanced Usage

### Custom Domain
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `proxy.yourdomain.com`)
3. Configure DNS as instructed
4. Update V2Ray client with your custom domain

### Multiple Target Servers
Create separate Edge Functions:
- `api/proxy1.js` → Server 1
- `api/proxy2.js` → Server 2

Configure routing in `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/server1/:path*", "destination": "/api/proxy1" },
    { "source": "/server2/:path*", "destination": "/api/proxy2" }
  ]
}
```

## 📞 Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **V2Ray Docs**: [v2ray.com](https://www.v2ray.com/)
- **Issues**: [GitHub Issues](https://github.com/Toton-dhibar/YT-download/issues)

## 📄 License

MIT License - Use freely for personal or commercial projects.

## ⚡ Performance Tips

1. **Use Vercel Pro** for longer timeouts (60s vs 25s)
2. **Enable Caching** for static responses (if applicable)
3. **Monitor Bandwidth** to avoid overages
4. **Use Custom Domain** for better reliability
5. **Consider Multiple Deployments** for redundancy

## 🎓 How It Works

```
Client (V2Ray)
    ↓ HTTPS (TLS)
Vercel Edge Function (CDN)
    ↓ HTTPS (TLS)
Your V2Ray Server (ra.sdupdates.news)
```

The proxy:
1. Receives requests from V2Ray clients at `/xhttp/*`
2. Forwards them to `ra.sdupdates.news/xhttp/*`
3. Returns responses back to clients
4. All traffic is encrypted end-to-end with TLS

---

**Made with ❤️ for the V2Ray community**

Deploy now → Get your server IP protected in 2 minutes! 🚀
