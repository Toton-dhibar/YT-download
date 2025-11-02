# Frequently Asked Questions (FAQ)

Common questions about using Vercel as a V2Ray xhttp proxy.

## General Questions

### Q: What is this project?
**A:** This is a Vercel Edge Function that acts as a reverse proxy for V2Ray xhttp servers. It helps hide your real server IP and provides DDoS protection through Vercel's CDN.

### Q: Why would I use this instead of connecting directly?
**A:** Main benefits:
- **IP Masking**: Hides your real V2Ray server IP
- **DDoS Protection**: Vercel's built-in protection
- **CDN Benefits**: Potentially better latency via Vercel's edge network
- **Flexibility**: Easy to switch servers without changing client configs

### Q: Is this legal?
**A:** This is a standard HTTP reverse proxy. However, you must:
- ✅ Use in compliance with local laws
- ✅ Follow Vercel's Terms of Service
- ✅ Follow your V2Ray server provider's terms
- ❌ Don't use for illegal activities

### Q: Can Vercel see my traffic?
**A:** Vercel sees encrypted HTTPS traffic. Your V2Ray protocol adds another layer of encryption, so they can't decrypt your actual data. They only see that you're making HTTPS requests.

---

## Deployment Questions

### Q: How long does deployment take?
**A:** 
- Initial deployment: 1-2 minutes
- Global propagation: ~30 seconds
- First request may have cold start: 1-5 seconds

### Q: Can I use a custom domain?
**A:** Yes! Steps:
1. Go to Vercel Project Settings → Domains
2. Add your domain (e.g., `v2ray.yourdomain.com`)
3. Update DNS records as instructed
4. Use custom domain in V2Ray client config

### Q: How do I update my deployment?
**A:** 
```bash
# Make changes to code
git add .
git commit -m "Update proxy"
vercel --prod
```
Or just push to GitHub if using GitHub integration.

### Q: Can I deploy multiple proxies?
**A:** Yes! Options:
1. **Multiple projects**: Deploy separate Vercel projects
2. **Path-based routing**: Use different paths (`/xhttp1`, `/xhttp2`)
3. **Subdomain routing**: Use different subdomains

### Q: Do I need a paid Vercel plan?
**A:** Depends on usage:
- **Hobby (Free)**: 100 GB/month bandwidth, 10s timeout - OK for light use
- **Pro ($20/mo)**: 1 TB/month bandwidth, 60s timeout - Recommended for regular use
- **Enterprise**: Custom limits - For heavy/commercial use

---

## Configuration Questions

### Q: How do I change the target server?
**A:** Edit `api/proxy.js`:
```javascript
const TARGET_HOST = 'ra.sdupdates.news'; // Change this line
```
Then redeploy:
```bash
vercel --prod
```

### Q: What if my V2Ray server uses a different path than `/xhttp`?
**A:** You need to update both `vercel.json` and your client config:

**vercel.json:**
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

**Client config:** Use `/your-custom-path` instead of `/xhttp`

### Q: Can I use environment variables for configuration?
**A:** Yes! 

**Step 1:** Add environment variable in Vercel:
- Project Settings → Environment Variables
- Name: `TARGET_HOST`, Value: `your-server.com`

**Step 2:** Update `api/proxy.js`:
```javascript
const TARGET_HOST = process.env.TARGET_HOST || 'ra.sdupdates.news';
```

**Step 3:** Redeploy

### Q: How do I add authentication to the proxy?
**A:** V2Ray handles authentication (UUID-based). If you want to add an additional layer:

```javascript
export default async function handler(req) {
  // Add API key check
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // ... rest of proxy logic
}
```

---

## Performance Questions

### Q: How much slower is it compared to direct connection?
**A:** Expect +50-200ms additional latency. Actual impact depends on:
- Your location relative to Vercel edge servers
- Your server location
- Network conditions
- Vercel plan (Pro has less cold start delay)

### Q: Why is my first connection slow?
**A:** "Cold start" - Vercel Edge Functions are initialized on first request. Subsequent requests are faster. Pro plan reduces cold start times.

