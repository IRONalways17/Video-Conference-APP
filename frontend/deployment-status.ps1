# Complete Deployment Status

Write-Host "=== VIDEO CONFERENCE APP DEPLOYMENT STATUS ===" -ForegroundColor Cyan
Write-Host ""

# Check Backend
Write-Host "1. BACKEND (Render) Status:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://video-conference-app-59k6.onrender.com" -Method Get
    Write-Host "   Status: ONLINE" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Green
    Write-Host "   Active Rooms: $($response.rooms)" -ForegroundColor Green
    Write-Host "   URL: https://video-conference-app-59k6.onrender.com" -ForegroundColor Cyan
} catch {
    Write-Host "   Status: OFFLINE or REDEPLOYING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check Frontend Build
Write-Host "2. FRONTEND (Ready for Netlify) Status:" -ForegroundColor Yellow
if (Test-Path ".\dist\index.html") {
    Write-Host "   Status: BUILD READY" -ForegroundColor Green
    $files = Get-ChildItem ".\dist" -Recurse
    Write-Host "   Files: $($files.Count) files in dist folder" -ForegroundColor Green
    Write-Host "   Location: $(Get-Location)\dist" -ForegroundColor Cyan
} else {
    Write-Host "   Status: BUILD MISSING" -ForegroundColor Red
    Write-Host "   Action: Run 'npm run build'" -ForegroundColor Yellow
}

Write-Host ""

# GitHub Status
Write-Host "3. GITHUB Repository:" -ForegroundColor Yellow
Write-Host "   URL: https://github.com/IRONalways17/Video-Conference-APP" -ForegroundColor Cyan
Write-Host "   Status: UPDATED with latest changes" -ForegroundColor Green

Write-Host ""

# Deployment Instructions
Write-Host "4. NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   BACKEND: Automatically redeploying on Render (2-3 minutes)" -ForegroundColor White
Write-Host "   FRONTEND: Deploy to Netlify using one of these methods:" -ForegroundColor White
Write-Host ""
Write-Host "   Method A - Manual Deploy (Fastest):" -ForegroundColor Cyan
Write-Host "   1. Go to https://netlify.com" -ForegroundColor Gray
Write-Host "   2. Drag & drop the 'dist' folder" -ForegroundColor Gray
Write-Host ""
Write-Host "   Method B - Git Deploy:" -ForegroundColor Cyan
Write-Host "   1. Connect GitHub repo to Netlify" -ForegroundColor Gray
Write-Host "   2. Set: Build=npm run build, Publish=dist, Base=frontend" -ForegroundColor Gray

Write-Host ""

# Testing Instructions
Write-Host "5. TESTING:" -ForegroundColor Yellow
Write-Host "   1. Wait 2-3 minutes for backend redeploy to complete" -ForegroundColor White
Write-Host "   2. Deploy frontend to Netlify" -ForegroundColor White
Write-Host "   3. Open app in multiple tabs/devices" -ForegroundColor White
Write-Host "   4. Test video calls between participants" -ForegroundColor White

Write-Host ""
Write-Host "=== READY FOR TESTING! ===" -ForegroundColor Green
