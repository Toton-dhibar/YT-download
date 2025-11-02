# V2Ray xhttp Vercel CDN Proxy

A Vercel Edge Function that acts as a reverse proxy/CDN for V2Ray xhttp protocol traffic. This setup allows you to hide your real V2Ray server IP by routing all traffic through Vercel's CDN.

## 📋 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Deploy in 5 minutes! Start here! ⚡
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Detailed deployment guide (3 methods)
- **[LIMITATIONS.md](LIMITATIONS.md)** - Vercel limitations and considerations
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - How the proxy works under the hood
- **[PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)** - Detailed file structure explanation
- **[v2ray-client-config-example.json](v2ray-client-config-example.json)** - Full V2Ray client config example

## 📁 Project Structure

```
.
├── api/
│   └── proxy.js                       # Edge Function that forwards xhttp traffic
├── vercel.json                        # Vercel deployment configuration
├── package.json                       # Project metadata
├── v2ray-client-config-example.json   # V2Ray client config example
├── README.md                          # This file (main documentation)
├── QUICKSTART.md                      # 5-minute quick start guide
├── DEPLOYMENT.md                      # Detailed deployment instructions
├── LIMITATIONS.md                     # Vercel limitations explained
├── ARCHITECTURE.md                    # System architecture details
└── PROJECT-STRUCTURE.md               # File structure explanation
```

## 🎯 What This Does

- **Real V2Ray Server**: `ra.sdupdates.news:443`
- **Protocol**: VLESS with xhttp + TLS
- **Path**: `/xhttp`
- **Vercel Proxy**: Routes all requests from `https://your-project.vercel.app/xhttp/*` → `https://ra.sdupdates.news/xhttp/*`

## 🚀 Deployment Instructions

### Prerequisites

1. A Vercel account (free tier works)
2. Vercel CLI installed (optional but recommended)
3. Git installed

### Method 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd /path/to/this/project
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (e.g., v2ray-xhttp-proxy)
# - In which directory is your code located? ./
# - Want to modify settings? No

# Production deployment
vercel --prod
```

### Method 2: Deploy via GitHub Integration

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
6. Click "Deploy"

### Method 3: Deploy via Vercel Dashboard

1. Zip this project directory
2. Go to [vercel.com/new](https://vercel.com/new)
3. Click "Deploy" and drag & drop the zip file
4. Wait for deployment to complete

## 🔧 Configuration

### Update Target Server

If you need to change the target V2Ray server, edit `api/proxy.js`:

```javascript
// Change this line to your server
const targetUrl = `https://YOUR-SERVER.com/xhttp${path}${search}`;

