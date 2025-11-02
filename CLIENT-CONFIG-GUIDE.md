# V2Ray Client Configuration Guide

This guide explains how to configure your V2Ray client to use the Vercel CDN proxy.

## Quick Reference

**Replace these values in your client configuration:**

| Setting | Old Value (Direct) | New Value (Via Vercel) |
|---------|-------------------|------------------------|
| Server Address | `ra.sdupdates.news` | `your-project.vercel.app` |
| Port | `443` | `443` (no change) |
| Host | `ra.sdupdates.news` | `your-project.vercel.app` |
| Path | `/xhttp` | `/xhttp` (no change) |
| TLS SNI | `ra.sdupdates.news` | `your-project.vercel.app` |
| UUID | `your-uuid` | `your-uuid` (no change) |

---

## Complete Configuration Examples

### 1. Core V2Ray (JSON Config)

Use the provided `v2ray-client-config.json` file with these modifications:

```json
{
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "your-project.vercel.app",  // ← Change this
            "port": 443,
            "users": [
              {
                "id": "YOUR-UUID-HERE",  // ← Your UUID from server
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "tls",
        "xhttpSettings": {
          "path": "/xhttp",
          "host": "your-project.vercel.app"  // ← Change this
        },
        "tlsSettings": {
          "serverName": "your-project.vercel.app",  // ← Change this
          "allowInsecure": false,
          "fingerprint": "chrome"
        }
      }
    }
  ]
}
```

**Steps:**
1. Copy `v2ray-client-config.json` to your V2Ray config directory
2. Replace `your-project.vercel.app` with your actual Vercel domain (3 places)
3. Replace `YOUR-UUID-HERE` with your server UUID
4. Restart V2Ray

---

### 2. V2RayN (Windows)

V2RayN uses a GUI, so configure these fields:

#### Server Configuration

1. **Main Settings:**
   - **Address (Server):** `your-project.vercel.app`
   - **Port:** `443`
   - **User ID (UUID):** `YOUR-UUID-HERE`
   - **Encryption:** `none`

2. **Transport Settings:**
   - **Network:** `xhttp` (or `http` if xhttp not available, use latest version)
   - **Path:** `/xhttp`
   - **Host:** `your-project.vercel.app`

3. **TLS Settings:**
   - **Security:** `tls`
   - **SNI (Server Name):** `your-project.vercel.app`
   - **Fingerprint:** `chrome` (optional)
   - **Allow Insecure:** `false` (unchecked)

#### Screenshot Reference
```
┌─────────────────────────────────────┐
│ Server Configuration                │
├─────────────────────────────────────┤
│ Address:  your-project.vercel.app   │
│ Port:     443                       │
│ UUID:     xxxxxxxx-xxxx-...         │
│ Protocol: VLESS                     │
│                                     │
│ Transport: xhttp                    │
│ Path:     /xhttp                    │
│ Host:     your-project.vercel.app   │
│                                     │
│ Security: TLS                       │
│ SNI:      your-project.vercel.app   │
└─────────────────────────────────────┘
```

---

### 3. V2RayNG (Android)

#### Configuration Steps

1. Open V2RayNG app
2. Tap the **"+"** button → **"Manual Input [VLESS]"**
3. Fill in these fields:

**Basic Settings:**
- **Alias (Remarks):** `My Proxy via Vercel`
- **Address:** `your-project.vercel.app`
- **Port:** `443`
- **UUID:** `YOUR-UUID-HERE`
- **Encryption:** `none`

**Transport Settings:**
- **Network:** `xhttp` (or `http` in older versions)
- **Header Type:** `none`
- **Path:** `/xhttp`
- **Host:** `your-project.vercel.app`

**TLS Settings:**
- **TLS:** `tls` (enabled)
- **SNI:** `your-project.vercel.app`
- **Fingerprint:** `chrome`
- **Allow Insecure:** `false` (disabled)

4. Tap **"Save"** (checkmark icon)
5. Select your new configuration
6. Tap the connection button

---

### 4. Qv2ray (Cross-platform)

#### JSON Configuration

1. Open Qv2ray
2. Go to **"Preferences"** → **"Advanced"**
3. Click **"Edit Complex Config"**
4. Add this outbound:

```json
{
  "protocol": "vless",
  "settings": {
    "vnext": [
      {
        "address": "your-project.vercel.app",
        "port": 443,
        "users": [
          {
            "id": "YOUR-UUID-HERE",
            "encryption": "none"
          }
        ]
      }
    ]
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
}
```

---

