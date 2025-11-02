# Testing Guide - V2Ray xhttp Vercel Proxy

This guide helps you test and verify your Vercel proxy deployment.

## 🧪 Pre-Deployment Testing

Before deploying to Vercel, verify your configuration files.

### 1. Validate JSON Files

```bash
# Validate vercel.json
node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'))"

# Validate package.json
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"

# Validate v2ray-client-config-example.json
node -e "JSON.parse(require('fs').readFileSync('v2ray-client-config-example.json', 'utf8'))"
```

All commands should complete without errors.

### 2. Check JavaScript Syntax

```bash
# Check api/proxy.js syntax
node -c api/proxy.js
```

Should output nothing (syntax OK).

### 3. Local Testing with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Start local development server
vercel dev

# Test the proxy
curl -I http://localhost:3000/xhttp
```

Expected: Response from ra.sdupdates.news (or connection error if server is down).

## 🚀 Post-Deployment Testing

After deploying to Vercel, run these tests.

### Test 1: Proxy Endpoint Accessibility

```bash
# Replace with your Vercel URL
curl -I https://your-project.vercel.app/xhttp
```

**Expected Response:**
```
HTTP/2 200
content-type: text/html
date: ...
server: Vercel
```

Or similar response from ra.sdupdates.news.

**If you get 404:** Check vercel.json routing configuration.

**If you get 502:** Check if ra.sdupdates.news is accessible.

### Test 2: POST Request with Body

```bash
# Test POST with data
curl -X POST https://your-project.vercel.app/xhttp \
  -H "Content-Type: application/octet-stream" \
  -d "test data"
```

**Expected:** Response from the server (not 404, not 502).

### Test 3: Header Forwarding

```bash
# Test custom header forwarding
curl https://your-project.vercel.app/xhttp \
  -H "X-Custom-Header: test-value" \
  -v 2>&1 | grep -i "x-custom-header"
```

**Expected:** Header should be forwarded to the server.

### Test 4: Path Preservation

```bash
# Test that paths are preserved
curl -I https://your-project.vercel.app/xhttp/subpath/test
```

**Expected:** Request reaches ra.sdupdates.news/xhttp/subpath/test

Check Vercel logs to verify the target URL.

### Test 5: Query Parameters

```bash
# Test query parameter preservation
curl -I "https://your-project.vercel.app/xhttp?param1=value1&param2=value2"
```

**Expected:** Query parameters forwarded to real server.

### Test 6: Large Request Body

```bash
# Create test file (1 MB)
dd if=/dev/urandom of=/tmp/testfile bs=1M count=1

# Upload via proxy
curl -X POST https://your-project.vercel.app/xhttp \
  -H "Content-Type: application/octet-stream" \
  --data-binary @/tmp/testfile \
  -w "Status: %{http_code}\n"
```

**Expected:** 200 or valid response (not 413 Payload Too Large).

**Note:** Vercel Edge Functions have a 4.5 MB request body limit.

### Test 7: Different HTTP Methods

```bash
# Test GET
curl -X GET https://your-project.vercel.app/xhttp
# Expected: Valid response

# Test POST
curl -X POST https://your-project.vercel.app/xhttp
# Expected: Valid response

# Test PUT
curl -X PUT https://your-project.vercel.app/xhttp
# Expected: Valid response

# Test DELETE
curl -X DELETE https://your-project.vercel.app/xhttp
# Expected: Valid response (or 405 if not allowed by server)
```

### Test 8: Concurrent Connections

```bash
# Test multiple simultaneous connections
for i in {1..10}; do
  curl -I https://your-project.vercel.app/xhttp &
done
wait
```

**Expected:** All requests complete successfully.

### Test 9: Connection Persistence

```bash
# Test long-running connection (if possible)
# This simulates xhttp long-polling behavior
curl https://your-project.vercel.app/xhttp \
  --max-time 300 \
  -v
