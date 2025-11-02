# Quick Deployment Guide

## 🚀 Deploy in 5 Minutes

### Method 1: One-Click Deploy (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Toton-dhibar/YT-download)

1. Click the button above
2. Sign in to Vercel
3. Give your project a name
4. Click **Deploy**
5. Wait for deployment to complete
6. Your proxy will be available at: `https://your-project.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Clone the repository
git clone https://github.com/Toton-dhibar/YT-download.git
cd YT-download

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Method 3: Git Integration

1. Fork this repository to your GitHub account
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your forked repository
4. Click **Deploy**

## 📋 Post-Deployment Checklist

- [ ] Note your Vercel deployment URL (e.g., `https://v2ray-proxy.vercel.app`)
- [ ] Test the proxy: `curl -I https://your-project.vercel.app/xhttp`
- [ ] Update your V2Ray client configuration (see VERCEL-PROXY-SETUP.md)
- [ ] Test connection with V2Ray client
- [ ] (Optional) Add custom domain in Vercel settings

## 🔧 Update Target Server

If you need to proxy to a different server (not `ra.sdupdates.news`):

1. Edit `api/proxy.js`
2. Change the target URL on line ~34:
   ```javascript
   const targetUrl = `https://YOUR-SERVER.com${url.pathname}${url.search}`;
   ```
3. Change the Host header on line ~48:
   ```javascript
   headers.set('Host', 'YOUR-SERVER.com');
   ```
4. Deploy: `vercel --prod`

## ⚡ Quick Test

After deployment, test your proxy:

```bash
# Test 1: Basic connectivity
curl -I https://your-project.vercel.app/xhttp

# Test 2: With V2Ray client
# Update your V2Ray client config and connect
```

## 🆘 Need Help?

- Read the full guide: [VERCEL-PROXY-SETUP.md](./VERCEL-PROXY-SETUP.md)
- Check Vercel logs: `vercel logs`
- View deployment status: [vercel.com/dashboard](https://vercel.com/dashboard)

---

**Deployment Time**: ~2 minutes  
**Cost**: Free (Vercel Hobby plan)  
**Maintenance**: Zero
