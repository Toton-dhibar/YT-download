# V2Ray Vercel Proxy - Complete Project Structure

## 📁 File Tree

```
YT-download/
├── api/
│   └── proxy.js                    # Edge Function - Main proxy handler
│
├── .gitignore                      # Git ignore rules
├── .vercelignore                   # Vercel deployment ignore rules
├── vercel.json                     # Vercel configuration (routes, timeouts)
├── package.json                    # NPM package metadata
│
├── README.md                       # Main project documentation
├── DEPLOYMENT.md                   # Quick deployment guide
├── VERCEL-PROXY-SETUP.md          # Complete setup & troubleshooting guide
├── PROJECT-STRUCTURE.md           # This file
└── v2ray-client-examples.json     # V2Ray client configuration examples
```

## 📄 File Descriptions

### Core Files

#### `api/proxy.js`
**Purpose**: Vercel Edge Function that handles all proxying logic  
**Runtime**: Edge Runtime (Cloudflare Workers)  
**Key Features**:
- Forwards requests from `/xhttp/*` to `https://ra.sdupdates.news/xhttp/*`
- Preserves all HTTP methods, headers, and request bodies
- Handles streaming responses
- Proper error handling with JSON error responses
- 25-second timeout (configurable with Vercel Pro)

**Configuration Points**:
```javascript
// Line 26: Target server URL
const targetUrl = `https://ra.sdupdates.news${url.pathname}${url.search}`;

// Line 48: Target host header
headers.set('Host', 'ra.sdupdates.news');
```

#### `vercel.json`
**Purpose**: Vercel platform configuration  
**Key Settings**:
```json
{
  "functions": {
    "api/proxy.js": {
      "maxDuration": 25        // Max execution time in seconds
    }
  },
  "rewrites": [
    {
      "source": "/xhttp/:path*",   // Match incoming path
      "destination": "/api/proxy"   // Route to Edge Function
    }
  ],
  "headers": [                      // Add custom headers
    {
      "source": "/xhttp/:path*",
      "headers": [
        { "key": "X-Proxy-By", "value": "Vercel-CDN" }
      ]
    }
  ]
}
```

**What to modify**:
- Change `source` pattern if using different path (e.g., `/mypath/:path*`)
- Adjust `maxDuration` if using Vercel Pro (up to 60s) or Enterprise (up to 900s)

#### `package.json`
**Purpose**: NPM package metadata and scripts  
**Scripts**:
- `npm run dev`: Start local Vercel dev server
- `npm run deploy`: Deploy to production

### Documentation Files

#### `README.md`
**Purpose**: Main project page with quick start  
**Contains**:
- Feature overview
- Quick deployment options (3 methods)
- Configuration examples
- Limitations table
- Troubleshooting quick reference
- Links to detailed docs

#### `DEPLOYMENT.md`
**Purpose**: Step-by-step deployment instructions  
**Contains**:
- One-click deploy button
- CLI deployment steps
- Git integration method
- Post-deployment checklist
- Quick testing commands

#### `VERCEL-PROXY-SETUP.md`
**Purpose**: Comprehensive setup and configuration guide  
**Contains**:
- Complete project structure explanation
- Detailed deployment instructions
- Full V2Ray client configuration examples
- Vercel limitations detailed breakdown
- Extensive troubleshooting section
- Security considerations
- Monitoring instructions

#### `v2ray-client-examples.json`
**Purpose**: Ready-to-use V2Ray client configurations  
**Contains**:
- Direct connection config (for reference)
- Vercel proxy connection config (to use)
- V2RayN/V2RayNG GUI settings
- VLESS share link format
- Clash Meta configuration

**Usage**:
1. Find your client type (V2Ray core, V2RayN, Clash, etc.)
2. Copy the corresponding configuration
3. Replace `YOUR-UUID-HERE` with your actual UUID
4. Replace `your-project.vercel.app` with your Vercel domain
5. Import/paste into your client

### Configuration Files

#### `.gitignore`
**Purpose**: Exclude files from Git repository  
**Excludes**:
- Python virtual environments
- Node.js modules
- Vercel build artifacts (`.vercel/`)
- OS-specific files
- IDE configuration

#### `.vercelignore`
**Purpose**: Exclude files from Vercel deployment  
**Excludes**:
- Backend Flask code (not needed for proxy)
- Web frontend (not needed for proxy)
- Development files
- README (not needed at runtime)
- Archive files

**Why separate from .gitignore?**
- Git tracks development files
- Vercel only deploys production files
- Reduces deployment size and time

## 🔧 How to Customize

### Change Target Server

Edit `api/proxy.js`:

```javascript
// Line 26
const targetUrl = `https://YOUR-SERVER.com${url.pathname}${url.search}`;

