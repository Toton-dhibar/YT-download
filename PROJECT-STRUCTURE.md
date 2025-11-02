# Project Structure - V2Ray xhttp Vercel Proxy

Complete file tree for the Vercel reverse proxy project.

## 📁 Directory Structure

```
YT-download/
├── api/
│   └── proxy.js                      # Edge function for proxying V2Ray xhttp traffic
│                                     # - Forwards requests to ra.sdupdates.news
│                                     # - Handles all HTTP methods
│                                     # - Preserves headers and binary data
│                                     # - Uses Edge runtime (no timeout)
│
├── vercel.json                       # Vercel configuration
│                                     # - Routes /xhttp/* to proxy function
│                                     # - Sets cache control headers
│
├── package.json                      # Node.js project metadata
│                                     # - Project name: vless-cdn
│                                     # - Dev script for local testing
│
├── .vercelignore                     # Files to exclude from deployment
│                                     # - node_modules, test files, etc.
│
├── README.md                         # Main project README
│                                     # - Overview of V2Ray proxy
│                                     # - Quick start guide
│                                     # - Links to documentation
│
├── QUICKSTART.md                     # 5-minute setup guide
│                                     # - Deploy to Vercel
│                                     # - Update V2Ray client
│                                     # - Test connection
│
├── DEPLOYMENT.md                     # Comprehensive deployment guide
│                                     # - Step-by-step instructions
│                                     # - V2Ray client configuration
│                                     # - Vercel limitations
│                                     # - Troubleshooting
│
├── README-VERCEL-PROXY.md           # Technical documentation
│                                     # - Architecture details
│                                     # - Customization options
│                                     # - Monitoring and debugging
│
├── v2ray-client-config-example.json  # Example V2Ray client config
│                                     # - Full JSON configuration
│                                     # - Ready to use (just update UUID)
│
├── PROJECT-STRUCTURE.md              # This file
│                                     # - Complete file tree
│                                     # - File descriptions
│
├── .gitignore                        # Git ignore rules
│
└── .git/                             # Git repository data
```

## 📄 File Details

### Core Files (Required for Deployment)

| File | Purpose | Size |
|------|---------|------|
| `api/proxy.js` | Edge function that proxies requests | ~4 KB |
| `vercel.json` | Vercel routing and configuration | ~200 B |
| `package.json` | Node.js project metadata | ~130 B |

### Documentation Files

| File | Purpose | Size |
|------|---------|------|
| `README.md` | Main project overview | ~3 KB |
| `QUICKSTART.md` | 5-minute setup guide | ~5 KB |
| `DEPLOYMENT.md` | Complete deployment guide | ~12 KB |
| `README-VERCEL-PROXY.md` | Technical documentation | ~5 KB |
| `PROJECT-STRUCTURE.md` | This file | ~2 KB |

### Example Files

| File | Purpose | Size |
|------|---------|------|
| `v2ray-client-config-example.json` | V2Ray client config template | ~2 KB |

### Configuration Files

| File | Purpose | Size |
|------|---------|------|
| `.vercelignore` | Files to exclude from deployment | ~500 B |
| `.gitignore` | Git ignore rules | ~200 B |

## 🚀 Minimum Deployment Requirements

To deploy this proxy, you only need these 3 files:

1. **`api/proxy.js`** - The proxy function
2. **`vercel.json`** - Vercel configuration
3. **`package.json`** - Project metadata

All other files are documentation and examples.

## 📦 Total Project Size

- **Core files**: ~5 KB
- **Documentation**: ~27 KB
- **Total**: ~32 KB (excluding .git)

Extremely lightweight and efficient! ⚡

## 🔧 File Dependencies

```
vercel.json
  └─ Rewrites /xhttp/* → api/proxy.js

api/proxy.js
  └─ Proxies to https://ra.sdupdates.news

package.json
  └─ Defines project metadata for Vercel
```

No external dependencies required! 🎉

## 📖 Documentation Flow

```
README.md (Overview)
  ├─ QUICKSTART.md (5-min setup)
  ├─ DEPLOYMENT.md (Complete guide)
  │   └─ Includes:
  │       ├─ Deployment instructions
  │       ├─ V2Ray client config
  │       ├─ Vercel limitations
  │       └─ Troubleshooting
  └─ README-VERCEL-PROXY.md (Technical details)
      └─ Includes:
          ├─ Architecture
          ├─ Customization
          └─ Monitoring
```

## 🛠️ Development Files

None required! This is a production-ready deployment.

For local testing:
```bash
npm install -g vercel
vercel dev
```

This will start a local development server.

## 📝 Notes

- **No build step required** - Edge functions deploy as-is
- **No dependencies** - Pure JavaScript with Web APIs
- **No environment variables** - Target server hardcoded in proxy.js
- **No secrets needed** - Public proxy endpoint

## 🎯 Next Steps

1. **Deploy**: See [QUICKSTART.md](./QUICKSTART.md)
2. **Configure**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Customize**: See [README-VERCEL-PROXY.md](./README-VERCEL-PROXY.md)

---

**Ready to deploy?** → [QUICKSTART.md](./QUICKSTART.md)
