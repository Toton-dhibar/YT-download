# Detailed Deployment Guide

This guide walks you through deploying the V2Ray xhttp reverse proxy on Vercel, step by step.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Deployment Methods](#deployment-methods)
4. [Configuration](#configuration)
5. [Verification](#verification)
6. [Custom Domain Setup](#custom-domain-setup)
7. [Maintenance](#maintenance)

---

## Prerequisites

### What You'll Need

1. **A Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Free tier is sufficient for personal use
   - GitHub/GitLab/Bitbucket integration recommended

2. **Node.js and npm** (for CLI deployment)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

3. **Vercel CLI** (optional but recommended)
   ```bash
   npm install -g vercel
   ```

4. **A Working V2Ray Server**
   - Domain: `ra.sdupdates.news` (or your own)
   - Protocol: VLESS with xhttp + TLS
   - Path: `/xhttp`
   - Port: `443` (HTTPS)
   - Valid SSL certificate

5. **Git** (optional, for version control)
   ```bash
   git --version
   ```

---

## Initial Setup

### Step 1: Prepare Project Files

If you haven't already, create a project directory with these files:

```
my-v2ray-proxy/
├── api/
│   └── proxy.js
├── vercel.json
└── package.json
```

**Option A: Clone This Repository**
```bash
git clone <repository-url>
cd <repository-name>
```

**Option B: Create Files Manually**

1. Create project directory:
   ```bash
   mkdir my-v2ray-proxy
   cd my-v2ray-proxy
   ```

2. Create the files with content from this repository

### Step 2: Review Configuration

Before deploying, verify the configuration in `api/proxy.js`:

```javascript
// This line defines your target V2Ray server
const targetUrl = `https://ra.sdupdates.news${path}`;

// This sets the Host header
headers.set('host', 'ra.sdupdates.news');
```

**If your server is different**, update both occurrences of `ra.sdupdates.news` to your server's domain.

---

## Deployment Methods

Choose one of the following deployment methods:

### Method 1: Deploy via Vercel CLI (Recommended)

This is the fastest method for quick deployments and testing.

#### Step 1: Login to Vercel
```bash
vercel login
```
- Follow the email verification prompt
- You'll be logged in automatically after verification

#### Step 2: Deploy
```bash
vercel
```

You'll be prompted with:
1. **Set up and deploy "~/path/to/project"?** → Press `Y`
2. **Which scope?** → Select your account or team
3. **Link to existing project?** → Press `N` (for first deployment)
4. **What's your project's name?** → Enter a name (e.g., `v2ray-proxy`)
5. **In which directory is your code located?** → Press Enter (uses current directory)

**Output:**
```
🔗  Linked to username/v2ray-proxy
🔍  Inspect: https://vercel.com/username/v2ray-proxy/...
✅  Preview: https://v2ray-proxy-xxxxx.vercel.app
```

#### Step 3: Deploy to Production
```bash
vercel --prod
```

This creates a production deployment with a stable URL.

**Your production URL will be:**
```
https://v2ray-proxy.vercel.app
```

### Method 2: Deploy via Vercel Dashboard (GUI)

This method uses the web interface and Git integration.

#### Step 1: Push to Git Repository

1. Initialize Git repository (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial V2Ray proxy setup"
   ```

2. Create a repository on GitHub/GitLab/Bitbucket

3. Push your code:
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

#### Step 2: Import on Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your repository from the list
   - If not visible, click **"Adjust GitHub App Permissions"**
5. Click **"Import"**

#### Step 3: Configure Project

On the import screen:
- **Project Name**: Choose a name (e.g., `v2ray-proxy`)
- **Framework Preset**: Leave as **"Other"**
- **Root Directory**: `./` (default)
- **Build Settings**: Leave default (no build needed)
- **Environment Variables**: None needed (unless you customize)

Click **"Deploy"**

#### Step 4: Wait for Deployment

- Deployment typically takes 30-60 seconds
- You'll see real-time logs
- Upon completion, you'll get your deployment URL

### Method 3: Deploy via GitHub Actions (Advanced)

For automated deployments on every push.

#### Step 1: Create Vercel Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it (e.g., `github-actions`)
4. Copy the token (you won't see it again)

#### Step 2: Get Project IDs

```bash
# Deploy once via CLI to create project
vercel

# Get project and org IDs
vercel inspect --token=<your-token>
```

Note the `projectId` and `orgId` values.

#### Step 3: Add GitHub Secrets

In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add these secrets:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your org ID
   - `VERCEL_PROJECT_ID`: Your project ID

#### Step 4: Create Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Vercel
        run: |
          vercel --token ${{ secrets.VERCEL_TOKEN }} \
                 --prod \
                 --yes \
                 --scope ${{ secrets.VERCEL_ORG_ID }} \
                 --project-id ${{ secrets.VERCEL_PROJECT_ID }}
```

Now every push to `main` will trigger a deployment!

---

## Configuration

### Update Target Server

If you need to change the backend V2Ray server:

1. Edit `api/proxy.js`:
   ```javascript
   // Change both occurrences
   const targetUrl = `https://YOUR-SERVER.com${path}`;
   headers.set('host', 'YOUR-SERVER.com');
   ```

2. Redeploy:
   ```bash
   vercel --prod
   ```

### Environment Variables (Optional)

For better security, you can use environment variables:

1. **Update `api/proxy.js`:**
   ```javascript
   const TARGET_HOST = process.env.TARGET_HOST || 'ra.sdupdates.news';
   const targetUrl = `https://${TARGET_HOST}${path}`;
   headers.set('host', TARGET_HOST);
   ```

2. **Set in Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add `TARGET_HOST` = `ra.sdupdates.news`
   - Click **"Save"**

3. **Redeploy** (Vercel will auto-redeploy if connected to Git)

---

## Verification

### Step 1: Test Basic Connectivity

```bash
# Test the proxy endpoint
curl -v https://your-project.vercel.app/xhttp/

# You should see a response from your V2Ray server
```

### Step 2: Check Vercel Logs

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **"Functions"** tab
4. Click on `api/proxy.js`
5. View real-time logs

Look for:
- ✅ 200 or 204 status codes (success)
- ❌ 502 errors (backend unreachable)
- ⏱️ Timeout errors (connection took too long)

### Step 3: Test with V2Ray Client

1. Update your V2Ray client config (see next section)
2. Connect
3. Try browsing or testing connection
4. Monitor V2Ray client logs

---

## V2Ray Client Configuration

### Update Your Client Config

**Before (Direct Connection):**
```json
{
  "outbounds": [{
    "protocol": "vless",
    "settings": {
      "vnext": [{
        "address": "ra.sdupdates.news",
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
      "xhttpSettings": {
        "path": "/xhttp",
        "host": "ra.sdupdates.news"
      },
      "tlsSettings": {
        "serverName": "ra.sdupdates.news",
        "allowInsecure": false
      }
    }
  }]
}
```

**After (Via Vercel CDN):**
```json
{
  "outbounds": [{
    "protocol": "vless",
    "settings": {
      "vnext": [{
        "address": "your-project.vercel.app",
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
      "xhttpSettings": {
        "path": "/xhttp",
        "host": "your-project.vercel.app"
      },
      "tlsSettings": {
        "serverName": "your-project.vercel.app",
        "allowInsecure": false
      }
    }
  }]
}
```

**Key Changes:**
- `address`: `your-project.vercel.app` (Vercel domain)
- `host`: `your-project.vercel.app` (Vercel domain)
- `serverName`: `your-project.vercel.app` (Vercel domain)
- `path`: Keep as `/xhttp`
- `port`: Keep as `443`

### For V2RayN (Windows)

1. Open V2RayN
2. Right-click your server → **"Edit"**
3. Update these fields:
   - **Address**: `your-project.vercel.app`
   - **Port**: `443`
   - **Host**: `your-project.vercel.app`
   - **Path**: `/xhttp`
   - **TLS**: Enabled
   - **SNI**: `your-project.vercel.app`

### For V2RayNG (Android)

1. Tap your server configuration
2. Edit:
   - **Address/Server**: `your-project.vercel.app`
   - **Port**: `443`
   - **Host**: `your-project.vercel.app`
   - **Path**: `/xhttp`
   - **Security/TLS**: `tls`

---

## Custom Domain Setup

Using a custom domain makes your setup more professional and stable.

### Step 1: Add Domain in Vercel

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Click **"Add Domain"**
4. Enter your domain (e.g., `proxy.yourdomain.com`)
5. Click **"Add"**

### Step 2: Configure DNS

Vercel will show you the DNS records to add:

**For Subdomain (e.g., proxy.yourdomain.com):**
```
Type: CNAME
Name: proxy
Value: cname.vercel-dns.com
```

**For Root Domain (e.g., yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

Add these records in your domain registrar's DNS settings.

### Step 3: Wait for DNS Propagation

- Usually takes 5-60 minutes
- Check status in Vercel dashboard
- Once verified, SSL certificate is automatically issued

### Step 4: Update V2Ray Client

Replace `your-project.vercel.app` with your custom domain in your V2Ray client configuration.

---

## Maintenance

### Monitoring

**Vercel Dashboard:**
- Monitor function invocations
- Check error rates
- Review execution duration
- View real-time logs

**Set Up Alerts:**
1. Go to Project Settings → **Integrations**
2. Add Slack, Discord, or email notifications
3. Get alerted on deployment failures or errors

### Updating the Proxy

**When using Git integration:**
1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update proxy configuration"
   git push
   ```
3. Vercel auto-deploys

**When using CLI:**
```bash
# Make changes
vercel --prod
```

### Rollback

If something goes wrong:

1. Go to Vercel dashboard
2. Select your project
3. Go to **"Deployments"** tab
4. Find a previous working deployment
5. Click **"•••"** → **"Promote to Production"**

### Performance Optimization

1. **Monitor Execution Time:**
   - Check Vercel function logs
   - If approaching timeout, consider Pro plan

2. **Check Cold Starts:**
   - Edge Functions are typically fast
   - Warm up with periodic requests if needed

3. **Review Usage:**
   - Free tier: 100GB bandwidth/month
   - 100,000 function invocations/month
   - Monitor in Vercel dashboard

### Troubleshooting Deployments

**Build Fails:**
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Syntax errors in JS files
# - Invalid vercel.json configuration
```

**Function Errors:**
```bash
# Check runtime logs
# Common issues:
# - Network timeout to backend
# - Invalid target URL
# - SSL certificate issues
```

**DNS Issues:**
```bash
# Verify DNS propagation
dig your-domain.com

# Check CNAME
dig CNAME proxy.yourdomain.com
```

---

## Security Best Practices

1. **Never Commit Sensitive Data:**
   - Don't hardcode UUIDs or passwords
   - Use environment variables for sensitive config

2. **Use HTTPS Only:**
   - Vercel enforces HTTPS by default
   - Ensure your backend uses valid SSL

3. **Monitor Access:**
   - Review Vercel logs regularly
   - Set up alerts for unusual activity

4. **Keep Dependencies Updated:**
   - Vercel handles runtime updates
   - No manual dependency management needed

5. **Backup Configuration:**
   - Keep a copy of your V2Ray client config
   - Document your setup

---

## Advanced Configuration

### Rate Limiting

Vercel provides automatic DDoS protection and rate limiting. For custom limits:

1. Use Vercel Pro for more control
2. Add rate limiting in the proxy function
3. Use Cloudflare in front of Vercel (advanced)

### Multiple Backend Servers

To support multiple V2Ray servers:

```javascript
// In api/proxy.js
const SERVERS = {
  'server1': 'ra.sdupdates.news',
  'server2': 'another-server.com',
};

// Extract server from subdomain or path
const server = req.headers.get('x-server-id') || 'server1';
const targetHost = SERVERS[server];
```

### Logging and Analytics

Add custom logging:

```javascript
export default async function handler(req) {
  console.log('Request:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
  
  // ... rest of proxy logic
}
```

View logs in Vercel dashboard under Functions tab.

---

## Getting Help

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **V2Ray Documentation**: [v2ray.com](https://www.v2ray.com/)
- **Vercel Support**: Available for Pro accounts
- **Community**: Vercel Discord, V2Ray Telegram groups

---

## Next Steps

1. ✅ Deploy your proxy
2. ✅ Test connectivity
3. ✅ Update V2Ray client
4. ✅ Monitor performance
5. ✅ Consider custom domain
6. ✅ Set up monitoring/alerts
7. ✅ Document your setup
8. ✅ Create backups

**Happy proxying! 🚀**
