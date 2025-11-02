# Vercel V2Ray xhttp Reverse Proxy Setup

This project provides a complete Vercel-based reverse proxy solution for V2Ray xhttp servers. It allows you to route your V2Ray traffic through Vercel's CDN to hide your real server IP address.

## 🎯 What This Does

- Forwards all traffic from `https://your-project.vercel.app/xhttp/*` to `https://ra.sdupdates.news/xhttp/*`
- Hides your real server IP by using Vercel's CDN as an intermediary
- Passes all headers, methods, and request bodies transparently
- Supports all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Compatible with V2Ray's xhttp protocol over TLS

## 📁 Project Structure

```
.
├── api/
│   └── proxy.js          # Edge Function that handles the proxying
├── vercel.json           # Vercel configuration
├── package.json          # Project metadata
└── VERCEL-PROXY-SETUP.md # This file
```

## 🚀 Deployment Instructions

### Step 1: Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. The Vercel CLI installed (optional but recommended):
   ```bash
   npm install -g vercel
   ```
3. Your V2Ray server already running at `ra.sdupdates.news:443` with xhttp protocol

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI (Recommended)

1. Clone or download this repository:
   ```bash
   git clone <your-repo-url>
   cd YT-download
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel --prod
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account/team
   - Link to existing project? **N** (unless you're updating)
   - What's your project's name? Enter a name (e.g., `v2ray-proxy`)
   - In which directory is your code located? `.` (current directory)

5. After deployment, you'll get a URL like: `https://v2ray-proxy.vercel.app`

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
4. Click **Deploy**

### Step 3: Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain (e.g., `proxy.yourdomain.com`)
4. Follow Vercel's instructions to configure DNS

## 🔧 Configuration

### Changing the Target Server

If you want to proxy to a different server, edit `api/proxy.js`:

```javascript
// Change this line:
const targetUrl = `https://ra.sdupdates.news${url.pathname}${url.search}`;

// To your server:
const targetUrl = `https://your-server.com${url.pathname}${url.search}`;

// And update the Host header:
headers.set('Host', 'your-server.com');
```

### Adjusting Timeout

Vercel Edge Functions have a 25-second maximum execution time. This is configured in `vercel.json`:

```json
{
  "functions": {
    "api/proxy.js": {
      "maxDuration": 25
    }
  }
}
```

For longer connections, consider using Vercel Pro (60s timeout) or Enterprise plans.

## 📱 V2Ray Client Configuration

### Before (Direct Connection)

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

### After (Through Vercel Proxy)

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
1. `address`: Change from `ra.sdupdates.news` to `your-project.vercel.app`
2. `tlsSettings.serverName`: Change to your Vercel domain
3. `xhttpSettings.host`: Change to your Vercel domain
4. `xhttpSettings.path`: Keep as `/xhttp` (same as before)

### V2RayN/V2RayNG Client Configuration

If you're using a GUI client like V2RayN (Windows) or V2RayNG (Android):

1. **Address/Server**: `your-project.vercel.app`
2. **Port**: `443`
3. **User ID**: Your existing UUID
4. **Network**: `xhttp`
5. **TLS**: `tls` (enabled)
6. **SNI/ServerName**: `your-project.vercel.app`
7. **Path**: `/xhttp`
8. **Host**: `your-project.vercel.app`

## ⚠️ Vercel Limitations & Considerations

### 1. **Timeout Limitations**
- **Free/Hobby**: 25 seconds per request
- **Pro**: 60 seconds per request
- **Enterprise**: 900 seconds per request

**Impact**: Long-running connections may be terminated. xhttp uses regular HTTP requests, so this is usually not an issue for normal traffic.

### 2. **Request Size Limits**
- Maximum request body size: **4.5 MB**
- Maximum response size: **4.5 MB**

**Impact**: Large file transfers through the proxy may fail. For file transfers, consider using direct connections or split transfers.

### 3. **Bandwidth Limits**
- **Free/Hobby**: 100 GB/month
- **Pro**: 1 TB/month

**Impact**: Heavy usage may require upgrading to a paid plan.

### 4. **WebSocket Support**
- Vercel Edge Functions **DO NOT** support WebSocket connections
- xhttp protocol uses standard HTTP/HTTPS, so this is **NOT a problem**

### 5. **Geographic Routing**
- Vercel's CDN automatically routes to the nearest edge location
- Your traffic goes: Client → Vercel Edge → Origin Server
- This adds latency but provides IP masking

### 6. **Rate Limiting**
- Vercel has rate limits on requests per second
- Excessive traffic may be throttled

### 7. **HTTPS Only**
- All traffic through Vercel is HTTPS
- HTTP requests are automatically upgraded to HTTPS

## 🔍 Testing Your Setup

### 1. Test Basic Connectivity

```bash
curl -I https://your-project.vercel.app/xhttp
```

You should see a response from your V2Ray server (might be an error if authentication is required, but connection should work).

### 2. Test with V2Ray Client

1. Update your V2Ray client configuration as shown above
2. Start your V2Ray client
3. Test internet connectivity
4. Check V2Ray logs for connection status

### 3. Verify IP Masking

Visit a "What's my IP" website:
- Before: Shows your V2Ray server IP
- After: Shows a Vercel CDN IP

## 🐛 Troubleshooting

### Issue: "502 Bad Gateway"
- **Cause**: Target server (`ra.sdupdates.news`) is unreachable
- **Solution**: Verify your V2Ray server is running and accessible

### Issue: "504 Gateway Timeout"
- **Cause**: Request took longer than 25 seconds
- **Solution**: Upgrade to Vercel Pro for 60s timeout, or optimize your server

### Issue: Connection works but is slow
- **Cause**: Added latency from CDN routing
- **Solution**: This is expected behavior; direct connection will always be faster

### Issue: "413 Payload Too Large"
- **Cause**: Request/response exceeds 4.5 MB
- **Solution**: Use direct connection for large transfers

### Issue: Client can't connect
- **Cause**: Incorrect client configuration
- **Solution**: Double-check domain names, paths, and TLS settings match exactly

## 🔒 Security Considerations

1. **IP Masking**: Your server IP is hidden from clients, but Vercel can see it
2. **TLS**: All traffic is encrypted end-to-end
3. **Logs**: Vercel logs requests; consider this for privacy
4. **DDoS Protection**: Vercel provides some DDoS protection
5. **Firewall**: Consider restricting your origin server to only accept connections from Vercel IPs

## 📊 Monitoring

Check your proxy status:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View **Analytics** and **Logs** tabs
4. Monitor bandwidth usage and errors

## 🔄 Updating Configuration

To update the proxy configuration:

```bash
# Make changes to api/proxy.js or vercel.json
vercel --prod
```

Changes are deployed in seconds!

## 📞 Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- V2Ray Documentation: [v2ray.com](https://www.v2ray.com/)
- Check Vercel logs for errors: `vercel logs`

## 📝 License

This configuration is provided as-is for educational purposes. Use responsibly and in compliance with all applicable laws and Vercel's Terms of Service.

---

**Note**: This setup uses Vercel's Edge Functions which run on Cloudflare Workers infrastructure. Performance and availability depend on Vercel's infrastructure.
