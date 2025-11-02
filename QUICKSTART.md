# Quick Start Guide

Get your V2Ray xhttp proxy running on Vercel in 5 minutes!

## 🚀 Super Quick Deploy (1 Minute)

### Using Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy (from project directory)
cd /path/to/v2ray-xhttp-vercel-proxy
vercel --prod

# 4. Done! Your proxy is live at: https://your-project.vercel.app
```

## 📱 Update Your V2Ray Client (2 Minutes)

### Simple 3-Step Update

1. **Open your V2Ray client** (v2rayN, v2rayNG, etc.)

2. **Edit your server configuration** and change:
   - Address: `your-project.vercel.app` (from deploy output)
   - SNI/Server Name: `your-project.vercel.app`
   - Host: `your-project.vercel.app`
   - Path: `/xhttp` (keep this the same!)
   - Port: `443`

3. **Save and connect!**

### Before & After

**Before (Direct):**
```
Server: ra.sdupdates.news
Path: /xhttp
```

**After (Through Vercel):**
```
Server: your-project.vercel.app
Path: /xhttp
```

## ✅ Test Your Setup (2 Minutes)

### 1. Test Proxy Endpoint
```bash
curl -I https://your-project.vercel.app/xhttp
```

Should return headers (not 404).

### 2. Connect V2Ray Client
- Open your V2Ray client
- Connect to server
- Check connection status (should be green/connected)

### 3. Test Internet Access
```bash
# Check your IP through the proxy
curl ifconfig.me
```

Should show Vercel's IP, not your real IP.

## 🎯 That's It!

Your V2Ray traffic is now routed through Vercel CDN!

## 📚 Need More Details?

- **Full Guide**: See [README.md](README.md)
- **Deployment Options**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Limitations**: See [LIMITATIONS.md](LIMITATIONS.md)
- **Configuration**: See [v2ray-client-config-example.json](v2ray-client-config-example.json)

## ⚠️ Important Notes

1. **Free Tier Limits**: 100GB bandwidth/month, 10 second timeout
2. **Reconnections**: Expect brief reconnects every 10-30 seconds
3. **Best For**: Browsing and light use
4. **Not Ideal For**: 24/7 streaming or large downloads

## 🐛 Quick Troubleshooting

### Can't Connect?
- ✅ Verify deployment succeeded
- ✅ Check `/xhttp` path is correct in client
- ✅ Ensure real server is online

### Getting 404?
- ✅ URL should be: `https://your-project.vercel.app/xhttp`
- ✅ Not: `https://your-project.vercel.app/api/proxy`

### Frequent Disconnects?
- ✅ This is normal due to Vercel timeouts
- ✅ V2Ray will auto-reconnect
- ✅ Consider upgrading to Pro plan

## 🔐 Security Tip

Your real server IP (`ra.sdupdates.news`) is now hidden behind Vercel's CDN! 🎉

## 💡 Pro Tips

1. **Custom Domain**: Add your own domain in Vercel dashboard
2. **Monitor Usage**: Check Vercel analytics regularly
3. **Multiple Proxies**: Deploy multiple projects to distribute load
4. **Upgrade Plan**: If using heavily, upgrade to Pro for better limits

## 🎊 You're Done!

Enjoy your V2Ray proxy through Vercel CDN!

Need help? Check the full documentation in [README.md](README.md).
