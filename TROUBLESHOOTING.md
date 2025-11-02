# Troubleshooting Guide

Comprehensive troubleshooting guide for common issues with V2Ray xhttp Vercel proxy.

## Quick Diagnostics

Run these commands to quickly diagnose issues:

```bash
# 1. Check if Vercel endpoint is accessible
curl -v https://your-project.vercel.app/xhttp/

# 2. Check if backend is accessible
curl -v https://ra.sdupdates.news/xhttp/

# 3. View Vercel logs
vercel logs --follow

# 4. Check Vercel deployment status
vercel ls
```

---

## Common Error Messages

### 1. "502 Bad Gateway"

**Symptom:** Client receives HTTP 502 error.

**Possible Causes:**
- Backend server is unreachable
- DNS resolution failure
- Network connectivity issue
- Backend server is down

**Solutions:**

**Step 1:** Check if backend is accessible directly
```bash
curl -I https://ra.sdupdates.news/xhttp/
```

**Step 2:** Check Vercel logs for error details
```bash
vercel logs --follow
```

**Step 3:** Verify DNS resolution
```bash
nslookup ra.sdupdates.news
dig ra.sdupdates.news
```

**Step 4:** Check backend V2Ray server status
```bash
# On your server
systemctl status v2ray
# or
ps aux | grep v2ray
```

**Step 5:** Verify firewall allows connections from Vercel
```bash
# Check if Vercel IPs can reach your server
# Vercel uses various IP ranges - may need to allow all HTTPS
```

**Step 6:** Test with different target
Update `api/proxy.js` temporarily:
```javascript
const TARGET_HOST = 'example.com'; // Test with known working server
```

---

### 2. "504 Gateway Timeout"

**Symptom:** Request times out after 10 seconds (Hobby) or 60 seconds (Pro).

**Possible Causes:**
- Backend server is slow to respond
- Network latency is high
- Request is taking too long to process
- Using Hobby plan with long-running requests

**Solutions:**

**Step 1:** Check backend response time
```bash
time curl https://ra.sdupdates.news/xhttp/
```

**Step 2:** Upgrade to Pro plan
- Increases timeout from 10s to 60s+
- Go to Vercel Dashboard → Project Settings → Upgrade

**Step 3:** Optimize backend server
- Check V2Ray server performance
- Check server load: `top`, `htop`
- Optimize network route between Vercel and server

**Step 4:** Add timeout logging
Update `api/proxy.js`:
```javascript
console.log('Request started:', new Date().toISOString());
const response = await fetch(targetUrl, fetchOptions);
console.log('Request completed:', new Date().toISOString());
```

---

### 3. "Connection Failed" / "Cannot Connect"

**Symptom:** V2Ray client cannot establish connection.

**Possible Causes:**
- Wrong Vercel domain in client config
- Incorrect SNI/Host settings
- TLS/SSL certificate issues
- Wrong port number

**Solutions:**

**Step 1:** Verify client configuration
```javascript
// Client must use:
address: "your-project.vercel.app"  // NOT ra.sdupdates.news
port: 443
serverName: "your-project.vercel.app"  // Must match address
host: "your-project.vercel.app"
```

**Step 2:** Test endpoint manually
```bash
curl -v https://your-project.vercel.app/xhttp/ \
  -H "Host: your-project.vercel.app"
```

**Step 3:** Check TLS settings
- TLS must be enabled
- Port must be 443
- SNI must match Vercel domain

**Step 4:** Verify path is correct
- Must be `/xhttp` (case-sensitive)
- Must start with `/`

**Step 5:** Check client logs
```bash
# V2Ray client logs (location varies by platform)
# Look for specific error messages
```

---

### 4. "TLS Handshake Error"

**Symptom:** TLS/SSL handshake fails.

**Possible Causes:**
- SNI mismatch
- Wrong serverName in client config
- Client using old TLS version
- Certificate verification issues

**Solutions:**

**Step 1:** Verify SNI matches Vercel domain
```javascript
// In V2Ray client config:
"tlsSettings": {
  "serverName": "your-project.vercel.app"  // Must match exactly
}
```