// Line 48
headers.set('Host', 'YOUR-SERVER.com');
```

### Change Path Prefix

Edit `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/yourpath/:path*",
      "destination": "/api/proxy"
    }
  ]
}
```

And update `api/proxy.js` if needed to handle path transformation.

### Add Multiple Target Servers

1. Create `api/proxy2.js` (copy from `proxy.js`)
2. Change target URL in `proxy2.js`
3. Add new rewrite in `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/xhttp/:path*", "destination": "/api/proxy" },
    { "source": "/xhttp2/:path*", "destination": "/api/proxy2" }
  ]
}
```

### Add Authentication

Edit `api/proxy.js`, add before `const targetUrl`:

```javascript
// Check for auth token
const authToken = req.headers.get('authorization');
if (authToken !== 'Bearer your-secret-token') {
  return new Response('Unauthorized', { status: 401 });
}
```

## 🚀 Deployment Workflow

```
Local Changes
    ↓
Git Commit
    ↓
Git Push (optional)
    ↓
vercel --prod
    ↓
Vercel builds & deploys
    ↓
Live at https://your-project.vercel.app
```

**Time**: ~30 seconds from command to live

## 📊 Request Flow

```
V2Ray Client
    ↓
    ├─ Address: your-project.vercel.app
    ├─ Port: 443 (HTTPS)
    ├─ Path: /xhttp
    ├─ TLS: Enabled
    └─ SNI: your-project.vercel.app
    
Vercel Edge Network (Global CDN)
    ↓
    ├─ Edge Function: api/proxy.js
    ├─ Runtime: Cloudflare Workers
    ├─ Timeout: 25 seconds
    └─ Rewrites: /xhttp/* → /api/proxy
    
Target Server
    ↓
    ├─ Address: ra.sdupdates.news
    ├─ Port: 443 (HTTPS)
    ├─ Path: /xhttp
    ├─ TLS: Enabled
    └─ Protocol: V2Ray xhttp
    
Response flows back through same path
```

## 🔍 Debugging

### View Logs
```bash
vercel logs
vercel logs --follow
```

### Test Locally
```bash
vercel dev
# Access at http://localhost:3000
```

### Test Proxy Endpoint
```bash
curl -I https://your-project.vercel.app/xhttp
```

### Check Deployment Status
```bash
vercel ls
vercel inspect [deployment-url]
```

## 📦 Deployment Size

Minimal deployment:
- `api/proxy.js`: ~3 KB
- `vercel.json`: ~0.5 KB
- **Total**: <5 KB

Fast deployments and minimal bandwidth usage!

## 🎯 What Gets Deployed

Only these files are deployed to Vercel:
- ✅ `api/proxy.js` - The Edge Function
- ✅ `vercel.json` - Configuration
- ❌ Documentation files (excluded by `.vercelignore`)
- ❌ Backend/frontend code (excluded by `.vercelignore`)
- ❌ Development files

## 🔐 Security Notes

1. **API Key**: This proxy has no authentication by default
   - Anyone with your URL can use it
   - Consider adding authentication if needed

2. **Rate Limiting**: Vercel provides basic rate limiting
   - Protect against excessive usage
   - Monitor in Vercel dashboard

3. **IP Exposure**: Your origin server IP is hidden from clients
   - But visible to Vercel
   - Consider firewall rules to only allow Vercel IPs

4. **Logging**: Vercel logs all requests
   - Privacy consideration
   - Logs available in dashboard

## 📈 Scaling Considerations

| Metric | Free/Hobby | Pro | Enterprise |
|--------|------------|-----|------------|
| Bandwidth | 100 GB/mo | 1 TB/mo | Custom |
| Timeout | 25s | 60s | 900s |
| Requests | Unlimited* | Unlimited* | Unlimited* |
| Edge Locations | Global | Global | Global |

*Subject to fair use and rate limits

## 🆘 Common Issues

### Issue: 404 Not Found
**Fix**: Check `vercel.json` rewrite rules match your path

### Issue: 502 Bad Gateway
**Fix**: Verify target server is accessible: `curl https://ra.sdupdates.news/xhttp`

### Issue: 504 Timeout
**Fix**: Upgrade to Pro for 60s timeout, or optimize backend

### Issue: Large Response Fails
**Fix**: Responses >4.5MB are not supported, use direct connection for large transfers

## 💡 Pro Tips

1. **Use Environment Variables**: Store target URL in Vercel environment variables
2. **Enable Analytics**: Turn on Vercel Analytics for usage insights
3. **Custom Domain**: More professional and memorable
4. **Multiple Deployments**: Create separate projects for staging/production
5. **Monitoring**: Set up Vercel notifications for errors

## 📚 Additional Resources

- [Vercel Edge Functions Docs](https://vercel.com/docs/concepts/functions/edge-functions)
- [V2Ray Documentation](https://www.v2ray.com/)
- [Vercel Limits](https://vercel.com/docs/concepts/limits/overview)

---

**Last Updated**: 2025-11-02  
**Version**: 1.0.0  
**Maintainer**: Toton-dhibar
