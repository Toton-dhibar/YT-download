#!/bin/bash

# V2Ray xhttp Vercel Proxy - Deployment Script
# This script helps you deploy your proxy to Vercel

set -e

echo "=================================="
echo "V2Ray xhttp Vercel Proxy Deployer"
echo "=================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    echo "Or visit: https://vercel.com/download"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Check if user wants to update target server
read -p "Do you want to configure the target server? (y/N): " configure_target
if [[ $configure_target =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter your V2Ray server domain (e.g., ra.sdupdates.news): " target_domain
    
    if [ ! -z "$target_domain" ]; then
        echo ""
        echo "Updating api/proxy.js with target: $target_domain"
        
        # Update the TARGET_HOST in proxy.js
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/const TARGET_HOST = '[^']*'/const TARGET_HOST = '$target_domain'/" api/proxy.js
        else
            # Linux
            sed -i "s/const TARGET_HOST = '[^']*'/const TARGET_HOST = '$target_domain'/" api/proxy.js
        fi
        
        echo "✅ Updated target server to: $target_domain"
    fi
fi

echo ""
echo "=================================="
echo "Deployment Options"
echo "=================================="
echo ""
echo "1) Deploy to production (recommended)"
echo "2) Deploy to preview/staging"
echo "3) Test locally with 'vercel dev'"
echo "4) Cancel"
echo ""
read -p "Choose an option (1-4): " deploy_option

case $deploy_option in
    1)
        echo ""
        echo "🚀 Deploying to production..."
        echo ""
        vercel --prod
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "Next steps:"
        echo "1. Note your deployment URL from above"
        echo "2. Configure your V2Ray client (see V2RAY_CONFIG.md)"
        echo "3. Test your connection"
        ;;
    2)
        echo ""
        echo "🚀 Deploying to preview..."
        echo ""
        vercel
        echo ""
        echo "✅ Preview deployment complete!"
        echo ""
        echo "Test this preview URL before deploying to production."
        ;;
    3)
        echo ""
        echo "🧪 Starting local development server..."
        echo ""
        echo "Your proxy will be available at: http://localhost:3000/xhttp/"
        echo "Press Ctrl+C to stop"
        echo ""
        vercel dev
        ;;
    4)
        echo ""
        echo "❌ Deployment cancelled"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "Useful Commands"
echo "=================================="
echo ""
echo "View logs:           vercel logs --follow"
echo "List deployments:    vercel ls"
echo "Remove deployment:   vercel rm [deployment-url]"
echo "View domains:        vercel domains ls"
echo ""
echo "Documentation:"
echo "- Deployment guide:  cat DEPLOYMENT.md"
echo "- Client config:     cat V2RAY_CONFIG.md"
echo ""