**Step 2:** Test TLS connection
```bash
openssl s_client -connect your-project.vercel.app:443 \
  -servername your-project.vercel.app
```

**Step 3:** Disable certificate verification (testing only)
```javascript
// Temporarily in client config:
"tlsSettings": {
  "allowInsecure": true  // Only for testing!
}
```

**Step 4:** Update client software
- Ensure V2Ray client is up to date
- Old versions may have TLS compatibility issues

---

### 5. "Authentication Failed" / "Invalid User"

**Symptom:** Connection establishes but authentication fails.

**Possible Causes:**
- UUID mismatch between client and server
- Wrong encryption setting
- Flow parameter incorrectly set
- Backend V2Ray server issue

**Solutions:**

**Step 1:** Verify UUID matches exactly
```javascript
// Client config
"id": "550e8400-e29b-41d4-a716-446655440000"

// Must match server config exactly (including case)
```

**Step 2:** Check encryption setting
```javascript
// For VLESS, must be:
"encryption": "none"

// NOT "auto" or other values
```

**Step 3:** Verify flow parameter
```javascript
// For xhttp, should be:
"flow": ""  // Empty string

// Or omit the parameter entirely
```

**Step 4:** Check server logs
```bash
# On V2Ray server
tail -f /var/log/v2ray/access.log
tail -f /var/log/v2ray/error.log
```

**Step 5:** Test direct connection to server
- Temporarily configure client to connect directly to `ra.sdupdates.news`
- If that works, issue is with proxy configuration

---

### 6. "Connection Reset" / Frequent Disconnections

**Symptom:** Connection drops frequently or resets unexpectedly.

**Possible Causes:**
- Timeout limits exceeded
- Request size exceeds 4.5 MB
- Network instability
- Backend server issues

**Solutions:**

**Step 1:** Check request sizes
```javascript
// Add logging to api/proxy.js
console.log('Request size:', req.headers.get('content-length'));
console.log('Response size:', response.headers.get('content-length'));
```

**Step 2:** Monitor for timeouts
```bash
vercel logs --follow | grep -i timeout
```

**Step 3:** Upgrade to Pro plan
- Longer timeouts
- Better stability

**Step 4:** Keep connections active
```javascript
// In V2Ray client, enable keep-alive if available
```

**Step 5:** Check network stability
```bash
# Test connection stability
ping your-project.vercel.app
mtr your-project.vercel.app
```

---

### 7. Slow Performance / High Latency

**Symptom:** Connection is established but very slow.

**Possible Causes:**
- Cold start delay
- Geographic distance
- Network congestion
- Backend server performance

**Solutions:**

**Step 1:** Measure latency components
```bash
# Latency to Vercel
ping your-project.vercel.app

# Latency to backend
ping ra.sdupdates.news

# Total latency
time curl https://your-project.vercel.app/xhttp/
```

**Step 2:** Reduce cold starts
- Upgrade to Pro plan
- Keep connections active with periodic requests
- Use custom domain with better routing

**Step 3:** Optimize backend location
- Choose V2Ray server close to Vercel regions
- Consider server in US/Europe for better Vercel connectivity

**Step 4:** Use CDN optimally
- Custom domain can route to nearest Vercel edge
- Check which edge location you're hitting

**Step 5:** Benchmark comparison
```bash
# Direct connection speed
time curl https://ra.sdupdates.news/xhttp/

# Via Vercel speed
time curl https://your-project.vercel.app/xhttp/

# Difference is the proxy overhead
```

---

### 8. "Rate Limited" / 429 Errors

**Symptom:** Receiving HTTP 429 Too Many Requests.

**Possible Causes:**
- Hitting Vercel's rate limits
- Too many concurrent requests
- Backend server rate limiting

**Solutions:**

**Step 1:** Check Vercel limits
- Hobby: 100 concurrent executions
- Pro: 1,000 concurrent executions

**Step 2:** Reduce request frequency
```javascript
// In client, add delay between requests
await sleep(1000); // Wait 1 second
```

**Step 3:** Upgrade plan if needed
- Pro plan has higher limits

**Step 4:** Check backend server
```bash
# Verify backend isn't rate limiting
curl -v https://ra.sdupdates.news/xhttp/
```

