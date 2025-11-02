# V2Ray Client Configuration Guide

This guide shows how to configure your V2Ray client to use the Vercel CDN proxy instead of connecting directly to your V2Ray server.

## Overview

**Before (Direct Connection)**:
```
V2Ray Client → ra.sdupdates.news:443/xhttp → V2Ray Server
```

**After (Via Vercel CDN)**:
```
V2Ray Client → your-project.vercel.app:443/xhttp → Vercel Edge → ra.sdupdates.news:443/xhttp → V2Ray Server
```

## Benefits

1. **IP Masking**: Your real server IP (`ra.sdupdates.news`) is hidden
2. **CDN Performance**: Vercel's global edge network can improve latency
3. **DDoS Protection**: Vercel provides built-in DDoS protection
4. **Flexibility**: Easy to switch servers without client config changes

## Configuration Examples

### 1. V2RayN (Windows)

**JSON Configuration**:
```json
{
  "outbounds": [
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
                "encryption": "none",
                "flow": ""
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "tls",
        "tlsSettings": {
          "serverName": "your-project.vercel.app",
          "allowInsecure": false,
          "fingerprint": "chrome"
        },
        "xhttpSettings": {
          "path": "/xhttp",
          "host": "your-project.vercel.app"
        }
      },
      "tag": "proxy"
    }
  ]
}
```

**GUI Configuration**:
1. Open V2RayN
2. Add Server → Manual Configuration
3. Fill in:
   - **Address**: `your-project.vercel.app`
   - **Port**: `443`
   - **User ID**: Your UUID
   - **Protocol**: `VLESS`
   - **Transport**: `xhttp`
   - **Path**: `/xhttp`
   - **TLS**: `Enabled`
   - **SNI**: `your-project.vercel.app`

### 2. V2RayNG (Android)

**Manual Configuration**:
1. Open V2RayNG
2. Tap "+" → "Manual Input [VLESS]"
3. Fill in:
   - **Alias**: `Vercel Proxy`
   - **Address**: `your-project.vercel.app`
   - **Port**: `443`
   - **ID**: Your UUID
   - **Encryption**: `none`
   - **Flow**: Leave empty
   - **Network**: `xhttp`
   - **Path**: `/xhttp`
   - **Host**: `your-project.vercel.app`
   - **TLS**: `tls`
   - **SNI**: `your-project.vercel.app`
   - **Fingerprint**: `chrome`

**Import via VMess/VLESS Link**:
```
vless://YOUR-UUID@your-project.vercel.app:443?encryption=none&security=tls&sni=your-project.vercel.app&fp=chrome&type=xhttp&path=%2Fxhttp&host=your-project.vercel.app#Vercel-Proxy
```

### 3. Shadowrocket (iOS)

1. Tap "+" to add server
2. Select "VLESS"
3. Fill in:
   - **Address**: `your-project.vercel.app`
   - **Port**: `443`
   - **UUID**: Your UUID
   - **Transport**: `xhttp`
   - **Path**: `/xhttp`
   - **Host**: `your-project.vercel.app`
   - **TLS**: `Yes`
   - **Server Name**: `your-project.vercel.app`

### 4. Qv2ray (Linux/Windows/macOS)

**JSON Configuration**:
```json
{
  "outbounds": [
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
        "tlsSettings": {
          "serverName": "your-project.vercel.app"
        },
        "xhttpSettings": {
          "path": "/xhttp",
          "host": "your-project.vercel.app"
        }
      }
    }
  ]
}
```

### 5. v2ray-core (Command Line)

Create a file `config.json`:
```json
{
  "log": {
    "loglevel": "info"
  },
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": true
      }
    },
    {
      "port": 1081,
      "protocol": "http"
    }
  ],
  "outbounds": [
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
                "encryption": "none",
                "flow": ""
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "tls",
        "tlsSettings": {
          "serverName": "your-project.vercel.app",
          "allowInsecure": false,
          "fingerprint": "chrome"
        },
        "xhttpSettings": {
          "path": "/xhttp",
          "host": "your-project.vercel.app",
          "mode": "auto",
          "extra": {}
        }
      },
      "tag": "proxy"
    },
    {
      "protocol": "freedom",
      "tag": "direct"
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": ["geosite:cn"]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": ["geoip:cn", "geoip:private"]
      }
    ]
  }
}
```

Run with:
```bash
v2ray run -config config.json
```

## Configuration Parameters Explained

### Key Changes from Direct Connection

| Parameter | Old Value (Direct) | New Value (Via Vercel) | Notes |
|-----------|-------------------|------------------------|-------|
| **address** | `ra.sdupdates.news` | `your-project.vercel.app` | Use your Vercel domain |
| **port** | `443` | `443` | Same |
| **path** | `/xhttp` | `/xhttp` | Same path, proxied through Vercel |
| **host** | `ra.sdupdates.news` | `your-project.vercel.app` | Must match Vercel domain |
| **serverName (SNI)** | `ra.sdupdates.news` | `your-project.vercel.app` | TLS handshake with Vercel |
| **UUID** | `your-uuid` | `your-uuid` | Same UUID as server |

### Important Notes

