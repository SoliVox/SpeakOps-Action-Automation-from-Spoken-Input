# Git Commit & Push Script

Write-Host "`n=== SpeakOps - Preparing for Deployment ===" -ForegroundColor Cyan

# Check git status
Write-Host "`nChecking git status..." -ForegroundColor Yellow
git status

Write-Host "`n=== Files to commit ===" -ForegroundColor Yellow
git status --short

# Confirm
$confirm = Read-Host "`nCommit and push all changes? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Aborted." -ForegroundColor Red
    exit
}

# Add all files
Write-Host "`nAdding files..." -ForegroundColor Yellow
git add .

# Commit
$message = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "Complete SpeakOps implementation with LLM integration"
}

Write-Host "`nCommitting..." -ForegroundColor Yellow
git commit -m $message

# Push
Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "`n=== Success! ===" -ForegroundColor Green
Write-Host "Code pushed to: https://github.com/SoliVox/SpeakOps-Action-Automation-from-Spoken-Input" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Create new Web Service" -ForegroundColor White
Write-Host "3. Connect your GitHub repo" -ForegroundColor White
Write-Host "4. Follow instructions in DEPLOY_NOW.md" -ForegroundColor White
Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