---

### 9. "Bandwidth Limit Exceeded"

**Symptom:** Service stops working after heavy usage.

**Possible Causes:**
- Exceeded monthly bandwidth limit (100 GB Hobby, 1 TB Pro)
- Vercel has disabled the function

**Solutions:**

**Step 1:** Check usage in Vercel Dashboard
- Go to Analytics
- View bandwidth usage

**Step 2:** Upgrade plan
```bash
# In Vercel Dashboard
Project Settings → Upgrade to Pro
```

**Step 3:** Monitor usage proactively
- Set up alerts in Vercel Dashboard
- Track daily usage

**Step 4:** Optimize bandwidth usage
- Compress data if possible (at V2Ray level)
- Use proxy only for necessary traffic
- Consider direct connection for bulk transfers

---

## Deployment Issues

### Deployment Fails

**Symptom:** `vercel --prod` fails with error.

**Solutions:**

**Step 1:** Check vercel.json syntax
```bash
node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'))"
```

**Step 2:** Check proxy.js syntax
```bash
node --check api/proxy.js
```

**Step 3:** Verify Vercel CLI is up to date
```bash
npm update -g vercel
```

**Step 4:** Check Vercel service status
- Visit https://www.vercel-status.com/

**Step 5:** Review deployment logs
```bash
vercel logs
```

---

### Configuration Not Applied

**Symptom:** Changes to vercel.json or proxy.js don't take effect.

**Solutions:**

**Step 1:** Ensure you redeployed
```bash
vercel --prod
```

**Step 2:** Clear cache
```bash
# Force new deployment
vercel --force --prod
```

**Step 3:** Verify deployment URL
```bash
# Make sure you're testing the right deployment
vercel ls
```

**Step 4:** Wait for propagation
- Global CDN propagation takes ~30 seconds
- Wait and try again

---

## Client Configuration Issues

### Config Import Fails

**Symptom:** Can't import V2Ray config from link or file.

**Solutions:**

**Step 1:** Verify link format
```
vless://UUID@domain:443?params...
```

**Step 2:** URL encode special characters
```bash
# Path must be URL encoded
/xhttp → %2Fxhttp
```

**Step 3:** Use manual configuration
- Instead of importing, manually enter each field

**Step 4:** Check client compatibility
- Ensure client supports VLESS + xhttp
- Update to latest client version

---

### Wrong Parameters

**Symptom:** Using wrong configuration values.

**Common Mistakes:**

| Parameter | ❌ Wrong | ✅ Correct |
|-----------|---------|-----------|
| address | ra.sdupdates.news | your-project.vercel.app |
| serverName | ra.sdupdates.news | your-project.vercel.app |
| host | ra.sdupdates.news | your-project.vercel.app |
| path | xhttp | /xhttp |
| port | 80 | 443 |
| security | none | tls |

**Solution:** Use values from [V2RAY_CONFIG.md](./V2RAY_CONFIG.md)

---

## Debugging Techniques

### Enable Verbose Logging

**Update api/proxy.js:**
```javascript
export default async function handler(req) {
  console.log('=== Request Start ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers));
  
  try {
    const targetUrl = // ... construct URL
    console.log('Target URL:', targetUrl);
    
    const response = await fetch(targetUrl, fetchOptions);
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));
    
    return response;
  } catch (error) {
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    console.log('=== Request End ===');
  }
}
```

**View logs:**
```bash
vercel logs --follow
```

---

### Test with curl

**Basic test:**
```bash
curl -v https://your-project.vercel.app/xhttp/
```

**With headers:**
```bash
curl -v https://your-project.vercel.app/xhttp/ \
  -H "User-Agent: v2ray-core/5.0" \
  -H "X-Test: true"
```

**POST request:**
```bash
curl -v -X POST https://your-project.vercel.app/xhttp/ \
  -H "Content-Type: application/octet-stream" \
  -d "test data"
```

---

### Compare Direct vs Proxy

**Direct connection:**
```bash
# Test backend directly
curl -v https://ra.sdupdates.news/xhttp/ \
  -H "Host: ra.sdupdates.news"

# Note: Status, headers, response
```

