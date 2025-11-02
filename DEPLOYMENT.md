# Deployment Guide

This guide will walk you through deploying your V2Ray xhttp proxy to Vercel step by step.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Post-Deployment Steps](#post-deployment-steps)
4. [Updating Configuration](#updating-configuration)

## Prerequisites

Before you begin, make sure you have:

- [ ] A Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Your V2Ray server details:
  - Server domain: `ra.sdupdates.news`
  - Port: `443`
  - Path: `/xhttp`
  - UUID/credentials
- [ ] Git installed (for CLI deployment)
- [ ] Node.js and npm installed (for CLI deployment)

## Deployment Options

### Option 1: Quick Deploy via Vercel CLI (Recommended)

This is the fastest method for deploying and updating your proxy.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser for authentication.

#### Step 3: Deploy from Project Directory

```bash
cd /path/to/v2ray-xhttp-vercel-proxy
vercel
```

Answer the prompts:
```
? Set up and deploy "~/v2ray-xhttp-vercel-proxy"? [Y/n] y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] n
? What's your project's name? v2ray-xhttp-proxy
? In which directory is your code located? ./
```

#### Step 4: Deploy to Production

```bash
vercel --prod
```

Your proxy will be available at: `https://v2ray-xhttp-proxy.vercel.app`

### Option 2: Deploy via GitHub Integration

This method is best for version control and automatic deployments.

#### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/v2ray-xhttp-proxy.git
git push -u origin main
```

#### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure:
   - **Project Name**: `v2ray-xhttp-proxy`
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Click "Deploy"

#### Step 3: Enable Auto-Deploy

Vercel will automatically deploy when you push to your main branch.

### Option 3: Deploy via Vercel Dashboard (No Git)

Perfect for testing or if you don't want to use Git.

#### Step 1: Create Project Archive

```bash
# Create a zip file of your project (exclude node_modules)
zip -r v2ray-proxy.zip . -x "node_modules/*" ".git/*"
```

#### Step 2: Upload to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag and drop `v2ray-proxy.zip`
3. Wait for deployment
4. Note your deployment URL

## Post-Deployment Steps

### 1. Verify Deployment

Test your proxy endpoint:

```bash
curl -I https://your-project.vercel.app/xhttp
```

You should see HTTP headers from your V2Ray server.

### 2. Get Your Vercel URL

Your deployment URL will be in one of these formats:
- Auto-generated: `https://your-project.vercel.app`
- With custom domain: `https://v2ray.yourdomain.com`

### 3. Update V2Ray Client Configuration

Update your V2Ray client with the new Vercel URL:

1. Open your V2Ray client (v2rayN, v2rayNG, etc.)
2. Edit your server configuration
3. Change these fields:
   - **Address**: `your-project.vercel.app`
   - **SNI/Server Name**: `your-project.vercel.app`
   - **Host**: `your-project.vercel.app`
   - **Path**: `/xhttp` (keep this the same)
   - **Port**: `443`
   - **TLS**: Enable
4. Save and test connection

See `v2ray-client-config-example.json` for a complete configuration example.

### 4. Test Connection

1. Connect with your V2Ray client
2. Verify you can access the internet
3. Check your IP address to confirm you're using the proxy
4. Test with: `curl ifconfig.me` or visit `https://whatismyipaddress.com/`

## Updating Configuration

### Update Target Server

If you need to change the target V2Ray server:

1. Edit `api/proxy.js`
2. Update the target URL:
```javascript
const targetUrl = `https://NEW-SERVER.com/xhttp${path}${search}`;
forwardHeaders.set('host', 'NEW-SERVER.com');
```
3. Redeploy:
```bash
vercel --prod
```

### Add Custom Domain

1. Go to Vercel Dashboard
2. Select your project
3. Navigate to: **Settings** → **Domains**
4. Click "Add"
5. Enter your domain: `v2ray.yourdomain.com`
6. Configure DNS as instructed by Vercel:
   - **Type**: CNAME
   - **Name**: v2ray (or your subdomain)
   - **Value**: cname.vercel-dns.com
7. Wait for DNS propagation (5-30 minutes)
8. SSL certificate will be issued automatically

### Update Environment Variables (Advanced)

For sensitive configuration, you can use environment variables:

1. Go to: **Project Settings** → **Environment Variables**
2. Add variables:
   - `TARGET_SERVER`: `ra.sdupdates.news`
   - `TARGET_PATH`: `/xhttp`
3. Update `api/proxy.js` to use:
```javascript
const targetServer = process.env.TARGET_SERVER || 'ra.sdupdates.news';
const targetUrl = `https://${targetServer}/xhttp${path}${search}`;
```
4. Redeploy

## Monitoring

### View Logs

**Via CLI:**
```bash
vercel logs your-project.vercel.app
```

**Via Dashboard:**
1. Go to your project
2. Click **Deployments**
3. Select latest deployment
4. Click **Runtime Logs**

### Check Analytics

1. Go to your project dashboard
2. Click **Analytics** tab
3. Monitor:
   - Request count
   - Bandwidth usage
   - Response times
   - Error rates

### Set Up Alerts

1. Go to **Project Settings** → **Notifications**
2. Configure alerts for:
   - Deployment failures
   - Error rate spikes
   - Bandwidth limits

## Troubleshooting

### Deployment Failed

- Check that all required files are present (`api/proxy.js`, `vercel.json`)
- Verify file permissions
- Review error messages in deployment logs

### 404 Not Found

- Ensure `vercel.json` has correct rewrite rules
- Check that path in client is `/xhttp`
- Verify deployment was successful

### 502 Bad Gateway

- Check that target server `ra.sdupdates.news` is accessible
- Verify SSL certificate is valid
- Review function logs for errors

### Connection Timeouts

- This is expected due to Vercel timeout limits
- V2Ray should automatically reconnect
- Consider upgrading to Pro plan for longer timeouts

### Rate Limiting

- Monitor your request rate in analytics
- Spread traffic across multiple Vercel projects if needed
- Upgrade to Pro plan for higher limits

## Best Practices

1. **Use Custom Domain**: Looks more professional and easier to remember
2. **Monitor Usage**: Keep an eye on bandwidth to avoid overages
3. **Regular Updates**: Keep your proxy code updated
4. **Backup Configuration**: Save your V2Ray client configs
5. **Test Thoroughly**: Always test after deployment or updates

## Advanced: Multiple Target Servers

To support multiple V2Ray servers, you can:

1. Create separate paths: `/xhttp1`, `/xhttp2`, etc.
2. Add multiple rewrites in `vercel.json`
3. Create separate proxy functions: `api/proxy1.js`, `api/proxy2.js`
4. Or use query parameters to select target server

Example `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/xhttp1/:path*", "destination": "/api/proxy1" },
    { "source": "/xhttp2/:path*", "destination": "/api/proxy2" }
  ]
}
```

## Getting Help

- Check [README.md](README.md) for general information
- Review Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Check Vercel status: [vercel-status.com](https://www.vercel-status.com/)

## Next Steps

After successful deployment:
- [ ] Test connection with V2Ray client
- [ ] Add custom domain (optional)
- [ ] Set up monitoring and alerts
- [ ] Document your configuration
- [ ] Share deployment URL with trusted users only

Your V2Ray xhttp proxy should now be running on Vercel! 🎉
