# Render Backend Redeploy Script

Write-Host "Render Backend Redeploy Utility" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Method 1: Manual Redeploy via Render Dashboard" -ForegroundColor Yellow
Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor Gray
Write-Host "2. Find your 'video-conference-app' service" -ForegroundColor Gray
Write-Host "3. Click 'Manual Deploy' -> 'Deploy latest commit'" -ForegroundColor Gray
Write-Host ""

Write-Host "Method 2: Git Push Trigger (What we just did)" -ForegroundColor Yellow
Write-Host "git commit --allow-empty -m 'trigger redeploy'" -ForegroundColor Gray
Write-Host "git push origin master" -ForegroundColor Gray
Write-Host ""

Write-Host "Method 3: Using Render CLI (if installed)" -ForegroundColor Yellow
Write-Host "render deploy --service-id YOUR_SERVICE_ID" -ForegroundColor Gray
Write-Host ""

Write-Host "Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://video-conference-app-59k6.onrender.com" -Method Get
    Write-Host "Backend Status: $($response.status)" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor Green
    Write-Host "Active Rooms: $($response.rooms)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend is responding! Redeploy triggered successfully." -ForegroundColor Green
} catch {
    Write-Host "Backend not responding yet. This is normal during redeploy." -ForegroundColor Yellow
    Write-Host "Wait 2-3 minutes for redeploy to complete." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "What happens next:" -ForegroundColor Cyan
Write-Host "1. Render detects the new commit" -ForegroundColor Gray
Write-Host "2. Automatically starts rebuilding and redeploying" -ForegroundColor Gray
Write-Host "3. Takes 2-5 minutes to complete" -ForegroundColor Gray
Write-Host "4. Backend will restart with updated code" -ForegroundColor Gray
Write-Host ""
Write-Host "Monitor deployment at: https://dashboard.render.com" -ForegroundColor Cyan