**Via proxy:**
```bash
# Test via Vercel proxy
curl -v https://your-project.vercel.app/xhttp/ \
  -H "Host: your-project.vercel.app"

# Should be similar to direct (except timing)
```

---

### Check Vercel Edge Location

**Add to api/proxy.js:**
```javascript
console.log('Vercel Region:', process.env.VERCEL_REGION);
console.log('Request ID:', req.headers.get('x-vercel-id'));
```

**Or check response headers:**
```bash
curl -I https://your-project.vercel.app/xhttp/
# Look for: x-vercel-id, server, etc.
```

---

### Network Path Tracing

**Trace route to Vercel:**
```bash
traceroute your-project.vercel.app
mtr your-project.vercel.app
```

**Trace route to backend:**
```bash
traceroute ra.sdupdates.news
mtr ra.sdupdates.news
```

---

## Advanced Troubleshooting

### Packet Inspection

**Use Wireshark/tcpdump:**
```bash
# Capture traffic to Vercel
sudo tcpdump -i any -w vercel.pcap host your-project.vercel.app

# Analyze with Wireshark
wireshark vercel.pcap
```

**Note:** Traffic is encrypted, but you can see:
- Connection establishment
- TLS handshake
- Packet timing
- Connection drops

---

### Test with Different Clients

Try multiple V2Ray clients to isolate issues:
- V2RayN (Windows)
- V2RayNG (Android)
- Qv2ray (Cross-platform)
- v2ray-core (Command line)

If one works but another doesn't → client-specific issue.

---

### Isolate Components

Test each component separately:

**1. Test Vercel deployment:**
```bash
curl https://your-project.vercel.app/xhttp/
# Should get some response (even if error)
```

**2. Test backend directly:**
```bash
curl https://ra.sdupdates.news/xhttp/
# Should get V2Ray response
```

**3. Test V2Ray client:**
```bash
# Configure to connect directly to server
# If that works, issue is with proxy setup
```

---

## Getting More Help

### Collect Diagnostic Information

When asking for help, provide:

**1. Error messages:**
```bash
vercel logs --follow > logs.txt
# Share logs.txt (remove sensitive info)
```

**2. Configuration:**
```javascript
// Share vercel.json (safe)
// Share proxy.js (safe)
// Share V2Ray client config (REMOVE UUID!)
```

**3. Test results:**
```bash
curl -v https://your-project.vercel.app/xhttp/ 2>&1 | tee test.txt
# Share test.txt
```

**4. Environment:**
- Vercel plan (Hobby/Pro)
- V2Ray client version
- Operating system
- Network environment

---

### Support Channels

1. **GitHub Issues:**
   - https://github.com/Toton-dhibar/YT-download/issues
   - Provide diagnostic info above

2. **Vercel Support:**
   - https://vercel.com/support
   - For Vercel-specific issues

3. **V2Ray Community:**
   - https://www.v2ray.com/
   - For V2Ray-specific issues

---

## Prevention Tips

### Monitor Proactively

```bash
# Set up monitoring
vercel logs --follow | grep -i error

# Or use monitoring service
# Vercel Integrations → Add monitoring
```

### Regular Maintenance

**Weekly:**
- Check Vercel Dashboard for alerts
- Review bandwidth usage
- Test connection

**Monthly:**
- Update Vercel CLI: `npm update -g vercel`
- Review logs for patterns
- Optimize if needed

### Best Practices

1. ✅ Keep configuration in Git
2. ✅ Test after any changes
3. ✅ Monitor bandwidth usage
4. ✅ Have backup access method
5. ✅ Document your setup
6. ✅ Set up alerts in Vercel

---

## Quick Reference: Error Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 502 | Bad Gateway | Backend unreachable |
| 504 | Gateway Timeout | Request too slow |
| 429 | Too Many Requests | Rate limited |
| 403 | Forbidden | Access denied |
| 401 | Unauthorized | Auth failed (V2Ray) |
| 500 | Internal Error | Proxy code error |
| 413 | Payload Too Large | >4.5 MB request |

---

Need more help? See [FAQ.md](./FAQ.md) or open an issue.