### Q: Can I make it faster?
**A:** Tips:
1. **Upgrade to Pro plan**: Faster cold starts
2. **Use custom domain with geo-routing**: Route to nearest edge
3. **Keep connections active**: Periodic traffic prevents cold starts
4. **Server location**: Place V2Ray server near Vercel regions

### Q: What's the maximum bandwidth I can use?
**A:**
- **Hobby**: 100 GB/month
- **Pro**: 1 TB/month
- **Enterprise**: Custom

Monitor usage in Vercel Dashboard → Analytics

### Q: Will this work for streaming video?
**A:** ⚠️ Depends:
- **Yes**: If video chunks are < 4.5 MB each
- **Yes**: If requests complete within timeout (10s Hobby, 60s Pro)
- **No**: For very large single requests
- **Better for**: Web browsing, messaging, API calls

---

## Troubleshooting Questions

### Q: I get "502 Bad Gateway" - what's wrong?
**A:** Backend server is unreachable. Check:
1. Is `ra.sdupdates.news` accessible from your location?
2. Try: `curl https://ra.sdupdates.news/xhttp/`
3. Check if V2Ray server is running
4. Check firewall rules on server
5. Verify DNS resolution

### Q: I get "504 Gateway Timeout" - what's wrong?
**A:** Request took too long. Solutions:
1. **Upgrade to Pro plan**: 10s → 60s timeout
2. **Optimize backend**: Faster V2Ray server responses
3. **Check network**: Slow connection between Vercel and your server

### Q: Connection fails with "TLS handshake error"
**A:** Check V2Ray client config:
- ✅ SNI must be: `your-project.vercel.app` (NOT `ra.sdupdates.news`)
- ✅ TLS must be enabled
- ✅ Port must be 443
- ✅ serverName must match your Vercel domain

### Q: "Connection reset" or frequent disconnections?
**A:** Possible causes:
1. **Timeout**: Requests taking too long → Upgrade to Pro
2. **Request size**: Exceeding 4.5 MB limit → Reduce payload size
3. **Backend issues**: Check V2Ray server logs
4. **Network instability**: Check your internet connection

### Q: How do I view error logs?
**A:** 
```bash
# Real-time logs
vercel logs --follow

# Or in Vercel Dashboard
Project → Deployments → Select deployment → View logs
```

### Q: Authentication keeps failing?
**A:** Verify:
1. UUID in client matches server exactly
2. Encryption is set to `none` for VLESS
3. Flow parameter is empty or omitted
4. Path is `/xhttp` (case-sensitive)
5. Host/SNI is Vercel domain (not real server)

---

## Security Questions

### Q: Is this secure?
**A:** Yes, with proper setup:
- ✅ V2Ray encryption (end-to-end)
- ✅ HTTPS/TLS (hop-by-hop)
- ✅ UUID authentication
- ✅ No credentials stored in proxy

### Q: Can someone steal my V2Ray access?
**A:** Only if they get your:
- UUID (keep it secret)
- Vercel domain
- Path (`/xhttp`)
- Other V2Ray config details

Don't share your complete V2Ray config.

### Q: Should I use TLS fingerprinting?
**A:** Yes, recommended:
```javascript
"fingerprint": "chrome"  // or "firefox", "safari"
```
Makes your traffic look like normal browser traffic.

### Q: Can my ISP see what I'm doing?
**A:** They see:
- ✅ You're connecting to Vercel (vercel.app)
- ✅ HTTPS encrypted traffic
- ❌ Cannot see actual V2Ray traffic content
- ❌ Cannot see final destination through V2Ray

### Q: What does Vercel log?
**A:** Vercel logs:
- Request method, path, status code
- Response time, size
- Edge location used
- Error messages (if any)

They cannot decrypt V2Ray payload.

### Q: Should I use a firewall on my V2Ray server?
**A:** Yes! Configure to only accept connections from Vercel IPs (optional but recommended for security).

---

## Cost Questions

