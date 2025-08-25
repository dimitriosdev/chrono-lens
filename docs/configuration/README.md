# ⚙️ Configuration Documentation

This directory contains all configuration-related documentation for Chrono Lens.

## 📋 Configuration Guides

### Environment Setup

- **ENVIRONMENT_VARIABLES.md** - Complete environment variables reference
- **FIREBASE.md** - Firebase project configuration
- **DEVELOPMENT_SETUP.md** - Local development environment

### Service Configuration

- **CORS.md** - Cross-origin resource sharing configuration
- **SECURITY.md** - Security settings and best practices
- **PERFORMANCE.md** - Performance optimization settings

### Build Configuration

- **NEXT_CONFIG.md** - Next.js configuration options
- **TYPESCRIPT.md** - TypeScript configuration
- **ESLINT.md** - ESLint and code quality settings

## 🔧 Configuration Files Overview

| File              | Purpose                          | Environment |
| ----------------- | -------------------------------- | ----------- |
| `.env.local`      | Local development variables      | Development |
| `.env.production` | Production environment variables | Production  |
| `next.config.ts`  | Next.js framework configuration  | All         |
| `firebase.json`   | Firebase project settings        | All         |
| `cors.json`       | CORS policy configuration        | Production  |

## 🛠️ Quick Setup Guide

### 1. Environment Variables

```bash
# Copy example files
cp .env.example .env.local
cp .env.production.example .env.production

# Edit with your values
```

### 2. Firebase Configuration

1. Create Firebase project
2. Enable Authentication
3. Set up Firestore
4. Configure hosting
5. Update environment variables

### 3. Development Tools

1. Install dependencies: `npm install`
2. Configure IDE settings
3. Set up Git hooks
4. Verify build: `npm run build`

## 🔒 Security Considerations

- Never commit sensitive keys to version control
- Use environment variables for all secrets
- Regularly rotate API keys
- Follow principle of least privilege
- Enable security monitoring

## 📝 Configuration Best Practices

- Document all configuration changes
- Use consistent naming conventions
- Validate configurations in CI/CD
- Keep staging and production configs in sync
- Regular security audits

---

**Maintained by**: DevOps & Development Teams
**Last Updated**: August 26, 2025
