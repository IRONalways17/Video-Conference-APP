#!/bin/bash
# Netlify Deployment Script

echo "🚀 Deploying Video Conference App to Netlify"
echo "============================================"

cd "/mnt/d/Internet/see me/video-conference-app/frontend"

echo "📦 Building the application..."
npm run build

echo "🌐 Deploying to Netlify..."
echo ""
echo "Option A: Manual Deployment (Easiest)"
echo "1. Go to https://netlify.com"
echo "2. Sign in/Create account"
echo "3. Click 'Add new site' → 'Deploy manually'"
echo "4. Drag and drop the 'dist' folder"
echo ""
echo "Option B: Netlify CLI"
echo "Run: npx netlify-cli login"
echo "Then: npx netlify-cli deploy --prod --dir=dist"
echo ""
echo "Option C: Git-based Deployment"
echo "1. Push to GitHub first"
echo "2. Connect GitHub repo to Netlify"
echo "3. Set build settings:"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo "   - Base directory: frontend"
echo ""

echo "✅ Build completed! Check the 'dist' folder for deployment files."
echo "📁 Location: $(pwd)/dist"
echo ""
echo "🎉 Your app will be available at: https://your-app-name.netlify.app"