### 5. v2rayA (Web UI)

1. Open v2rayA web interface
2. Click **"Import"** → **"Manually"**
3. Enter this connection string format:

```
vless://YOUR-UUID-HERE@your-project.vercel.app:443?encryption=none&security=tls&sni=your-project.vercel.app&type=xhttp&path=/xhttp&host=your-project.vercel.app#MyVercelProxy
```

**Breaking down the URL:**
- `YOUR-UUID-HERE`: Your server UUID
- `your-project.vercel.app`: Your Vercel domain (appears 3 times)
- `encryption=none`: No additional encryption
- `security=tls`: Use TLS
- `sni=...`: Server Name Indication
- `type=xhttp`: Transport protocol
- `path=/xhttp`: Request path
- `#MyVercelProxy`: Alias/name

---

### 6. Shadowrocket (iOS)

1. Tap **"+"** → **"Type"** → **"VLESS"**
2. Configure:
   - **Server:** `your-project.vercel.app`
   - **Port:** `443`
   - **UUID:** `YOUR-UUID-HERE`
   - **TLS:** `On`
   - **Transport:** `xhttp` (or `HTTP` in older versions)
   - **Path:** `/xhttp`
   - **Host:** `your-project.vercel.app`
   - **SNI:** `your-project.vercel.app`

---

## Verification Steps

After configuring your client:

### 1. Test Connection

```bash
# On your local machine with V2Ray running

# Test SOCKS proxy (default port 1080)
curl --proxy socks5://127.0.0.1:1080 https://ifconfig.me

# Test HTTP proxy (default port 1081)
curl --proxy http://127.0.0.1:1081 https://ifconfig.me

# Should return an IP different from your real IP
```

### 2. Check V2Ray Logs

**Core V2Ray:**
```bash
# Linux/Mac
tail -f /var/log/v2ray/access.log

# Windows (check V2RayN log window)
```

**Look for:**
- ✅ `accepted` connections
- ✅ Successful TLS handshake
- ❌ `connection refused` (server unreachable)
- ❌ `certificate` errors (TLS issues)

### 3. Test in Browser

1. Configure browser to use proxy:
   - SOCKS5: `127.0.0.1:1080`
   - HTTP: `127.0.0.1:1081`

