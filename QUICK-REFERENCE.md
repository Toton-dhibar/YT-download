# Quick Reference Card

## 🚀 Deploy in 3 Commands

```bash
npm install -g vercel
vercel login
vercel --prod
```

**You'll get:** `https://your-project.vercel.app`

---

## 📝 Client Config Changes

| Setting | Change To |
|---------|-----------|
| **address** | `your-project.vercel.app` |
| **host** | `your-project.vercel.app` |
| **serverName/SNI** | `your-project.vercel.app` |
| **path** | `/xhttp` (no change) |
| **port** | `443` (no change) |
| **UUID** | (no change) |

---

## 🧪 Test Commands

```bash
# Test proxy endpoint
curl https://your-project.vercel.app/xhttp/

# Test V2Ray connection
v2ray run -config config.json

# Check your IP through proxy
curl --proxy socks5://127.0.0.1:1080 https://ifconfig.me
```

---

## 🔧 Change Target Server

**Edit:** `api/proxy.js` (line 18-19)

```javascript
const targetUrl = `https://YOUR-SERVER.com${path}`;
headers.set('host', 'YOUR-SERVER.com');
```

**Redeploy:**
```bash
vercel --prod
```

---

## 📊 Vercel Limits (Free Tier)

- **Timeout:** 10 seconds per request
- **Body Size:** 4.5 MB max
- **Bandwidth:** 100 GB/month
- **Invocations:** 100,000/month

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **502 Error** | Check target server URL in `api/proxy.js` |
| **Timeout** | Upgrade to Pro tier or check server response time |
| **Can't Connect** | Verify domain in client config (3 places) |
| **Slow** | Check server latency, Vercel adds ~10-50ms |

---

## 📁 File Overview

```
api/proxy.js          → Main proxy logic
vercel.json           → Vercel configuration
v2ray-client-config.json → Copy & edit this
README.md             → Full documentation
DEPLOYMENT.md         → Step-by-step guide
CLIENT-CONFIG-GUIDE.md → All client configs
```

---

## 🔗 Important URLs

**After Deployment:**
- Vercel Dashboard: `https://vercel.com/dashboard`
- Function Logs: Dashboard → Your Project → Functions
- Settings: Dashboard → Your Project → Settings

**Your Endpoints:**
- Production: `https://your-project.vercel.app/xhttp/`
- Preview: `https://your-project-xxxxx.vercel.app/xhttp/`

---

## ⚡ Most Common Tasks

### Add Custom Domain
1. Vercel Dashboard → Settings → Domains
2. Add domain: `proxy.yourdomain.com`
3. Update DNS: `CNAME → cname.vercel-dns.com`
4. Update client config with new domain

### Update Proxy
```bash
# Edit api/proxy.js
vercel --prod
```

### View Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Functions" tab
4. Real-time logs appear here

### Rollback
1. Vercel Dashboard → Deployments
2. Find working deployment
3. Click "•••" → "Promote to Production"

---

## 📱 Client-Specific Quick Configs

### V2RayN (Windows)
- Address: `your-project.vercel.app`
- Port: `443`
- Network: `xhttp`
- Path: `/xhttp`
- TLS: `enabled`
- SNI: `your-project.vercel.app`

### V2RayNG (Android)
- Server: `your-project.vercel.app`
- Port: `443`
- Network: `xhttp`
- Path: `/xhttp`
- Security: `tls`
- SNI: `your-project.vercel.app`

### Core V2Ray
```json
{
  "address": "your-project.vercel.app",
  "port": 443,
  "xhttpSettings": {
    "path": "/xhttp",
    "host": "your-project.vercel.app"
  },
  "tlsSettings": {
    "serverName": "your-project.vercel.app"
  }
}
```

---

## 🎯 Verification Checklist

After deployment:
- [ ] Vercel shows "Deployment Ready"
- [ ] `curl` test returns response
- [ ] V2Ray client connects
- [ ] IP check shows different IP
- [ ] No errors in Vercel logs
- [ ] Browsing works normally

---

## 💡 Pro Tips

1. **Keep fallback:** Configure direct connection as backup
2. **Monitor usage:** Check Vercel dashboard weekly
3. **Use environment variables:** For sensitive config
4. **Custom domain:** More professional and stable
5. **Test first:** Deploy to preview before production

---

## 📞 Get Help

- **Deployment issues:** See `DEPLOYMENT.md`
- **Client config:** See `CLIENT-CONFIG-GUIDE.md`
- **General info:** See `README.md`
- **Everything:** See `PROJECT-SUMMARY.md`

---

## 🔑 Environment Variables (Optional)

**Set in Vercel Dashboard:**

| Variable | Value | Purpose |
|----------|-------|---------|
| `V2RAY_SERVER` | `your-server.com` | Target server |
| `NODE_ENV` | `production` | Environment |

**Update `api/proxy.js`:**
```javascript
const TARGET = process.env.V2RAY_SERVER || 'ra.sdupdates.news';
```

---

## 🎨 URL Structure

```
Client Request:
https://your-project.vercel.app/xhttp/path?query=value
                                ↓
Proxied To:
https://ra.sdupdates.news/xhttp/path?query=value
```

**Vercel** → **Your Server** (transparent)

---

## 🔄 Update Workflow

```bash
# 1. Make changes locally
vim api/proxy.js

# 2. Test changes
vercel dev

# 3. Deploy to preview
vercel

# 4. Test preview URL
curl https://preview-url.vercel.app/xhttp/

# 5. Deploy to production
vercel --prod
```

---

## 📈 Monitoring

**Check Regularly:**
- Function execution time (should be < 1s)
- Error rate (should be < 1%)
- Bandwidth usage (alert at 80%)
- Number of invocations

**Where:**
Vercel Dashboard → Your Project → Analytics

---

## 🎓 Key Concepts

- **Edge Function:** Runs globally, near users
- **Streaming:** No buffering, better for xhttp
- **xhttp:** V2Ray's HTTP-based transport
- **TLS Passthrough:** Encrypted end-to-end
- **Reverse Proxy:** Hides backend server

---

**For complete details, see the full documentation files →**