```

**Expected:** Connection stays open (no timeout after 10-60 seconds).

Edge Functions have no timeout, so this should work indefinitely.

## 🔍 Vercel Dashboard Checks

### 1. View Function Logs

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Functions** tab
4. Click `api/proxy.js`
5. View real-time logs

**Expected logs:**
```
[Proxy] GET /xhttp -> https://ra.sdupdates.news/xhttp
[Proxy] Response: 200 OK
```

### 2. Check Deployment Status

1. Go to your project → **Deployments**
2. Latest deployment should be **Ready**
3. Click deployment → See build logs

**Expected:** No errors during build/deployment.

### 3. Monitor Bandwidth

1. Go to your project → **Usage** tab
2. Check bandwidth consumption
3. Ensure you're within limits (100 GB/month for free tier)

## 🧑‍💻 V2Ray Client Testing

### Test 1: Update Client Configuration

1. Update V2Ray client config (see [DEPLOYMENT.md](./DEPLOYMENT.md#v2ray-client-configuration))
2. Save configuration
3. Restart V2Ray client

**Expected:** Client connects successfully.

### Test 2: Connection Test

```bash
# With V2Ray client running, test internet access
curl --proxy socks5://127.0.0.1:1080 https://ipinfo.io/ip
```

**Expected:** Shows an IP address (not your real IP, not ra.sdupdates.news IP).

### Test 3: Speed Test

```bash
# With V2Ray client running
curl --proxy socks5://127.0.0.1:1080 https://fast.com
```

Or use a browser with V2Ray client:
1. Configure browser to use SOCKS5 proxy (127.0.0.1:1080)
2. Visit [https://fast.com](https://fast.com)
3. Check speed

**Expected:** Reasonable speed (at least 5-10 Mbps for video streaming).

**If slow:** Check edge location proximity and server bandwidth.

### Test 4: DNS Leak Test

1. Connect via V2Ray client
2. Visit [https://dnsleaktest.com](https://dnsleaktest.com)
3. Run extended test

**Expected:** DNS servers NOT showing your real ISP.

### Test 5: IP Leak Test

1. Connect via V2Ray client
2. Visit [https://ipleak.net](https://ipleak.net)

**Expected:**
- ✅ IPv4: Different from your real IP
- ✅ IPv6: Disabled or different from your real IP
- ✅ DNS: Not showing your real ISP DNS
- ✅ WebRTC: Not leaking your real IP

### Test 6: Stability Test

Leave V2Ray client connected for 1+ hours:

```bash
# Run continuous ping through proxy
while true; do
  curl --proxy socks5://127.0.0.1:1080 -s https://ipinfo.io/ip
  sleep 60
done
```

**Expected:** No disconnections, consistent responses.

## 🔧 Troubleshooting Tests

### Test: Proxy Not Working

**Symptom:** 404 errors when accessing proxy

**Debug:**
```bash
# Check if vercel.json is correct
cat vercel.json | grep -A 3 "rewrites"

# Should show:
# "rewrites": [
#   { "source": "/xhttp/:path*", "destination": "/api/proxy" }
# ]
```

**Fix:** Ensure vercel.json has correct rewrite rules, redeploy.

### Test: 502 Bad Gateway

**Symptom:** Proxy returns 502

**Debug:**
```bash
# Test if real server is accessible
curl -I https://ra.sdupdates.news/xhttp

# Check Vercel logs for errors
```

**Fix:** Ensure ra.sdupdates.news is online and accessible.

### Test: Connection Timeout

**Symptom:** Connections timeout after 10-60 seconds

**Debug:**
```bash
# Check edge function runtime
grep "runtime" api/proxy.js

# Should show:
# runtime: 'edge'
```

**Fix:** Ensure `runtime: 'edge'` is set in proxy.js (not 'nodejs').

### Test: SSL Certificate Error

**Symptom:** V2Ray client shows SSL error

**Debug:**
```bash
# Test SSL certificate
openssl s_client -connect your-project.vercel.app:443 \
  -servername your-project.vercel.app < /dev/null

# Should show valid certificate
```

**Fix:** Ensure client `serverName` matches Vercel domain exactly.

## 📊 Performance Testing

### Test 1: Latency Test

```bash
# Test latency to Vercel edge
ping your-project.vercel.app

# Test latency to real server
ping ra.sdupdates.news
```

**Expected:** Vercel edge should be closer (lower latency).

### Test 2: Throughput Test

```bash
# Download speed test
curl https://your-project.vercel.app/xhttp/large-file \
  -o /dev/null \
  -w "Speed: %{speed_download} bytes/sec\n"
```

**Expected:** At least 1-10 MB/sec depending on connection.

### Test 3: Cold Start Test

```bash
# Wait 5+ minutes (edge function goes cold)
sleep 300

# Test first request (cold start)
time curl -I https://your-project.vercel.app/xhttp
```

**Expected:** Response time < 500ms (edge functions are fast to start).

## ✅ Acceptance Criteria

Your deployment is successful if:

- [x] Proxy endpoint returns valid response (not 404)
- [x] POST requests with body work correctly
- [x] Headers are forwarded properly
- [x] Query parameters preserved
- [x] Large requests work (up to 4 MB)
- [x] Multiple HTTP methods supported
- [x] Concurrent connections work
- [x] No timeout after 60+ seconds
- [x] Vercel logs show successful requests
- [x] V2Ray client connects successfully
- [x] Internet access works through proxy
- [x] Speed test shows reasonable performance
- [x] No DNS/IP leaks
- [x] Connection stable for 1+ hours

## 🎯 Summary

All tests passing? **Congratulations! Your V2Ray xhttp Vercel proxy is working correctly.** 🎉

Having issues? See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for troubleshooting.

---

**Next Steps:**
- Monitor bandwidth usage in Vercel dashboard
- Set up custom domain (optional)
- Configure V2Ray client for optimal performance
- Enjoy your proxied connection! 🚀
