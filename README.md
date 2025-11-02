# V2Ray xhttp Vercel CDN Reverse Proxy

A Vercel Edge Function that acts as a reverse proxy for V2Ray xhttp traffic, allowing you to hide your real server IP by routing traffic through Vercel's CDN.

## 🎯 Purpose

This project creates a CDN-fronted proxy that:
- Forwards all V2Ray xhttp traffic from `https://yourdomain.vercel.app/xhttp/*` to your real V2Ray server
- Hides your real server IP address from clients
- Leverages Vercel's global CDN infrastructure
- Preserves all headers, methods, and request bodies for proper xhttp protocol operation

## 📁 Project Structure

```
.
├── api/
│   └── proxy.js          # Edge Function that handles the proxying
├── vercel.json           # Vercel deployment configuration
├── package.json          # Project metadata
├── DEPLOYMENT.md         # Detailed deployment guide
├── v2ray-client-config.json  # Example V2Ray client configuration
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- A Vercel account (free tier works)
- Vercel CLI installed: `npm i -g vercel`
- A working V2Ray server with xhttp + TLS enabled

### Deployment Steps

1. **Clone or fork this repository**
   ```bash
   git clone <this-repo>
   cd <repo-directory>
   ```

2. **Install Vercel CLI (if not already installed)**
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Link to your Vercel account
   - Choose project name
   - Accept defaults for other options

4. **Get your Vercel deployment URL**
   - After deployment, you'll get a URL like: `https://your-project.vercel.app`
   - You can also add a custom domain in Vercel dashboard

5. **Update your V2Ray client configuration**
   - Change the server address from `ra.sdupdates.news` to `your-project.vercel.app`
   - Keep the path as `/xhttp`
   - See `v2ray-client-config.json` for a complete example

## 🔧 Configuration

### Changing the Target Server

If you need to proxy to a different V2Ray server, edit `api/proxy.js`:

```javascript
// Change this line:
const targetUrl = `https://ra.sdupdates.news${path}`;

// To your server:
const targetUrl = `https://your-server.example.com${path}`;

// And update the host header:
headers.set('host', 'your-server.example.com');
```

Then redeploy:
```bash
vercel --prod
```

### Custom Domain

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Update DNS records as instructed by Vercel
6. Use the custom domain in your V2Ray client config

## ⚠️ Important Limitations

### Vercel Edge Function Limitations

1. **Execution Timeout**: 
   - Free tier: 10 seconds per request
   - Pro tier: 30 seconds per request
   - Hobby/Pro tier: Can be extended to 60 seconds
   - This might affect long-lived xhttp connections

2. **Response Size**:
   - Maximum response body size: 4.5 MB
   - Streaming is supported, which helps with xhttp

3. **Request Body Size**:
   - Maximum request body: 4.5 MB
   - Should be sufficient for most V2Ray traffic

4. **Cold Starts**:
   - Edge Functions may experience cold starts
   - Usually sub-100ms, but can add latency

5. **No Persistent Connections**:
   - Each request creates a new connection to your backend
   - xhttp over HTTP/2 or HTTP/3 will handle this reasonably

### Recommendations

- **Use for moderate traffic**: Best for personal use or small teams
- **Monitor timeouts**: If connections frequently timeout, consider alternatives
- **Test thoroughly**: Verify your specific V2Ray configuration works
- **Fallback plan**: Keep direct server access as backup

## 🔐 Security Considerations

1. **HTTPS Only**: Both Vercel endpoint and target server use HTTPS
2. **No Credentials in Code**: Never commit server credentials
3. **Access Control**: Consider adding authentication to the proxy if needed
4. **Rate Limiting**: Vercel provides automatic rate limiting
5. **IP Hiding**: This setup effectively hides your real server IP from clients

## 📊 How It Works

```
[V2Ray Client] 
    ↓ 
    ↓ (connects to Vercel domain)
    ↓
[Vercel CDN Edge Function]
    ↓
    ↓ (proxies to real server)
    ↓
[Your V2Ray Server at ra.sdupdates.news]
```

The Edge Function:
1. Receives the client request at `/xhttp/*`
2. Forwards it to `https://ra.sdupdates.news/xhttp/*`
3. Preserves all headers, method, and body
4. Streams the response back to the client
5. Handles errors gracefully

## 🧪 Testing

### Test the Proxy Endpoint

```bash
# Basic connectivity test
curl -v https://your-project.vercel.app/xhttp/

# With headers
curl -v -H "Content-Type: application/octet-stream" \
  https://your-project.vercel.app/xhttp/
```

### Test with V2Ray Client

1. Update your V2Ray client configuration (see `v2ray-client-config.json`)
2. Connect and monitor logs
3. Test browsing or connectivity
4. Check Vercel function logs in dashboard for any errors

## 📖 Additional Resources

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed step-by-step deployment guide
- [v2ray-client-config.json](./v2ray-client-config.json) - Example client configuration
- [Vercel Edge Functions Documentation](https://vercel.com/docs/functions/edge-functions)
- [V2Ray Documentation](https://www.v2ray.com/)

## 🐛 Troubleshooting

### Connection Timeouts
- Check if your V2Ray server is responding
- Verify firewall rules allow Vercel IPs
- Consider upgrading Vercel plan for longer timeouts

### 502 Bad Gateway
- Verify target server URL in `api/proxy.js`
- Check if target server has valid SSL certificate
- Review Vercel function logs

### Client Connection Fails
- Verify Vercel deployment URL is correct
- Check V2Ray client configuration syntax
- Ensure `/xhttp` path is correctly specified

### Slow Performance
- Vercel CDN should be fast, but check:
  - Geographic distance to nearest edge node
  - Your real server's response time
  - Cold start issues (test with multiple requests)

## 📝 License

This project is provided as-is for educational and personal use.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test your changes
4. Submit a pull request

## ⚡ Support

For issues:
1. Check the Troubleshooting section
2. Review Vercel function logs
3. Open an issue in this repository