// And update the host header
forwardHeaders.set('host', 'YOUR-SERVER.com');
```

### Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Navigate to Settings → Domains
3. Add your custom domain (e.g., `v2ray.yourdomain.com`)
4. Follow DNS configuration instructions from Vercel
5. Wait for DNS propagation (usually 5-30 minutes)

## 📱 V2Ray Client Configuration

After deployment, update your V2Ray client to use the Vercel proxy:

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
                "id": "YOUR-UUID-HERE",
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

### Updated Configuration (Through Vercel CDN)
```json
{
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "your-project.vercel.app",
            "port": 443,
            "users": [
              {
                "id": "YOUR-UUID-HERE",
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
          "serverName": "your-project.vercel.app",
          "allowInsecure": false
        },
        "xhttpSettings": {
          "path": "/xhttp",
          "host": "your-project.vercel.app"
        }
      }
    }
  ]
}
```

**Key Changes:**
- `address`: Change from `ra.sdupdates.news` to `your-project.vercel.app`
- `tlsSettings.serverName`: Update to your Vercel domain
- `xhttpSettings.host`: Update to your Vercel domain
- `xhttpSettings.path`: Keep as `/xhttp` (same as before)

### Popular V2Ray Clients Configuration

#### v2rayN (Windows)
1. Edit your server configuration
2. Change "Address" to `your-project.vercel.app`
3. Change "SNI" to `your-project.vercel.app`
4. Keep "Path" as `/xhttp`
5. Save and test connection

#### v2rayNG (Android)
1. Edit server configuration
2. Update "Address" field to `your-project.vercel.app`
3. Update "SNI" field to `your-project.vercel.app`
4. Keep "Path" as `/xhttp`
5. Save configuration

#### Shadowrocket (iOS)
1. Edit server
2. Change "Server" to `your-project.vercel.app`
3. Update "Peer Name" to `your-project.vercel.app`
4. Keep "Path" as `/xhttp`
5. Save

## ⚠️ Vercel Limitations and Considerations

### 1. **Timeout Limits**
- **Free/Hobby**: 10 seconds execution timeout for Edge Functions
- **Pro**: 30 seconds execution timeout
- **Enterprise**: 900 seconds execution timeout
- **Impact**: Long-lived xhttp connections may be terminated. V2Ray should handle reconnection automatically, but you might experience brief disconnections.

### 2. **Bandwidth Limits**
- **Free/Hobby**: 100 GB/month bandwidth
- **Pro**: 1 TB/month bandwidth
- **Enterprise**: Custom limits
- **Impact**: Heavy usage might exceed free tier limits

### 3. **Request Size Limits**
- Maximum request body size: **4.5 MB** (Edge Functions)
- Maximum response size: **4.5 MB** (Edge Functions)
- **Impact**: Large file transfers through V2Ray might fail

### 4. **Header Restrictions**
- Some headers are automatically stripped by Vercel's CDN
- Connection-specific headers (like `Connection`, `Keep-Alive`) are managed by Vercel
- **Impact**: Generally transparent for V2Ray xhttp protocol

### 5. **Rate Limiting**
- Vercel applies rate limiting to prevent abuse
- Exact limits vary by plan and are not publicly documented
- **Impact**: Aggressive traffic patterns might trigger rate limits

### 6. **Cold Starts**
- Edge Functions have minimal cold start time (~50-100ms)
- **Impact**: First request after idle period might be slightly slower

### 7. **Geographic Distribution**
- Edge Functions run on Vercel's global CDN
- Automatically routed to nearest edge location
- **Impact**: Usually improves latency, but adds one extra hop

## 🔍 Testing Your Setup

### 1. Test Proxy Endpoint
```bash
# Test if the proxy is working
curl -I https://your-project.vercel.app/xhttp

# Should return headers from ra.sdupdates.news
```

### 2. Test with V2Ray Client
1. Update your client configuration as shown above
2. Connect to the server
3. Check connection status
4. Test internet connectivity through the tunnel

### 3. Monitor Vercel Logs
```bash
# Using Vercel CLI
vercel logs your-project.vercel.app

# Or check in Vercel dashboard
# Project → Deployments → [Latest] → Runtime Logs
```

## 🐛 Troubleshooting

### Connection Fails
- Verify Vercel deployment is successful
- Check that `your-project.vercel.app/xhttp` is accessible
- Ensure your real V2Ray server (`ra.sdupdates.news`) is online
- Verify UUID and other credentials are correct

### Frequent Disconnections
- This is expected due to Vercel's timeout limits
- V2Ray should automatically reconnect
- Consider upgrading to Vercel Pro for longer timeouts

### Slow Performance
- Check Vercel deployment region matches your location
- Use custom domain with better DNS
- Consider upgrading Vercel plan for better performance

### 502 Bad Gateway
- Check Vercel function logs for errors
- Verify target server is accessible from Vercel's edge network
- Ensure SSL certificates on target server are valid

## 📊 Monitoring

Monitor your proxy usage in Vercel dashboard:
1. Go to your project dashboard
2. Click "Analytics" tab
3. View:
   - Request count
   - Bandwidth usage
   - Error rates
   - Response times

## 🔐 Security Notes

1. **TLS Encryption**: All traffic between client → Vercel and Vercel → server is encrypted
2. **IP Hiding**: Your real server IP is hidden behind Vercel's CDN
3. **DDoS Protection**: Benefit from Vercel's infrastructure protection
4. **No Logging**: This proxy doesn't log traffic content (check Vercel's privacy policy for access logs)

## 📚 Additional Resources

- [Vercel Edge Functions Documentation](https://vercel.com/docs/functions/edge-functions)
- [V2Ray Documentation](https://www.v2ray.com/)
- [xhttp Protocol Specification](https://github.com/v2ray/v2ray-core)

## 🤝 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify your V2Ray server is accessible
3. Test with curl/postman first
4. Review V2Ray client logs

## 📄 License

This project is provided as-is for educational purposes.
