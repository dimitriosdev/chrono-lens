# PowerShell script to setup Git hooks for conventional commits

Write-Host "Setting up Git hooks for conventional commits..." -ForegroundColor Yellow

# Check if we're in a Git repository
if (-not (Test-Path ".git")) {
    Write-Host "✗ Not a Git repository" -ForegroundColor Red
    exit 1
}

# Create .git/hooks directory if it doesn't exist
$hooksDir = ".git/hooks"
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

# Copy commit-msg hook
if (Test-Path ".githooks/commit-msg") {
    Copy-Item ".githooks/commit-msg" "$hooksDir/commit-msg" -Force
    Write-Host "✓ Installed commit-msg hook (bash)" -ForegroundColor Green
} else {
    Write-Host "✗ commit-msg hook not found" -ForegroundColor Red
    exit 1
}

# Copy pre-commit hook
if (Test-Path ".githooks/pre-commit") {
    Copy-Item ".githooks/pre-commit" "$hooksDir/pre-commit" -Force
    Write-Host "✓ Installed pre-commit hook" -ForegroundColor Green
} else {
    Write-Host "✗ pre-commit hook not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Git hooks installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "What this does:" -ForegroundColor Yellow
Write-Host "  * Validates commit messages follow conventional commit format"
Write-Host "  * Runs TypeScript and ESLint checks before commits"
Write-Host "  * Prevents commits that do not meet quality standards"
Write-Host ""
Write-Host "To test the setup:" -ForegroundColor Yellow
Write-Host "  git commit -m `"invalid message`"  # Should fail"
Write-Host "  git commit -m `"feat: add new feature`"  # Should pass"
Write-Host ""
