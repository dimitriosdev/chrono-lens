# 📋 Commit Convention & Semantic Versioning

This project uses [Conventional Commits](https://www.conventionalcommits.org/) and [Semantic Release](https://semantic-release.gitbook.io/) for automated versioning.

## 🏷️ Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## 📦 Version Bumping

| Commit Type        | Version Bump              | Example          |
| ------------------ | ------------------------- | ---------------- |
| `fix:`             | **PATCH** (0.1.0 → 0.1.1) | Bug fixes        |
| `feat:`            | **MINOR** (0.1.0 → 0.2.0) | New features     |
| `BREAKING CHANGE:` | **MAJOR** (0.1.0 → 1.0.0) | Breaking changes |

## 🔧 Commit Types

### Production Releases

- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `perf:` - Performance improvement (patch version bump)

### No Version Bump

- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring without feature/fix
- `test:` - Adding or updating tests
- `chore:` - Build process, dependency updates
- `ci:` - CI/CD configuration changes

## 📝 Examples

### Patch Release (0.1.0 → 0.1.1)

```bash
git commit -m "fix: resolve Firebase Storage image loading issue"
git commit -m "fix(auth): handle expired tokens correctly"
git commit -m "perf: optimize image compression algorithm"
```

### Minor Release (0.1.0 → 0.2.0)

```bash
git commit -m "feat: add dark mode toggle"
git commit -m "feat(albums): implement drag and drop sorting"
git commit -m "feat: add user profile management"
```

### Major Release (0.1.0 → 1.0.0)

```bash
git commit -m "feat!: redesign authentication system

BREAKING CHANGE: The authentication API has been completely rewritten.
Users will need to re-authenticate and existing tokens are no longer valid."
```

### No Release

```bash
git commit -m "docs: update README with installation instructions"
git commit -m "chore: update dependencies to latest versions"
git commit -m "test: add unit tests for album component"
git commit -m "style: fix linting errors and format code"
```

## 🚀 How It Works

1. **Push to main** → Semantic Release analyzes commits
2. **Determines version bump** based on commit types
3. **Updates package.json** with new version
4. **Creates GitHub release** with changelog
5. **Deploys to production** with new version

## 📋 Best Practices

### ✅ Good Commits

- `feat: add user avatar upload functionality`
- `fix: resolve memory leak in image processing`
- `docs: add API documentation for album endpoints`
- `chore: bump Next.js to version 15.4.6`

### ❌ Avoid These

- `update stuff` (not descriptive)
- `fix bug` (which bug?)
- `WIP` (don't commit work in progress)
- `asdf` (meaningless)

## 🔍 Scopes (Optional)

Add scope to organize commits by area:

- `feat(auth): add Google OAuth integration`
- `fix(storage): handle upload timeout errors`
- `docs(api): update endpoint documentation`
- `chore(deps): update Firebase SDK`

## 🎯 Quick Reference

| Want to...          | Use                                           |
| ------------------- | --------------------------------------------- |
| Fix a bug           | `fix: description`                            |
| Add feature         | `feat: description`                           |
| Breaking change     | `feat!: description` + BREAKING CHANGE footer |
| Update docs         | `docs: description`                           |
| Update deps         | `chore: description`                          |
| Improve performance | `perf: description`                           |
| Refactor code       | `refactor: description`                       |

## 📊 Automation

- **Automatic versioning** based on commits
- **Changelog generation** from commit messages
- **GitHub releases** with release notes
- **Version display** in app shows current version

Start using these conventions now, and your versions will be managed automatically! 🎉
