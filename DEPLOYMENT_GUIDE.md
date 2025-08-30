#!/bin/bash

# Development deployment guide for video conference app

echo "🚀 Video Conference App Deployment Guide"
echo "========================================"
echo ""

echo "1. Frontend (Netlify) Setup:"
echo "   - Build completed ✅"
echo "   - WebSocket URL configured for Render backend ✅"
echo "   - Updated participant tracking ✅"
echo "   - Enhanced WebRTC connections ✅"
echo ""

echo "2. Backend (Render) Info:"
echo "   - URL: https://video-conference-app-59k6.onrender.com"
echo "   - WebSocket: wss://video-conference-app-59k6.onrender.com"
echo "   - Health check: https://video-conference-app-59k6.onrender.com/"
echo ""

echo "3. Deploy Frontend to Netlify:"
echo "   Option A - Manual Deploy:"
echo "   1. Go to https://netlify.com"
echo "   2. Click 'Add new site' → 'Deploy manually'"
echo "   3. Drag & drop the 'dist' folder"
echo ""
echo "   Option B - Git Deploy (Recommended):"
echo "   1. Connect GitHub repo to Netlify"
echo "   2. Set build command: npm run build"
echo "   3. Set publish directory: dist"
echo "   4. Set base directory: frontend"
echo ""

echo "4. Environment Variables (Optional):"
echo "   VITE_WS_URL=wss://video-conference-app-59k6.onrender.com"
echo ""

echo "5. Features Implemented:"
echo "   ✅ Real-time video & audio"
echo "   ✅ Participant count tracking"
echo "   ✅ Join/leave notifications"
echo "   ✅ Mute/unmute controls"
echo "   ✅ Camera on/off controls"
echo "   ✅ Room link sharing"
echo "   ✅ Automatic reconnection"
echo "   ✅ Google Meet-like interface"
echo ""

echo "6. Testing:"
echo "   - Open multiple browser tabs/windows"
echo "   - Use different devices"
echo "   - Test audio/video controls"
echo "   - Verify participant counting"
echo ""

echo "Ready for deployment! 🎉"
