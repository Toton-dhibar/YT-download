# Vercel Deployment Guide for V2Ray xhttp Proxy

This guide explains how to deploy your V2Ray xhttp proxy on Vercel.

## Project Structure

```
.
├── api/
│   └── proxy.js           # Edge Function that proxies requests
├── vercel.json            # Vercel configuration
├── package.json           # Project metadata
├── DEPLOYMENT.md          # This file
├── V2RAY_CONFIG.md        # V2Ray client configuration guide
└── README.md              # Project overview
```

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```
3. **Git** (for GitHub deployment method)

## Deployment Methods

### Method 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project directory**:
   ```bash
   cd /path/to/this/project
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new one
   - Select your account/team
   - Confirm project settings

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

6. **Note your deployment URL**:
   - You'll get a URL like: `https://your-project.vercel.app`
   - Or you can use a custom domain

### Method 2: Deploy via GitHub Integration

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial V2Ray proxy setup"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Automatic deployments**:
   - Every push to `main` branch auto-deploys
   - Pull requests create preview deployments

### Method 3: Deploy via Vercel Dashboard

1. **Prepare a ZIP file**:
   ```bash
   zip -r v2ray-proxy.zip api/ vercel.json package.json
   ```

2. **Upload to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select "Upload" option
   - Upload your ZIP file
   - Click "Deploy"

## Configuration

### Update Target Server (if different)

If your V2Ray server is on a different domain, edit `api/proxy.js`:

```javascript
const TARGET_HOST = 'your-domain.com'; // Change this line
```

### Custom Domain Setup

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for DNS propagation (usually 5-10 minutes)

## Testing Your Deployment

### Test with curl:

```bash
# Basic connectivity test
curl -v https://your-project.vercel.app/xhttp/

# Should proxy to your real server
```

### Test with V2Ray client:

1. Update your V2Ray client configuration (see V2RAY_CONFIG.md)
2. Connect and test

## Important Vercel Limitations

### 1. **Request Timeout**
- **Hobby Plan**: 10 seconds max
- **Pro Plan**: 60 seconds max (serverless), 900 seconds (edge)
- **Enterprise**: Custom limits

**Impact**: Long-lived connections may be terminated. V2Ray xhttp should work with short requests.

### 2. **Request/Response Size**
- **Max Request Body**: 4.5 MB (Edge Functions)
- **Max Response Body**: 4.5 MB (Edge Functions)

**Impact**: Large file transfers may fail. Use for tunneling control traffic, not bulk data.

### 3. **Concurrent Connections**
- **Hobby**: 100 concurrent executions
- **Pro**: 1,000 concurrent executions

**Impact**: Multiple simultaneous V2Ray connections should work fine.

### 4. **Bandwidth**
- **Hobby**: 100 GB/month
- **Pro**: 1 TB/month

**Impact**: Monitor your usage. Heavy V2Ray traffic may exceed free tier.

### 5. **Cold Starts**
- Edge Functions have minimal cold start (~50-100ms)
- First request after idle period may be slower

### 6. **Streaming & WebSocket**
- Edge Runtime supports streaming
- V2Ray xhttp should work as it uses HTTP/2 or HTTP/1.1

### 7. **Header Limitations**
- Some headers are automatically added/modified by Vercel
- X-Forwarded-For, X-Real-IP are set by Vercel's edge
- Custom routing headers are preserved

## Monitoring & Debugging

### View Logs

**Via CLI**:
```bash
vercel logs your-project.vercel.app
```

**Via Dashboard**:
1. Go to your project on vercel.com
2. Click on "Deployments"
3. Select a deployment
4. View "Functions" or "Edge Middleware" logs

### Common Issues

#### 1. **502 Bad Gateway**
- Check if `ra.sdupdates.news` is accessible
- Verify DNS resolution
- Check V2Ray server is running

#### 2. **504 Gateway Timeout**
- Request took too long (>10s on Hobby plan)
- Upgrade to Pro for longer timeouts
- Or optimize V2Ray server response time

#### 3. **403 Forbidden**
- Check Vercel firewall settings
- Verify no IP restrictions on target server

#### 4. **Connection Reset**
- May indicate timeout exceeded
- Check V2Ray server logs
- Verify TLS certificates are valid

## Security Considerations

### 1. **Don't Expose Sensitive Data**
- Never hardcode passwords/secrets in code
- Use Vercel Environment Variables for sensitive config

### 2. **Rate Limiting**
- Consider adding rate limiting to prevent abuse
- Vercel has built-in DDoS protection

### 3. **Access Control**
- V2Ray handles authentication
- Vercel proxy passes all traffic through

### 4. **Monitoring**
- Regularly check Vercel analytics
- Watch for unusual traffic patterns
- Monitor bandwidth usage

## Environment Variables (Optional)

To make the target host configurable without code changes:

1. **Add to Vercel**:
   - Go to Project Settings → Environment Variables
   - Add: `TARGET_HOST` = `ra.sdupdates.news`

2. **Update api/proxy.js**:
   ```javascript
   const TARGET_HOST = process.env.TARGET_HOST || 'ra.sdupdates.news';
   ```

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

## Updating Your Deployment

### Via CLI:
```bash
# Make changes to your code
git add .
git commit -m "Update proxy configuration"
vercel --prod
```

### Via GitHub:
```bash
git push origin main
# Vercel auto-deploys
```

## Cost Estimates

### Hobby Plan (Free):
- ✅ Suitable for light personal use
- ✅ 100 GB bandwidth/month
- ⚠️ 10s timeout limit
- ⚠️ 100 concurrent executions

### Pro Plan ($20/month):
- ✅ 1 TB bandwidth/month
- ✅ 60s+ timeout
- ✅ 1,000 concurrent executions
- ✅ Better for regular use

### Enterprise:
- Custom limits
- Contact Vercel sales

## Troubleshooting

### Enable Debug Logging

Add to `api/proxy.js`:
```javascript
console.log('Request:', req.method, req.url);
console.log('Headers:', Object.fromEntries(req.headers));
```

View logs with:
```bash
vercel logs --follow
```

### Test Locally

```bash
# Install Vercel CLI
npm install -g vercel

# Run local dev server
vercel dev

# Test on http://localhost:3000/xhttp/
```

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **V2Ray Documentation**: https://www.v2ray.com/

## Next Steps

1. Deploy using one of the methods above
2. Configure your V2Ray client (see V2RAY_CONFIG.md)
3. Test the connection
4. Monitor usage and performance
