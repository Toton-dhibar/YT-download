# Quick Start Guide

Get your V2Ray xhttp proxy running on Vercel in 5 minutes.

## Prerequisites

- A V2Ray server with xhttp transport (e.g., `ra.sdupdates.news`)
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Node.js and npm installed (optional, for local testing)

## Step 1: Get the Code

```bash
# Clone this repository
git clone https://github.com/Toton-dhibar/YT-download.git
cd YT-download

# Or download and extract the ZIP file
```

## Step 2: Configure Your Server (Optional)

If your V2Ray server is NOT `ra.sdupdates.news`, edit `api/proxy.js`:

```javascript
// Change this line:
const TARGET_HOST = 'ra.sdupdates.news';

// To your server:
const TARGET_HOST = 'your-server.com';
```

## Step 3: Deploy to Vercel

### Method A: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

OR use the deployment script:

```bash
./deploy.sh
```

### Method B: Using GitHub (Automatic Updates)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "V2Ray xhttp proxy setup"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Done**: Vercel will auto-deploy on every push to `main`

### Method C: Manual Upload

1. Create a ZIP file:
   ```bash
   zip -r v2ray-proxy.zip api/ vercel.json package.json
   ```

2. Upload at [vercel.com/new](https://vercel.com/new) → "Upload" tab

## Step 4: Get Your Vercel URL

After deployment, you'll get a URL like:
```
https://your-project-abc123.vercel.app
```

**Copy this URL** - you'll need it for your V2Ray client.

## Step 5: Test the Endpoint

```bash
# Test if the proxy is working
curl -v https://your-project-abc123.vercel.app/xhttp/
```

You should see a connection to your V2Ray server (may return an error response, which is normal if not authenticated).

## Step 6: Configure V2Ray Client

### For V2RayN (Windows):

1. Open V2RayN
2. Add Server → Manual Configuration
3. Fill in:
   - **Address**: `your-project-abc123.vercel.app`
   - **Port**: `443`
   - **User ID**: Your existing UUID
   - **Protocol**: `VLESS`
   - **Transport**: `xhttp`
   - **Path**: `/xhttp`
   - **TLS**: `Enabled`
   - **SNI**: `your-project-abc123.vercel.app`

### For V2RayNG (Android):

1. Import this link (replace values):
```
vless://YOUR-UUID@your-project-abc123.vercel.app:443?encryption=none&security=tls&sni=your-project-abc123.vercel.app&fp=chrome&type=xhttp&path=%2Fxhttp&host=your-project-abc123.vercel.app#Vercel-Proxy
```

### For other clients:

See [V2RAY_CONFIG.md](./V2RAY_CONFIG.md) for detailed configuration examples.

## Step 7: Test Your Connection

1. Connect using your V2Ray client
2. Check your IP:
   ```bash
   curl https://ifconfig.me
   ```
3. Should show a different IP (not your real server IP)

## Common Issues

### ❌ "502 Bad Gateway"
- **Cause**: Can't reach your V2Ray server
- **Fix**: Check if `ra.sdupdates.news` (or your server) is accessible

### ❌ "Connection Failed"
- **Cause**: Wrong configuration
- **Fix**: Double-check SNI/Host = Vercel domain, not server domain

### ❌ "Timeout"
- **Cause**: Request took too long (>10s on free plan)
- **Fix**: Upgrade to Vercel Pro plan

## Next Steps

### Optional Improvements

1. **Add Custom Domain**:
   - Go to Vercel Project Settings → Domains
   - Add your domain (e.g., `proxy.yourdomain.com`)
   - Update DNS records
   - Use custom domain in V2Ray client

2. **Monitor Usage**:
   ```bash
   vercel logs --follow
   ```
   
   Or view in Vercel Dashboard → Analytics

3. **Enable Environment Variables**:
   - Project Settings → Environment Variables
   - Add `TARGET_HOST` = `your-server.com`
   - Update `api/proxy.js` to use `process.env.TARGET_HOST`

4. **Upgrade to Pro** (if needed):
   - Better timeouts (60s vs 10s)
   - More bandwidth (1TB vs 100GB)
   - Faster cold starts

## Useful Commands

```bash
# View logs
vercel logs --follow

# List deployments
vercel ls

# Test locally before deploying
vercel dev
# Visit http://localhost:3000/xhttp/

# Redeploy
vercel --prod

# Remove deployment
vercel rm deployment-url
```

## File Structure

```
.
├── api/
│   └── proxy.js              # The proxy function
├── vercel.json               # Routing configuration
├── package.json              # Project info
├── DEPLOYMENT.md             # Detailed deployment guide
├── V2RAY_CONFIG.md           # Client configuration guide
├── QUICKSTART.md             # This file
└── README.md                 # Project overview
```

## Performance Tips

1. **First connection may be slow** (cold start) - wait 30-60 seconds
2. **Keep connections active** - prevents cold starts
3. **Choose Pro plan** - for regular/heavy use
4. **Monitor bandwidth** - 100GB free, then upgrade

## Troubleshooting

### Enable Debug Mode

Add to `api/proxy.js`:
```javascript
console.log('Request:', req.method, req.url);
console.log('Target:', targetUrl);
```

View logs:
```bash
vercel logs --follow
```

### Test Direct Connection

```bash
# Test your V2Ray server directly
curl -v https://ra.sdupdates.news/xhttp/

# Should respond (even if error, proves server is reachable)
```

### Verify Vercel Deployment

```bash
# Check deployment status
vercel ls

# View recent logs
vercel logs your-project.vercel.app

# Test endpoint
curl -I https://your-project.vercel.app/xhttp/
```

## Need More Help?

- **Detailed Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Client Config**: See [V2RAY_CONFIG.md](./V2RAY_CONFIG.md)
- **Full README**: See [README.md](./README.md)
- **GitHub Issues**: Open an issue for problems

## Security Reminders

- ✅ Keep your UUID private (like a password)
- ✅ Use strong, randomly generated UUIDs
- ✅ Enable TLS fingerprinting for better stealth
- ✅ Monitor Vercel usage for anomalies
- ✅ Don't share your config files

## Cost Overview

| Plan | Cost | Bandwidth | Timeout | Best For |
|------|------|-----------|---------|----------|
| **Hobby** | Free | 100 GB/mo | 10s | Light personal use |
| **Pro** | $20/mo | 1 TB/mo | 60s+ | Regular use |

Start with Hobby (free), upgrade if needed.

---

**You're all set!** 🚀

Your V2Ray traffic now flows through Vercel CDN, hiding your server IP and providing DDoS protection.
