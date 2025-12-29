# 🔒 Git Hooks & Commit Validation Setup

This document explains the conventional commit enforcement system implemented in Chrono Lens.

## 🎯 Purpose

- **Enforce Conventional Commits** - All commits must follow the conventional commit format
- **Quality Gates** - Prevent commits that fail TypeScript or ESLint checks
- **Consistency** - Maintain consistent commit history across the team
- **Automated Release** - Enable semantic versioning and automated changelogs

## ✨ Cross-Platform Compatibility

The Git hooks are designed to work seamlessly across all environments:

- ✅ **Windows** (Git Bash, PowerShell, WSL)
- ✅ **macOS** (Bash, Zsh)
- ✅ **Linux** (Bash, Sh)

The hooks automatically detect the platform and adjust behavior accordingly (e.g., disabling ANSI colors on terminals that don't support them).

## ⚙️ Setup Instructions

### Automatic Setup (Recommended)

The hooks are automatically installed when you run `npm install`:

```bash
npm install  # Automatically sets up Git hooks
```

The setup script will:

- Detect your operating system
- Use the appropriate installation method (PowerShell on Windows, Bash on Unix-like systems)
- Handle environments without Git gracefully (useful for CI/CD)

### Manual Setup

If you need to set up hooks manually:

```bash
# For PowerShell/Windows
npm run hooks:setup

# Or directly on Windows
powershell -ExecutionPolicy Bypass -File .githooks/setup.ps1

# For Git Bash on Windows
bash .githooks/setup.sh

# For Linux/Mac
chmod +x .githooks/setup.sh
./.githooks/setup.sh
```

### Troubleshooting

**Windows PowerShell execution policy errors:**

```powershell
# Run this in an admin PowerShell window
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Git Bash not executing hooks:**

```bash
# Ensure hooks have execute permissions
chmod +x .git/hooks/*
```

**Hooks not running at all:**

```bash
# Verify hooks are installed
ls -la .git/hooks/
# Should see: commit-msg, pre-commit
```

## 📋 Conventional Commit Format

### Required Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Description                           | Example                                   |
| ---------- | ------------------------------------- | ----------------------------------------- |
| `feat`     | New feature                           | `feat(auth): add user authentication`     |
| `fix`      | Bug fix                               | `fix(ui): resolve button alignment issue` |
| `docs`     | Documentation changes                 | `docs: update API documentation`          |
| `style`    | Code style changes (formatting, etc.) | `style: fix indentation in components`    |
| `refactor` | Code refactoring                      | `refactor(api): simplify user service`    |
| `perf`     | Performance improvements              | `perf: optimize image loading`            |
| `test`     | Adding or fixing tests                | `test: add unit tests for auth service`   |
| `chore`    | Maintenance tasks                     | `chore: update dependencies`              |
| `build`    | Build system changes                  | `build: update webpack configuration`     |
| `ci`       | CI/CD changes                         | `ci: add GitHub Actions workflow`         |
| `revert`   | Revert previous commit                | `revert: revert feat(auth) commit`        |

### Scope Guidelines

Scopes should represent the area of the codebase affected:

- `auth` - Authentication system
- `ui` - User interface components
- `api` - API endpoints and services
- `db` - Database related changes
- `config` - Configuration files
- `docs` - Documentation
- `test` - Test files
- `build` - Build configuration
- `deploy` - Deployment scripts

## 🛡️ Validation Rules

### Commit Message Hook (`commit-msg`)

- ✅ **Format Validation** - Ensures conventional commit format
- ✅ **Length Check** - Description must be 1-50 characters
- ✅ **Type Validation** - Only allows valid commit types
- ❌ **Blocks Invalid Commits** - Prevents commits with wrong format

### Pre-Commit Hook (`pre-commit`)

- ✅ **TypeScript Check** - Runs `npm run type-check`
- ✅ **ESLint Check** - Runs `npm run lint`
- ✅ **Code Quality** - Ensures code meets standards
- ❌ **Blocks Failing Commits** - Prevents commits with errors

## 📝 Valid Commit Examples

```bash
# Feature commits
git commit -m "feat(auth): add Google OAuth integration"
git commit -m "feat(ui): implement dark mode toggle"

# Bug fixes
git commit -m "fix(api): handle null user response"
git commit -m "fix(ui): resolve mobile menu overflow"

# Documentation
git commit -m "docs: add installation guide"
git commit -m "docs(api): update endpoint documentation"

# Refactoring
git commit -m "refactor(hooks): simplify useAuth hook"
git commit -m "refactor: extract common utilities"

# Chores
git commit -m "chore: update dependencies"
git commit -m "chore(config): add ESLint rules"
```

## ❌ Invalid Commit Examples

```bash
# Wrong format
git commit -m "Add new feature"           # ❌ No type
git commit -m "added user auth"           # ❌ Past tense
git commit -m "feat add auth"             # ❌ Missing colon
git commit -m "feature: add auth"         # ❌ Wrong type

# Too long description
git commit -m "feat: add a very long description that exceeds the fifty character limit"  # ❌ Too long

# Invalid type
git commit -m "feature: add new auth"     # ❌ Invalid type
git commit -m "bugfix: resolve issue"     # ❌ Invalid type
```

## 🚫 Bypass (Emergency Use Only)

In rare emergency situations, you can bypass hooks:

```bash
# Skip commit-msg hook
git commit -m "emergency fix" --no-verify

# Skip all hooks
git commit -m "emergency fix" --no-verify
```

**⚠️ Warning**: Only use `--no-verify` in true emergencies. All bypassed commits should be fixed in follow-up commits.

## 🔧 Troubleshooting

### Hook Not Running

```bash
# Check if hooks are installed
ls -la .git/hooks/

# Reinstall hooks
npm run hooks:setup

# Check hook permissions (Unix/Mac)
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/pre-commit
```

### TypeScript/ESLint Errors

```bash
# Fix TypeScript errors
npm run type-check

# Fix ESLint errors
npm run lint

# Or fix automatically where possible
npm run lint -- --fix
```

### PowerShell Execution Policy (Windows)

```powershell
# If PowerShell script blocked
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass
powershell -ExecutionPolicy Bypass -File .githooks/setup.ps1
```

## 📊 Benefits

### For Development

- **Consistent History** - Clean, readable commit history
- **Quality Assurance** - Automatic code quality checks
- **Documentation** - Self-documenting commit messages
- **Team Standards** - Enforced coding standards

### For DevOps

- **Automated Releases** - Semantic versioning based on commit types
- **Change Tracking** - Easy to identify types of changes
- **Rollback Safety** - Clear understanding of each commit
- **CI/CD Integration** - Automated deployments based on commit types

### For Project Management

- **Feature Tracking** - Easy identification of new features
- **Bug Tracking** - Clear distinction between fixes and features
- **Release Notes** - Automated changelog generation
- **Progress Monitoring** - Visual commit history

## 🔄 Integration with Semantic Release

The conventional commits enable automated semantic versioning:

- `feat:` → Minor version bump (1.1.0 → 1.2.0)
- `fix:` → Patch version bump (1.1.0 → 1.1.1)
- `BREAKING CHANGE:` → Major version bump (1.1.0 → 2.0.0)

## 📚 Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Commitizen CLI](https://github.com/commitizen/cz-cli) - Interactive commit helper

---

**Setup Date**: August 26, 2025  
**Version**: 1.6.0  
**Status**: ✅ Active and Enforced
