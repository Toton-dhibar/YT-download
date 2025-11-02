# V2Ray xhttp Vercel CDN Reverse Proxy

🚀 **A production-ready Vercel Edge Function that proxies V2Ray xhttp traffic through Vercel's global CDN.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🎯 What Is This?

This project provides a **reverse proxy** that routes your V2Ray xhttp traffic through **Vercel's CDN**, hiding your real server IP address and leveraging Vercel's 100+ global edge locations.

```
V2Ray Client → Vercel CDN → Your Real Server (ra.sdupdates.news)
```

**Benefits:**
- 🔒 Hide your real server IP from clients
- 🌍 Global CDN with 100+ edge locations
- ⚡ Edge Functions with unlimited timeout
- 🆓 Free SSL certificates
- 📊 Built-in monitoring and logs

---

## ⚡ Quick Start

**Deploy in 5 minutes:**

1. **Deploy to Vercel** → [One-Click Deploy](https://vercel.com/new) or see [QUICKSTART.md](./QUICKSTART.md)
2. **Update V2Ray Client** → Replace server with `your-project.vercel.app`
3. **Connect** → Done! 🎉

**Full guides:**
- 📖 [QUICKSTART.md](./QUICKSTART.md) - Get running in 5 minutes
- 📚 [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- ⚙️ [README-VERCEL-PROXY.md](./README-VERCEL-PROXY.md) - Technical details

---

## 📁 Project Structure

```
.
├── api/
│   └── proxy.js                      # Edge function (proxies to ra.sdupdates.news)
├── vercel.json                       # Vercel configuration
├── package.json                      # Node.js project metadata
├── QUICKSTART.md                     # 5-minute setup guide
├── DEPLOYMENT.md                     # Complete deployment guide
├── README-VERCEL-PROXY.md           # Technical documentation
├── v2ray-client-config-example.json  # Example V2Ray client config
└── .vercelignore                     # Files to exclude from deployment
```

---

## 🔧 Configuration

### Current Setup
- **Target Server**: `ra.sdupdates.news:443`
- **Protocol**: VLESS + xhttp + TLS
- **Path**: `/xhttp`
- **Proxy URL**: `https://<your-project>.vercel.app/xhttp`

### Change Target Server

Edit `api/proxy.js`:
```javascript
const TARGET_SERVER = 'https://your-server.com';
```

Then redeploy to Vercel.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute deployment guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Complete setup with V2Ray config |
| [README-VERCEL-PROXY.md](./README-VERCEL-PROXY.md) | Technical details and customization |
| [v2ray-client-config-example.json](./v2ray-client-config-example.json) | Example client configuration |

---

## ✨ Features

- ✅ **Zero Timeouts**: Edge Functions have no timeout limits
- ✅ **Binary Streaming**: Properly handles xhttp protocol
- ✅ **Header Preservation**: Forwards all required headers
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **No Caching**: Explicitly disables response caching
- ✅ **Global CDN**: Deployed to 100+ edge locations
- ✅ **Automatic HTTPS**: Free SSL certificates

---

## ⚠️ Vercel Limitations

| Feature | Free (Hobby) | Pro |
|---------|--------------|-----|
| Edge Function Timeout | ✅ Unlimited | ✅ Unlimited |
| Bandwidth | 100 GB/month | 1 TB/month |
| Request Body Size | 4.5 MB | 4.5 MB |
| Custom Domain | ✅ Yes | ✅ Yes |

See [DEPLOYMENT.md](./DEPLOYMENT.md#vercel-limitations--considerations) for complete details.

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "502 Bad Gateway" | Check if real server is accessible |
| "Connection Timeout" | Verify path configuration (`/xhttp`) |
| "SSL Error" | Update client SNI to Vercel domain |
| Slow speed | Check Vercel edge location proximity |

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for complete troubleshooting guide.

---

## 🤝 Support

- 📖 **Documentation**: See guides above
- 🔍 **Vercel Logs**: Dashboard → Functions → `api/proxy.js`
- 💬 **Issues**: [GitHub Issues](https://github.com/Toton-dhibar/YT-download/issues)

---

## 📄 License

MIT License - Free to use and modify.

---

## 🚀 Get Started

Ready to deploy? → **[QUICKSTART.md](./QUICKSTART.md)**

Need detailed info? → **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

**Happy Tunneling! 🎉**
