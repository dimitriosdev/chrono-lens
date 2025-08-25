# PowerShell script to validate conventional commit format
# This script prevents commits that don't follow conventional commit standards

param(
    [string]$MessageFile
)

# Read the commit message from the file
$commitMessage = Get-Content $MessageFile -Raw

# Define the regex pattern for conventional commits
$commitRegex = '^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?: .{1,50}'

# Check if commit message matches conventional commit format
if ($commitMessage -match $commitRegex) {
    Write-Host "✓ Commit message follows conventional commit format" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Commit message does not follow conventional commit format" -ForegroundColor Red
    Write-Host ""
    Write-Host "Expected format:" -ForegroundColor Yellow
    Write-Host "  <type>(<scope>): <description>"
    Write-Host ""
    Write-Host "Valid types:" -ForegroundColor Yellow
    Write-Host "  feat:     A new feature"
    Write-Host "  fix:      A bug fix"
    Write-Host "  docs:     Documentation only changes"
    Write-Host "  style:    Changes that do not affect the meaning of the code"
    Write-Host "  refactor: A code change that neither fixes a bug nor adds a feature"
    Write-Host "  perf:     A code change that improves performance"
    Write-Host "  test:     Adding missing tests or correcting existing tests"
    Write-Host "  chore:    Changes to the build process or auxiliary tools"
    Write-Host "  build:    Changes that affect the build system or external dependencies"
    Write-Host "  ci:       Changes to our CI configuration files and scripts"
    Write-Host "  revert:   Reverts a previous commit"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  feat(auth): add user authentication system"
    Write-Host "  fix(ui): resolve button alignment issue"
    Write-Host "  docs: update installation guide"
    Write-Host "  refactor(api): simplify user service logic"
    Write-Host ""
    Write-Host "Your commit message:" -ForegroundColor Yellow
    Write-Host "  $commitMessage"
    Write-Host ""
    Write-Host "Please fix your commit message and try again." -ForegroundColor Red
    exit 1
}
