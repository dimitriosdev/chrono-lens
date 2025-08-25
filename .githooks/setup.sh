#!/bin/sh
# Setup script to install Git hooks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}Setting up Git hooks for conventional commits...${NC}"

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo "${RED}✗ Not a Git repository${NC}"
    exit 1
fi

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy hooks to .git/hooks directory
if [ -f ".githooks/commit-msg" ]; then
    cp .githooks/commit-msg .git/hooks/commit-msg
    chmod +x .git/hooks/commit-msg
    echo "${GREEN}✓ Installed commit-msg hook${NC}"
else
    echo "${RED}✗ commit-msg hook not found${NC}"
    exit 1
fi

if [ -f ".githooks/pre-commit" ]; then
    cp .githooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "${GREEN}✓ Installed pre-commit hook${NC}"
else
    echo "${RED}✗ pre-commit hook not found${NC}"
    exit 1
fi

echo ""
echo "${GREEN}✓ Git hooks installed successfully!${NC}"
echo ""
echo "${YELLOW}What this does:${NC}"
echo "  • Validates commit messages follow conventional commit format"
echo "  • Runs TypeScript and ESLint checks before commits"
echo "  • Prevents commits that don't meet quality standards"
echo ""
echo "${YELLOW}To test the setup:${NC}"
echo "  git commit -m 'invalid message'  # Should fail"
echo "  git commit -m 'feat: add new feature'  # Should pass"
echo ""