### Q: How much does this cost?
**A:** 
- **Vercel Hobby**: Free (100 GB bandwidth/month)
- **Vercel Pro**: $20/month (1 TB bandwidth/month)
- **Your V2Ray server**: Separate cost (VPS, etc.)

### Q: What happens if I exceed bandwidth?
**A:** Vercel will:
1. Email you when approaching limit
2. Suggest upgrading to Pro
3. May throttle or charge overage (check Vercel terms)

### Q: Can I get unlimited bandwidth?
**A:** No, but Enterprise plan offers higher custom limits. Contact Vercel sales.

### Q: Is Pro plan worth it?
**A:** Pro plan benefits:
- ✅ 10x bandwidth (100 GB → 1 TB)
- ✅ Longer timeout (10s → 60s)
- ✅ Faster cold starts
- ✅ Priority support

**Recommended if:**
- Using daily for > 3 GB/day
- Need reliable connections
- Want better performance

---

## Technical Questions

### Q: What HTTP methods are supported?
**A:** All standard methods:
- GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS

### Q: Can I use this with WebSocket?
**A:** ⚠️ Limited. V2Ray xhttp uses HTTP/1.1 or HTTP/2, not WebSocket. This proxy supports what V2Ray xhttp needs.

### Q: What's the maximum request/response size?
**A:** 4.5 MB per request/response on Vercel Edge Functions.

For larger transfers:
- Split into multiple requests
- Use streaming where possible
- Consider direct connection for bulk data

### Q: Does it support HTTP/2 or HTTP/3?
**A:** 
- **HTTP/2**: ✅ Yes, automatic with TLS
- **HTTP/3**: ⚠️ Depends on Vercel and client support

### Q: Can I run this locally for testing?
**A:** Yes!
```bash
npm install -g vercel
vercel dev
# Test on http://localhost:3000/xhttp/
```

### Q: What Node.js version is required?
**A:** Edge Functions run on V8 isolates, not Node.js. No Node.js installation needed for deployment.

For local testing with `vercel dev`: Node.js 14+ recommended.

### Q: Can I use TypeScript?
**A:** Yes! Rename `api/proxy.js` to `api/proxy.ts`:

```typescript
import type { Request } from '@vercel/edge';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  // ... proxy logic
}
```

---

## V2Ray-Specific Questions

### Q: What V2Ray transports are supported?
**A:** This is optimized for **xhttp**. Other transports may work but are not tested:
- ✅ xhttp
- ⚠️ H2, gRPC (may work, not tested)
- ❌ WebSocket (different approach needed)
- ❌ TCP, mKCP, QUIC (not HTTP-based)

### Q: Can I use VLESS or VMess?
**A:** Both should work:
- ✅ VLESS (recommended, tested)
- ✅ VMess (should work, not extensively tested)

Protocol is handled by V2Ray, not the proxy.

### Q: Do I need to change my V2Ray server config?
**A:** No! Server config stays the same. Only client config changes to use Vercel domain instead of direct server domain.

### Q: What about V2Ray features like routing, DNS?
**A:** All V2Ray features work normally. The proxy is transparent - it just forwards HTTP traffic.

### Q: Can I use this with Shadowsocks?
**A:** No, this is specifically for V2Ray xhttp. Shadowsocks uses different protocols.

---

## Comparison Questions

### Q: Vercel vs Cloudflare Workers?
**A:**

| Feature | Vercel | Cloudflare |
|---------|--------|------------|
| Setup | Easier | Moderate |
| Free bandwidth | 100 GB | 100 GB |
| Free timeout | 10s | 10s |
| Edge locations | 40+ | 275+ |
| Request limit | 4.5 MB | 100 MB (paid) |

Both are good choices. This project is Vercel-optimized.

### Q: Why not use Cloudflare?
**A:** You can! Cloudflare Workers would work similarly. This project is designed for Vercel because:
- Simpler deployment
- Better documentation
- Native Edge Function support
- Free tier is generous

### Q: Can I migrate to Cloudflare later?
**A:** Yes, with minor code changes. The proxy logic would be similar but use Cloudflare Workers API.

---

## Advanced Questions

