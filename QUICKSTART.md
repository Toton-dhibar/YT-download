# Quick Start Guide - V2Ray xhttp Vercel Proxy

Get up and running in 5 minutes! ⚡

## Step 1: Deploy to Vercel (2 minutes)

### Option A: One-Click Deploy (Easiest)

1. Click this button: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

2. Import this repository:
   - Paste repository URL: `https://github.com/Toton-dhibar/YT-download`
   - Click "Import"

3. Configure:
   - **Project Name**: `my-v2ray-proxy` (or any name you like)
   - Click "Deploy"

4. Wait ~30 seconds for deployment

5. **Copy your URL**: `https://my-v2ray-proxy.vercel.app`

### Option B: Vercel CLI (For Developers)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd /path/to/this/project
vercel --prod

# Note the deployment URL
```

---

## Step 2: Update V2Ray Client (2 minutes)

### Before (Direct Connection)
```
Server: ra.sdupdates.news
Port: 443
Path: /xhttp
```

### After (Through Vercel CDN)
```
Server: my-v2ray-proxy.vercel.app  ← Change this
Port: 443
Path: /xhttp  ← Keep same
```

### Detailed Changes by Client:

#### v2rayN (Windows)
1. Open v2rayN
2. Right-click server → Edit
3. Change these fields:
   - **Address**: `my-v2ray-proxy.vercel.app`
   - **Host**: `my-v2ray-proxy.vercel.app`
   - **SNI**: `my-v2ray-proxy.vercel.app`
   - Keep everything else the same
4. Save and reconnect

#### V2RayX (macOS)
1. Open V2RayX
2. Edit server configuration
3. Update:
   - **Address**: `my-v2ray-proxy.vercel.app`
   - **ServerName**: `my-v2ray-proxy.vercel.app`
4. Restart connection

#### v2rayNG (Android)
1. Open v2rayNG
2. Tap server → Edit
3. Change:
   - **Address**: `my-v2ray-proxy.vercel.app`
   - **SNI/Host**: `my-v2ray-proxy.vercel.app`
4. Save and reconnect

#### JSON Configuration
Replace in your `config.json`:

```json
{
  "outbounds": [{
    "protocol": "vless",
    "settings": {
      "vnext": [{
        "address": "my-v2ray-proxy.vercel.app",  // Changed
        "port": 443,
        "users": [{
          "id": "your-uuid-here",
          "encryption": "none"
        }]
      }]
    },
    "streamSettings": {
      "network": "xhttp",
      "security": "tls",
      "tlsSettings": {
        "serverName": "my-v2ray-proxy.vercel.app",  // Changed
        "allowInsecure": false
      },
      "xhttpSettings": {
        "path": "/xhttp",
        "host": "my-v2ray-proxy.vercel.app"  // Changed
      }
    }
  }]
}
```

---

## Step 3: Test Connection (1 minute)

### Quick Test

1. **Connect** with your V2Ray client
2. **Check IP**: Visit [https://ipinfo.io](https://ipinfo.io)
   - Should NOT show `ra.sdupdates.news` IP
   - Should show a datacenter IP (routed through proxy)
3. **Test speed**: Visit [https://fast.com](https://fast.com)
   - Should be reasonably fast (depends on Vercel edge location)

### Troubleshooting

❌ **Can't connect?**
- Double-check Vercel URL is correct
- Verify path is `/xhttp` (not `/api/proxy`)
- Check Vercel deployment status (should be "Ready")

❌ **Very slow?**
- Test direct connection speed first
- Compare with proxied speed
- Check Vercel edge location (might be far from you)

❌ **Random disconnections?**
- Check Vercel dashboard for errors
- View function logs in Vercel
- Verify your server (`ra.sdupdates.news`) is stable

---

## Step 4: Verify Setup (Optional)

### Check Vercel Logs

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project → **Functions** tab
3. Click `api/proxy.js`
4. See real-time logs:
   ```
   [Proxy] POST /xhttp/abc123 -> https://ra.sdupdates.news/xhttp/abc123
   [Proxy] Response: 200 OK
   ```

### Test Proxy Directly

```bash
# Should return response from ra.sdupdates.news
curl -I https://my-v2ray-proxy.vercel.app/xhttp
```

---

## ✅ Success Checklist

- [ ] Vercel project deployed and showing "Ready"
- [ ] Deployment URL copied (e.g., `my-v2ray-proxy.vercel.app`)
- [ ] V2Ray client updated with new address
- [ ] Connection successful
- [ ] IP check shows different IP (not real server IP)
- [ ] Speed is acceptable

---

## 🎉 You're Done!

Your V2Ray traffic now routes through Vercel CDN, hiding your real server IP!

### What's Next?

- **Custom Domain**: Add your own domain in Vercel dashboard
- **Monitor Usage**: Check bandwidth usage in Vercel dashboard
- **Read Full Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced configuration

### Need More Help?

- 📖 **Full Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 **Troubleshooting**: [DEPLOYMENT.md#troubleshooting](./DEPLOYMENT.md#troubleshooting)
- ⚙️ **Advanced Config**: [README-VERCEL-PROXY.md](./README-VERCEL-PROXY.md)

---

**Having issues?** See the full troubleshooting guide in [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting).

**Want to customize?** Check [README-VERCEL-PROXY.md](./README-VERCEL-PROXY.md#customization).

🚀 **Enjoy your proxied connection!**