1. **serverName/SNI**: Must be set to your Vercel domain (`your-project.vercel.app`), not your real server domain
2. **Host Header**: Set to Vercel domain
3. **Path**: Keep as `/xhttp` (must match your server configuration)
4. **Port**: Always `443` (HTTPS)
5. **TLS**: Must be enabled
6. **UUID**: Use the same UUID configured on your V2Ray server

## Testing Your Configuration

### 1. Test Connectivity

```bash
# Test if Vercel endpoint is reachable
curl -v https://your-project.vercel.app/xhttp/

# Should return a response from your V2Ray server
```

### 2. Test with V2Ray Client

1. Configure your V2Ray client as shown above
2. Enable the connection
3. Test with:
   ```bash
   # Check your IP (should show Vercel edge IP, not your real server)
   curl -x socks5://127.0.0.1:1080 https://ifconfig.me
   
   # Or visit in browser
   https://ifconfig.me
   ```

### 3. Verify Traffic Routing

Check your V2Ray server logs to see incoming connections from Vercel IPs instead of direct client IPs.

## Troubleshooting

### Connection Failed

**Check 1**: Verify Vercel deployment is working
```bash
curl -I https://your-project.vercel.app/xhttp/
```

**Check 2**: Verify TLS settings
- Ensure SNI matches Vercel domain
- Check certificate is valid

**Check 3**: Verify path is correct
- Must be `/xhttp` (case-sensitive)
- Include leading slash

### Connection Slow

**Possible causes**:
1. **Vercel Edge Location**: First connection may have cold start
2. **Double Encryption**: TLS to Vercel + TLS to real server
3. **Geographic Distance**: Vercel edge → your server path

**Solutions**:
- Wait 30-60 seconds after first connection
- Use Vercel regions close to your server
- Pro plan reduces cold starts

### Frequent Disconnections

**Possible causes**:
1. **Vercel Timeout**: 10s on Hobby plan
2. **Idle Connections**: Closed by Vercel
3. **Request Size**: Exceeds 4.5 MB limit

**Solutions**:
- Keep connections active with periodic traffic
- Upgrade to Pro plan (60s+ timeout)
- Use for control traffic, not bulk data transfer

### Authentication Failed

**Check**:
1. UUID matches server configuration exactly
2. Encryption set to `none` for VLESS
3. Flow parameter is empty (or omit it)

## Advanced: Multiple Servers via Vercel

You can proxy multiple V2Ray servers through one Vercel deployment:

**Update api/proxy.js**:
```javascript
const TARGET_MAP = {
  '/xhttp1': 'server1.example.com',
  '/xhttp2': 'server2.example.com',
};

// Determine target based on path
const pathPrefix = url.pathname.split('/')[1];
const TARGET_HOST = TARGET_MAP[`/${pathPrefix}`] || 'ra.sdupdates.news';
```

**Update vercel.json**:
```json
{
  "rewrites": [
    { "source": "/xhttp1/:path*", "destination": "/api/proxy" },
    { "source": "/xhttp2/:path*", "destination": "/api/proxy" }
  ]
}
```

**Client configuration**:
- Server 1: Use path `/xhttp1`
- Server 2: Use path `/xhttp2`

## Security Best Practices

1. **Don't Share Your Config**: Contains your UUID (like a password)
2. **Use Strong UUIDs**: Generated with proper UUID tools
3. **Enable TLS Fingerprinting**: Set `fingerprint: "chrome"` for better stealth
4. **Monitor Usage**: Check Vercel analytics for unusual patterns
5. **Rotate UUIDs**: Change periodically for better security
6. **Use Allowlisting**: Configure V2Ray server to only accept Vercel IPs (optional)

## Performance Optimization

1. **Choose Nearest Vercel Region**: Custom domain routing
2. **Enable HTTP/2**: Automatic with TLS
3. **Use xhttp Mode**: Optimized for HTTP transport
4. **Minimize Latency**: Choose V2Ray server close to Vercel edge
5. **Pro Plan**: Reduces cold starts and increases timeouts

## Comparison: Direct vs Vercel Proxy

| Aspect | Direct Connection | Via Vercel Proxy |
|--------|------------------|------------------|
| **Latency** | Lower | Slightly higher (+50-200ms) |
| **Anonymity** | Exposes server IP | Hides server IP |
| **Reliability** | Direct | Extra hop (Vercel) |
| **DDoS Protection** | Your server only | Vercel + Your server |
| **Setup Complexity** | Simple | Moderate |
| **Cost** | Free | Free (Hobby) / $20/mo (Pro) |
| **Bandwidth** | Unlimited* | 100GB (Hobby) / 1TB (Pro) |

*Subject to your server's limits

## Next Steps

1. ✅ Deploy your Vercel proxy (see DEPLOYMENT.md)
2. ✅ Update your V2Ray client configuration using examples above
3. ✅ Test connectivity
4. ✅ Monitor performance and usage
5. ✅ Optimize as needed

## Support Resources

- **V2Ray Documentation**: https://www.v2ray.com/
- **V2Fly**: https://www.v2fly.org/
- **Vercel Support**: https://vercel.com/support
- **V2RayN Releases**: https://github.com/2dust/v2rayN/releases