### Q: Can I proxy multiple V2Ray servers?
**A:** Yes! Update `api/proxy.js`:

```javascript
const TARGET_MAP = {
  '/xhttp1': 'server1.example.com',
  '/xhttp2': 'server2.example.com',
};

const pathPrefix = '/' + url.pathname.split('/')[1];
const TARGET_HOST = TARGET_MAP[pathPrefix] || 'ra.sdupdates.news';
```

Update `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/xhttp1/:path*", "destination": "/api/proxy" },
    { "source": "/xhttp2/:path*", "destination": "/api/proxy" }
  ]
}
```

### Q: Can I add rate limiting?
**A:** Yes, but requires external storage (e.g., Vercel KV, Redis):

```javascript
// Simplified example (needs Vercel KV)
const { get, set } = await import('@vercel/kv');

const clientId = req.headers.get('x-forwarded-for');
const requestCount = await get(`rate:${clientId}`) || 0;

if (requestCount > 100) {
  return new Response('Rate limited', { status: 429 });
}

await set(`rate:${clientId}`, requestCount + 1, { ex: 3600 });
```

### Q: Can I add logging/analytics?
**A:** Yes! Send to external service:

```javascript
// Example: Log to external service
await fetch('https://your-logging-service.com/log', {
  method: 'POST',
  body: JSON.stringify({
    timestamp: Date.now(),
    method: req.method,
    path: url.pathname,
    status: response.status,
  }),
});
```

### Q: Can I modify requests/responses?
**A:** Yes, but be careful not to break V2Ray protocol:

```javascript
// Add custom header to backend request
headers.set('X-Custom-Header', 'value');

// Modify response header
responseHeaders.set('X-Proxied-By', 'Vercel');
```

Don't modify body content - it's encrypted V2Ray data.

### Q: Can I add health checks?
**A:** Yes! Add a health endpoint:

```javascript
export default async function handler(req) {
  const url = new URL(req.url);
  
  // Health check endpoint
  if (url.pathname === '/health') {
    return new Response('OK', { status: 200 });
  }
  
  // ... rest of proxy logic
}
```

---

## Maintenance Questions

### Q: How often should I update?
**A:** Check for updates when:
- Vercel releases new Edge Runtime features
- Security vulnerabilities are found
- You need new features

Generally, stable code doesn't need frequent updates.

### Q: How do I monitor usage?
**A:** 
1. **Vercel Dashboard → Analytics**
   - Bandwidth usage
   - Request counts
   - Response times
   
2. **Via CLI:**
   ```bash
   vercel logs --follow
   ```

3. **Set up alerts:**
   - Project Settings → Integrations
   - Add monitoring services

### Q: What if Vercel goes down?
**A:** 
- Vercel has 99.99% uptime SLA (Pro/Enterprise)
- Your V2Ray server can still accept direct connections
- Keep direct server access as backup

### Q: How do I backup my configuration?
**A:** Keep your code in Git:
```bash
git init
git add .
git commit -m "Backup V2Ray proxy config"
git push origin main
```

---

## Getting Help

### Q: Where can I get help?
**A:** 
1. **Documentation**: Read DEPLOYMENT.md, V2RAY_CONFIG.md
2. **GitHub Issues**: Open an issue in this repository
3. **Vercel Support**: https://vercel.com/support
4. **V2Ray Community**: https://www.v2ray.com/

### Q: How do I report a bug?
**A:** Open a GitHub issue with:
- Description of the problem
- Steps to reproduce
- Error messages
- Your Vercel logs (sanitize sensitive data)
- Client configuration (remove UUID)

### Q: Can I contribute improvements?
**A:** Yes! Pull requests welcome:
- Bug fixes
- Documentation improvements
- Feature enhancements
- Performance optimizations

---

## Still have questions?

**Check the documentation:**
- [README.md](./README.md) - Project overview
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [V2RAY_CONFIG.md](./V2RAY_CONFIG.md) - Client configuration
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical deep-dive

**Or open an issue:**
https://github.com/Toton-dhibar/YT-download/issues