2. Visit [https://ifconfig.me](https://ifconfig.me)
   - Should show different IP

3. Visit [https://dnsleaktest.com](https://dnsleaktest.com)
   - Check for DNS leaks

---

## Troubleshooting

### Connection Fails

**Symptom:** Can't connect, timeout errors

**Solutions:**
1. Verify Vercel deployment is active
2. Check domain spelling (no typos)
3. Ensure port 443 is correct
4. Test direct connection to Vercel:
   ```bash
   curl https://your-project.vercel.app/xhttp/
   ```

### TLS Errors

**Symptom:** Certificate errors, SSL handshake failed

**Solutions:**
1. Ensure SNI matches Vercel domain
2. Check "Allow Insecure" is `false`
3. Verify Vercel has valid SSL certificate
4. Try setting `fingerprint: "chrome"`

### Slow Connection

**Symptom:** High latency, slow speeds

**Possible Causes:**
1. **Vercel Edge Location:** 
   - Check nearest Vercel edge node
   - Consider geographic location

2. **Cold Starts:**
   - First request may be slow
   - Subsequent requests should be faster

3. **Backend Server:**
   - Check your V2Ray server's response time
   - The proxy adds minimal latency

4. **Timeout Issues:**
   - Free tier has 10s timeout
   - Long connections might fail
   - Consider Vercel Pro for longer timeouts

### Authentication Errors

**Symptom:** "Invalid user" or authentication failed

**Solutions:**
1. Double-check UUID matches server
2. Ensure encryption is set to `none`
3. Verify server configuration hasn't changed

---

## Advanced Configuration

### Multiple Servers via Vercel

If you have multiple V2Ray servers behind different Vercel proxies:

```json
{
  "outbounds": [
    {
      "tag": "proxy-us",
      "protocol": "vless",
      "settings": {
        "vnext": [{
          "address": "us-proxy.vercel.app",
          "port": 443,
          "users": [{"id": "uuid-1", "encryption": "none"}]
        }]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "tls",
        "xhttpSettings": {
          "path": "/xhttp",
          "host": "us-proxy.vercel.app"
        },
        "tlsSettings": {
          "serverName": "us-proxy.vercel.app"
        }
      }
    },
    {
      "tag": "proxy-eu",
      "protocol": "vless",
      "settings": {
        "vnext": [{
          "address": "eu-proxy.vercel.app",
          "port": 443,
          "users": [{"id": "uuid-2", "encryption": "none"}]
        }]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "tls",
        "xhttpSettings": {
          "path": "/xhttp",
          "host": "eu-proxy.vercel.app"
        },
        "tlsSettings": {
          "serverName": "eu-proxy.vercel.app"
        }
      }
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "domain": ["geosite:us"],
        "outboundTag": "proxy-us"
      },
      {
        "type": "field",
        "domain": ["geosite:eu"],
        "outboundTag": "proxy-eu"
      }
    ]
  }
}
```

### Fallback Configuration

Keep both direct and Vercel proxied connections:

```json
{
  "outbounds": [
    {
      "tag": "proxy-vercel",
      "protocol": "vless",
      "settings": {
        "vnext": [{
          "address": "your-project.vercel.app",
          "port": 443,
          "users": [{"id": "YOUR-UUID", "encryption": "none"}]
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
          "serverName": "your-project.vercel.app"
        }
      }
    },
    {
      "tag": "proxy-direct",
      "protocol": "vless",
      "settings": {
        "vnext": [{
          "address": "ra.sdupdates.news",
          "port": 443,
          "users": [{"id": "YOUR-UUID", "encryption": "none"}]
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
          "serverName": "ra.sdupdates.news"
        }
      }
    }
  ],
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        "type": "field",
        "outboundTag": "proxy-vercel",
        "balancerTag": "balancer"
      }
    ],
    "balancers": [
      {
        "tag": "balancer",
        "selector": ["proxy-vercel", "proxy-direct"],
        "strategy": {
          "type": "leastPing"
        }
      }
    ]
  }
}
```

This automatically falls back to direct connection if Vercel fails.

---

## Environment-Specific Notes

### Behind Corporate Firewall

If you're behind a corporate firewall:
- Ensure outbound HTTPS (port 443) is allowed
- Some firewalls do deep packet inspection
- May need to use different transport if xhttp is blocked

### Mobile Networks

- Mobile networks may have NAT/firewall restrictions
- xhttp over TLS should work well
- Consider using HTTP/2 or HTTP/3 for better mobile performance

### China GFW

- Vercel CDN may help with accessibility
- Keep direct connection as fallback
- Monitor for IP blocking
- Consider multiple Vercel deployments in different regions

---

## Security Checklist

- [ ] UUID is kept secret
- [ ] TLS is enabled (`security: "tls"`)
- [ ] `allowInsecure` is set to `false`
- [ ] Using latest V2Ray version
- [ ] Vercel domain uses HTTPS
- [ ] No credentials in Git repository
- [ ] Regular monitoring of connections
- [ ] Fallback connection configured

---

## Performance Tips

1. **Use Latest V2Ray Core:**
   - xhttp improvements in newer versions
   - Better compatibility with Vercel

2. **Optimize Buffer Sizes:**
   ```json
   "xhttpSettings": {
     "path": "/xhttp",
     "host": "your-project.vercel.app",
     "mode": "stream"
   }
   ```

3. **Enable Multiplexing (if needed):**
   ```json
   "mux": {
     "enabled": true,
     "concurrency": 8
   }
   ```

4. **Use Appropriate Routing:**
   - Route local traffic directly
   - Only proxy international traffic
   - Block ads at client level

---

## Quick Command Reference

```bash
# Test SOCKS proxy
curl --proxy socks5://127.0.0.1:1080 https://ifconfig.me

# Test HTTP proxy
curl --proxy http://127.0.0.1:1081 https://ifconfig.me

# Test with custom DNS
curl --proxy socks5h://127.0.0.1:1080 https://ifconfig.me

# Check V2Ray version
v2ray version

# Validate config file
v2ray test -config config.json

# Run V2Ray with custom config
v2ray run -config /path/to/config.json
```

---

## Getting Help

If you encounter issues:

1. **Check Vercel Deployment:**
   - Ensure it's deployed and active
   - Check function logs in Vercel dashboard

2. **Verify Client Config:**
   - Use this guide to double-check all settings
   - Compare with working direct connection

3. **Test Components:**
   - Test Vercel proxy with curl
   - Test direct server connection
   - Isolate the problem

4. **Enable Debug Logging:**
   ```json
   "log": {
     "loglevel": "debug"
   }
   ```

5. **Community Resources:**
   - V2Ray Telegram groups
   - GitHub issues for V2Ray
   - Vercel Discord for deployment issues

---

**Happy tunneling! 🚀**
