# V2Ray xhttp Vercel CDN Reverse Proxy

A production-ready Vercel Edge Function that acts as a reverse proxy for V2Ray xhttp protocol traffic, routing all requests through Vercel's global CDN to hide your real server IP address.

## 🚀 Quick Start

1. **Deploy to Vercel**: Click the button below or follow [DEPLOYMENT.md](./DEPLOYMENT.md)

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FToton-dhibar%2FYT-download)

2. **Update V2Ray Client**: Replace server address with your Vercel URL
   ```
   ra.sdupdates.news → your-project.vercel.app
   ```

3. **Connect**: Your traffic now routes through Vercel CDN! 🎉

## 📖 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Complete deployment guide
  - Step-by-step Vercel deployment instructions
  - V2Ray client configuration examples
  - Vercel limitations and considerations
  - Troubleshooting guide

- **[v2ray-client-config-example.json](./v2ray-client-config-example.json)**: Example V2Ray client configuration

## 🏗️ Project Structure

```
.
├── api/
│   └── proxy.js                      # Edge function for proxying requests
├── vercel.json                       # Vercel configuration
├── DEPLOYMENT.md                     # Comprehensive deployment guide
├── v2ray-client-config-example.json  # Example V2Ray client config
└── README-VERCEL-PROXY.md           # This file
```

## ✨ Features

- ✅ **Zero Timeouts**: Uses Vercel Edge Functions (no timeout limits)
- ✅ **Global CDN**: Deployed to 100+ edge locations worldwide
- ✅ **Automatic HTTPS**: Free SSL certificates via Vercel
- ✅ **Binary Streaming**: Properly handles xhttp protocol binary data
- ✅ **Header Preservation**: Forwards all required headers
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **No Caching**: Explicitly disables response caching
- ✅ **Protocol Support**: Works with VLESS + xhttp + TLS

## 🎯 How It Works

```
┌──────────────┐      HTTPS       ┌─────────────────┐      HTTPS       ┌────────────────┐
│  V2Ray       │ ──────────────▶  │  Vercel CDN     │ ──────────────▶  │  Real Server   │
│  Client      │   (TLS/xhttp)    │  Edge Network   │   (TLS/xhttp)    │  ra.sdupdates  │
│              │ ◀──────────────  │                 │ ◀──────────────  │     .news      │
└──────────────┘                  └─────────────────┘                  └────────────────┘
```

**Benefits:**
- 🔒 Hides your real server IP from clients
- 🌍 Reduces latency via global edge network
- 🛡️ Additional layer of privacy and security
- 📊 Free SSL certificates and CDN

## 🔧 Configuration

### Server Information
- **Target Server**: `ra.sdupdates.news`
- **Protocol**: VLESS
- **Transport**: xhttp
- **Path**: `/xhttp`
- **Port**: `443`
- **TLS**: Required

### Vercel Proxy
- **Runtime**: Edge Functions
- **Endpoint**: `https://<your-project>.vercel.app/xhttp`
- **Method**: Forwards all traffic to real server
- **Caching**: Disabled

## ⚙️ Customization

### Change Target Server

Edit `api/proxy.js`:
```javascript
const TARGET_SERVER = 'https://your-server.com';
```

### Change Path

Edit both `api/proxy.js` and `vercel.json` to match your xhttp path:

**vercel.json**:
```json
{
  "rewrites": [
    {
      "source": "/your-custom-path/:path*",
      "destination": "/api/proxy"
    }
  ]
}
```

### Add Authentication

Add custom headers in `api/proxy.js`:
```javascript
headers.set('Authorization', 'Bearer your-token');
```

## 📊 Monitoring

View real-time logs in Vercel Dashboard:
1. Go to your project → Functions tab
2. Select `api/proxy.js`
3. View logs with `[Proxy]` prefix

Example logs:
```
[Proxy] POST /xhttp/abc123 -> https://ra.sdupdates.news/xhttp/abc123
[Proxy] Response: 200 OK
```

## ⚠️ Important Limitations

| Feature | Limit |
|---------|-------|
| Edge Function Timeout | None (unlimited) ✅ |
| Request Body Size | 4.5 MB |
| Bandwidth (Free) | 100 GB/month |
| Bandwidth (Pro) | 1 TB/month |

See [DEPLOYMENT.md](./DEPLOYMENT.md#vercel-limitations--considerations) for complete details.

## 🐛 Troubleshooting

### "502 Bad Gateway"
- Check if `ra.sdupdates.news` is accessible
- Verify xhttp path configuration
- Check Vercel function logs

### "Connection Timeout"
- Verify client configuration (path, host, SNI)
- Test direct connection first
- Check server-side logs

### Slow Performance
- Test latency: `ping your-project.vercel.app`
- Compare direct vs proxied speed
- Check Vercel edge location proximity

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for complete troubleshooting guide.

## 🔒 Security Considerations

- ✅ All traffic encrypted via TLS 1.2/1.3
- ✅ Real server IP hidden from clients
- ✅ Vercel provides automatic DDoS protection
- ⚠️ Vercel may log request metadata (not content)
- ⚠️ Never commit UUIDs/secrets to public repos

## 📄 License

MIT License - See repository for details.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📞 Support

- **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **V2Ray Docs**: [v2ray.com](https://www.v2ray.com/)

---

**Ready to deploy?** → See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

**Need help?** → Check the troubleshooting section in [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting).

🚀 **Happy tunneling!**
