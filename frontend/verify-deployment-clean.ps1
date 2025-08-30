# Deployment Verification Script

Write-Host "Video Conference App Deployment Verification" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Test backend health
Write-Host "1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://video-conference-app-59k6.onrender.com" -Method Get
    Write-Host "Backend Status: $($response.status)" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor Green
    Write-Host "Active Rooms: $($response.rooms)" -ForegroundColor Green
} catch {
    Write-Host "Backend Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check if dist folder exists and has content
Write-Host "2. Checking Frontend Build..." -ForegroundColor Yellow
$distPath = ".\dist"
if (Test-Path $distPath) {
    $files = Get-ChildItem $distPath -Recurse
    Write-Host "Build folder exists with $($files.Count) files" -ForegroundColor Green
    
    # Check main files
    if (Test-Path "$distPath\index.html") {
        Write-Host "index.html found" -ForegroundColor Green
    } else {
        Write-Host "index.html missing" -ForegroundColor Red
    }
    
    if (Test-Path "$distPath\assets") {
        $assets = Get-ChildItem "$distPath\assets"
        Write-Host "Assets folder with $($assets.Count) files" -ForegroundColor Green
    } else {
        Write-Host "Assets folder missing" -ForegroundColor Red
    }
} else {
    Write-Host "Dist folder not found. Run 'npm run build' first." -ForegroundColor Red
}

Write-Host ""

# Deployment instructions
Write-Host "3. Deployment Options:" -ForegroundColor Yellow
Write-Host "Manual Deploy (Easiest):" -ForegroundColor White
Write-Host "   1. Go to https://netlify.com" -ForegroundColor Gray
Write-Host "   2. Drag & drop the 'dist' folder" -ForegroundColor Gray
Write-Host ""
Write-Host "Git Deploy (Best for updates):" -ForegroundColor White
Write-Host "   1. Push to GitHub: git push origin master" -ForegroundColor Gray
Write-Host "   2. Connect GitHub repo to Netlify" -ForegroundColor Gray
Write-Host "   3. Set build: npm run build, publish: dist, base: frontend" -ForegroundColor Gray
Write-Host ""

Write-Host "GitHub Repository: https://github.com/IRONalways17/Video-Conference-APP" -ForegroundColor Cyan
Write-Host ""

# WebSocket connection troubleshooting
Write-Host "4. If 'disconnected from server' error occurs:" -ForegroundColor Yellow
Write-Host "Common causes:" -ForegroundColor White
Write-Host "   - Render free tier goes to sleep (first connection takes 30-60 seconds)" -ForegroundColor Gray
Write-Host "   - Browser blocking WebSocket connections" -ForegroundColor Gray
Write-Host "   - Network firewall issues" -ForegroundColor Gray
Write-Host ""
Write-Host "Solutions:" -ForegroundColor White
Write-Host "   - Wait 1-2 minutes for backend to wake up" -ForegroundColor Gray
Write-Host "   - Try refreshing the page" -ForegroundColor Gray
Write-Host "   - Check browser console for detailed errors" -ForegroundColor Gray
Write-Host "   - Test with the websocket-test.html file" -ForegroundColor Gray

Write-Host ""
Write-Host "Ready for deployment!" -ForegroundColor Green
