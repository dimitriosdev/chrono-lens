# ⚙️ Environment Variables Reference

This document provides a complete reference for all environment variables used in Chrono Lens.

## 🔧 Development Environment (.env.local)

### Firebase Configuration

```bash
# Firebase Project Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456789

# Firebase Admin SDK (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xyz@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_CLIENT_ID=123456789012345678901
```

### Application Configuration

```bash
# Application Settings
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_VERSION=1.6.0
NEXT_PUBLIC_APP_NAME="Chrono Lens"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
```

### Development Tools

```bash
# Development Configuration
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_SHOW_VERSION_INFO=true
NEXT_PUBLIC_ENABLE_HOT_RELOAD=true
```

## 🚀 Production Environment (.env.production)

### Firebase Configuration

```bash
# Production Firebase Project
NEXT_PUBLIC_FIREBASE_API_KEY=production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chrono-lens-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chrono-lens-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chrono-lens-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321:web:fedcba987654321

# Production Admin SDK
FIREBASE_ADMIN_PROJECT_ID=chrono-lens-prod
FIREBASE_ADMIN_PRIVATE_KEY_ID=prod_private_key_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc@chrono-lens-prod.iam.gserviceaccount.com
FIREBASE_ADMIN_CLIENT_ID=987654321098765432109
```

### Production Settings

```bash
# Production Application Settings
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.6.0
NEXT_PUBLIC_APP_NAME="Chrono Lens"
NEXT_PUBLIC_APP_URL=https://chrono-lens.com

# Production Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_SHOW_VERSION_INFO=false
```

### Security & Performance

```bash
# Security Settings
NEXT_PUBLIC_ENABLE_SECURITY_HEADERS=true
NEXT_PUBLIC_ENABLE_CSP=true
NEXT_PUBLIC_ENABLE_RATE_LIMITING=true

# Performance Settings
NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION=true
NEXT_PUBLIC_ENABLE_COMPRESSION=true
NEXT_PUBLIC_CACHE_DURATION=3600
```

## 🧪 Testing Environment (.env.test)

### Test Configuration

```bash
# Test Firebase Project
NEXT_PUBLIC_FIREBASE_API_KEY=test_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chrono-lens-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chrono-lens-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chrono-lens-test.appspot.com

# Test Settings
NEXT_PUBLIC_APP_ENV=test
NEXT_PUBLIC_ENABLE_TEST_DATA=true
NEXT_PUBLIC_SKIP_AUTH=true
NODE_ENV=test
```

## 📋 Variable Categories

### Public Variables (NEXT*PUBLIC*\*)

These variables are exposed to the browser and should not contain sensitive information.

**Examples:**

- API endpoints
- Feature flags
- Application metadata
- Firebase public configuration

### Server-Only Variables

These variables are only available on the server side and can contain sensitive information.

**Examples:**

- Database connection strings
- API keys
- Private certificates
- Admin credentials

## 🔒 Security Guidelines

### Sensitive Information

- ❌ Never commit `.env.local` or `.env.production` to version control
- ✅ Use `.env.example` files to document required variables
- ✅ Rotate keys regularly
- ✅ Use different Firebase projects for different environments

### Environment Isolation

- 🔵 **Development**: Local development with test data
- 🟡 **Staging**: Production-like environment for testing
- 🟢 **Production**: Live application with real user data

## 🛠️ Setup Instructions

### 1. Copy Example Files

```bash
cp .env.example .env.local
cp .env.production.example .env.production
```

### 2. Configure Firebase

1. Create Firebase projects for each environment
2. Enable Authentication, Firestore, and Storage
3. Download service account keys
4. Update environment variables

### 3. Set Application Variables

1. Update app metadata (name, version, URL)
2. Configure feature flags
3. Set security and performance options

### 4. Validate Configuration

```bash
npm run build  # Verify build works
npm run dev    # Test development server
npm run test   # Run test suite
```

## 🔄 Variable Management

### Best Practices

- Use descriptive variable names
- Group related variables together
- Document purpose and format
- Validate required variables at startup

### Environment Detection

```typescript
// utils/environment.ts
export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";

export const getEnvVar = (name: string, fallback?: string): string => {
  const value = process.env[name];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value || fallback || "";
};
```

## 📝 Troubleshooting

### Common Issues

1. **Missing Variables**: Check `.env.local` exists and contains all required variables
2. **Build Failures**: Verify Firebase configuration is correct
3. **Runtime Errors**: Check that server-only variables aren't used in client code
4. **Authentication Issues**: Verify Firebase Auth domain and API key

### Debugging

```bash
# Check environment variables
npm run env-check

# Validate Firebase connection
npm run firebase-test

# Test build with environment
npm run build:test
```

---

**Last Updated**: August 26, 2025
**Security Level**: Internal Use Only
