# Project Structure

## Complete File Tree

```
v2ray-xhttp-vercel-proxy/
├── api/
│   └── proxy.js                      # Edge Function that proxies xhttp traffic
├── .git/                              # Git repository (if using version control)
├── .gitignore                         # Files to exclude from git
├── DEPLOYMENT.md                      # Step-by-step deployment guide
├── LIMITATIONS.md                     # Detailed Vercel limitations documentation
├── PROJECT-STRUCTURE.md               # This file - project overview
├── README.md                          # Main documentation
├── package.json                       # Project metadata and scripts
├── vercel.json                        # Vercel platform configuration
├── v2ray-client-config-example.json   # Example V2Ray client configuration
└── YTDL--100%done.zip                # (Legacy file - can be removed)
```

## File Descriptions

### Core Files (Required for Deployment)

#### `api/proxy.js`
**Purpose**: The main Edge Function that handles proxying

**What it does**:
- Receives requests to `/xhttp/*` path
- Forwards them to `https://ra.sdupdates.news/xhttp/*`
- Passes through all headers, methods, and body
- Returns the response from the target server

**Key Features**:
- Uses Vercel Edge Runtime for global distribution
- Handles all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Properly manages headers for proxying
- Includes error handling and logging

**Code Highlights**:
```javascript
export const config = { runtime: 'edge' };  // Use Edge Runtime
const targetUrl = `https://ra.sdupdates.news/xhttp${path}${search}`;
// Forward request with proper headers
```

#### `vercel.json`
**Purpose**: Configures how Vercel handles requests

**What it does**:
- Rewrites `/xhttp/*` requests to `/api/proxy`
- Sets caching headers
- Configures routing rules

**Key Configuration**:
```json
{
  "rewrites": [
    { "source": "/xhttp/:path*", "destination": "/api/proxy" }
  ]
}
```

This tells Vercel: "When someone requests /xhttp/anything, send it to /api/proxy"

#### `package.json`
**Purpose**: Project metadata and npm scripts

**What it does**:
- Defines project name and version
- Provides deployment scripts
- Lists project metadata

**Useful Scripts**:
```bash
npm run dev     # Start local development server
npm run deploy  # Deploy to production
```

### Documentation Files

#### `README.md`
**Purpose**: Main project documentation

**Contents**:
- Project overview
- What the proxy does
- Deployment instructions
- Client configuration examples
- Testing procedures
- Troubleshooting guide

**Audience**: Developers and users setting up the proxy

#### `DEPLOYMENT.md`
**Purpose**: Step-by-step deployment guide

**Contents**:
- Three deployment methods (CLI, GitHub, Dashboard)
- Prerequisites checklist
- Post-deployment steps
- Configuration updates
- Monitoring setup

**Audience**: Users deploying for the first time

#### `LIMITATIONS.md`
**Purpose**: Detailed explanation of Vercel's limitations

**Contents**:
- Timeout limits (the biggest issue)
- Bandwidth restrictions
- Size limits
- Rate limiting details
- Use case recommendations
- Cost analysis

**Audience**: Users evaluating if Vercel is suitable

#### `PROJECT-STRUCTURE.md`
**Purpose**: Explain the project organization (this file)

**Contents**:
- File tree
- File descriptions
- How files work together
- Deployment flow

**Audience**: Developers understanding the codebase

### Configuration Examples

#### `v2ray-client-config-example.json`
**Purpose**: Complete V2Ray client configuration example

**What it shows**:
- How to configure V2Ray client to use Vercel proxy
- Inbound settings (SOCKS and HTTP proxy)
- Outbound settings (VLESS with xhttp)
- Routing rules

**Usage**:
1. Copy this file
2. Replace `your-project.vercel.app` with your actual Vercel URL
3. Replace `YOUR-UUID-HERE` with your V2Ray UUID
4. Import into your V2Ray client

### Supporting Files

#### `.gitignore`
**Purpose**: Exclude files from git repository

**Excludes**:
- `node_modules/` - npm dependencies
- `.venv/` - Python virtual environment
- `.env` - Environment variables
- Build artifacts
- OS-specific files

#### `.git/` (directory)
**Purpose**: Git version control data

**Only present if**:
- You initialized git (`git init`)
- You cloned from repository

**Not required for**: Vercel deployment

## How Files Work Together

### Request Flow

```
1. Client (V2Ray)
   ↓
2. https://your-project.vercel.app/xhttp/some-path
   ↓
3. Vercel CDN (edge network)
   ↓
4. vercel.json (routing rules)
   ↓ rewrites /xhttp/* → /api/proxy
   ↓
5. api/proxy.js (Edge Function)
   ↓ constructs target URL
   ↓ forwards request
   ↓
6. https://ra.sdupdates.news/xhttp/some-path
   ↓
7. Real V2Ray Server
   ↓ processes request
   ↓ sends response
   ↓
8. api/proxy.js (receives response)
   ↓ forwards back
   ↓
9. Vercel CDN
   ↓
10. Client (V2Ray) receives response
```

### Deployment Flow

#### Method 1: CLI Deployment
```
1. Local Files
   ↓
2. vercel CLI command
   ↓ reads vercel.json
   ↓ bundles project
   ↓ uploads to Vercel
   ↓
3. Vercel Platform
   ↓ processes configuration
   ↓ deploys Edge Function
   ↓ configures routing
   ↓
4. Live at: https://your-project.vercel.app
```

#### Method 2: GitHub Integration
```
1. Local Files
   ↓
2. git push to GitHub
   ↓
3. GitHub Repository
   ↓ triggers Vercel webhook
   ↓
4. Vercel Platform
   ↓ auto-deploys
   ↓
5. Live at: https://your-project.vercel.app
   ↓ auto-updates on new commits
```

## Directory Structure Explained

### Why `/api` folder?

Vercel automatically recognizes files in `/api` as serverless functions:
- `api/proxy.js` → accessible at `/api/proxy`
- No build configuration needed
- Automatic endpoint creation

### Why Edge Runtime?

The line `export const config = { runtime: 'edge' }` tells Vercel to:
- Run function on edge network (not serverless)
- Faster cold starts (~50ms vs ~200ms)
- Global distribution
- Better for proxying

### Why no `/public` folder?

This project doesn't serve static files, only proxies requests. If you wanted to add a status page:

```
public/
└── index.html     # Would be served at /
```

## Minimal Required Structure

For deployment, you only need:

```
v2ray-xhttp-vercel-proxy/
├── api/
│   └── proxy.js
├── vercel.json
└── package.json
```

**Everything else is documentation and examples.**

## Optional Additions

### Environment Variables

Create `.env` file (don't commit to git):
```env
TARGET_SERVER=ra.sdupdates.news
TARGET_PATH=/xhttp
```

Update `api/proxy.js`:
```javascript
const targetServer = process.env.TARGET_SERVER || 'ra.sdupdates.news';
```

### Multiple Target Servers

Create additional proxy files:
```
api/
├── proxy.js      # Server 1
├── proxy2.js     # Server 2
└── proxy3.js     # Server 3
```

Update `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/xhttp1/:path*", "destination": "/api/proxy" },
    { "source": "/xhttp2/:path*", "destination": "/api/proxy2" },
    { "source": "/xhttp3/:path*", "destination": "/api/proxy3" }
  ]
}
```

### Health Check Endpoint

Add `api/health.js`:
```javascript
export default function handler(req, res) {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
}
```

Accessible at: `https://your-project.vercel.app/api/health`

### Status Page

Create `public/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>V2Ray Proxy Status</title>
</head>
<body>
  <h1>V2Ray xhttp Proxy</h1>
  <p>Status: <span id="status">Checking...</span></p>
  <script>
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        document.getElementById('status').textContent = data.status;
      });
  </script>
</body>
</html>
```

## File Size Considerations

| File | Size | Type |
|------|------|------|
| api/proxy.js | ~2 KB | Code |
| vercel.json | ~0.3 KB | Config |
| package.json | ~0.3 KB | Config |
| README.md | ~15 KB | Docs |
| DEPLOYMENT.md | ~8 KB | Docs |
| LIMITATIONS.md | ~11 KB | Docs |
| v2ray-client-config-example.json | ~1.5 KB | Example |

**Total**: ~38 KB (excluding git and node_modules)

**Very lightweight** - fast to deploy and clone.

## Vercel Build Process

When you deploy, Vercel:

1. **Receives** your files
2. **Reads** `vercel.json` for configuration
3. **Detects** Edge Functions in `/api`
4. **Builds** nothing (no build step needed)
5. **Deploys** Edge Functions to global network
6. **Configures** routing rules
7. **Provisions** SSL certificate
8. **Returns** deployment URL

**Time**: Usually 20-40 seconds

## Local Development Structure

When running `vercel dev`:

```
http://localhost:3000/
├── /xhttp/*        → proxied to api/proxy.js
├── /api/proxy      → direct access to function
└── (any static files in public/)
```

Test locally:
```bash
curl http://localhost:3000/xhttp/test
```

## Production Structure

After deployment:

```
https://your-project.vercel.app/
├── /xhttp/*        → Edge Function (global CDN)
├── /api/proxy      → Edge Function (direct access)
└── /               → 404 (no homepage unless you add one)
```

## Security Considerations

### Files to Keep Private

**Never commit**:
- `.env` (environment variables)
- Actual V2Ray UUIDs/passwords
- Server configuration details

**Keep in `.gitignore`**

### Files Safe to Share

**Public repository OK**:
- `api/proxy.js` (generic proxy code)
- `vercel.json` (routing config)
- All documentation files

**If sharing**, remove:
- Real server domain from examples
- Any credentials
- Personal information

## Maintenance

### Regular Updates

**Monthly**:
- Check Vercel dashboard for usage
- Review error logs
- Monitor bandwidth

**As Needed**:
- Update target server in `api/proxy.js`
- Add new routes in `vercel.json`
- Update documentation

### Backup Strategy

**What to backup**:
1. `api/proxy.js` - your proxy logic
2. `vercel.json` - your routing config
3. V2Ray client configurations
4. Custom domain settings (if any)

**How**:
- Keep in git repository (recommended)
- Or download files from Vercel dashboard

## Migration Path

### Moving to Another Platform

If you need to move from Vercel:

1. **Copy** `api/proxy.js` logic
2. **Adapt** for new platform:
   - Cloudflare Workers: Similar structure
   - AWS Lambda: Add Lambda wrapper
   - Traditional Server: Convert to Express/Node.js
3. **Update** DNS/routing
4. **Test** thoroughly
5. **Switch** client configurations

### Scaling Up

If Vercel becomes insufficient:

1. **Deploy** to traditional VPS
2. **Use** Nginx or HAProxy
3. **Configure** reverse proxy
4. **Maintain** same `/xhttp` endpoint
5. **Update** client configurations

## Conclusion

This project structure is:
- ✅ **Minimal**: Only 3 files needed for deployment
- ✅ **Well-documented**: 5 documentation files
- ✅ **Easy to maintain**: Simple structure
- ✅ **Portable**: Easy to move to other platforms
- ✅ **Scalable**: Can add features incrementally

The key is `api/proxy.js` + `vercel.json` working together to route and proxy traffic efficiently.
