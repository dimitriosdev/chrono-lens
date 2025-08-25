# 🚀 Firebase CI/CD Deployment Setup

## 🎯 Deployment Strategy

**Recommended: Deploy from `main` branch** (modern approach)

- ✅ Simpler workflow
- ✅ Faster deployments
- ✅ Less maintenance

## Quick Setup Guide

### 1. 🔧 Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (choose existing project)
firebase init hosting
```

### 2. 🔑 GitHub Secrets Setup

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these repository secrets:

```
FIREBASE_SERVICE_ACCOUNT: (see step 3)
FIREBASE_PROJECT_ID: your-firebase-project-id
```

### 3. 🛡️ Generate Firebase Service Account

```bash
# Generate service account key
firebase projects:list
firebase serviceaccount:generate-key ./firebase-service-account.json --project YOUR_PROJECT_ID

# Copy the entire content of firebase-service-account.json
# Paste it as FIREBASE_SERVICE_ACCOUNT secret in GitHub
```

⚠️ **IMPORTANT**: Delete the `firebase-service-account.json` file after copying - never commit it!

### 4. 🚀 Deployment Process

**Automatic:**

- Push to `main` → deploys to production
- Open PR → creates preview deployment
- Preview URLs appear in PR comments

**Manual:**

```bash
npm run deploy          # Deploy to production
npm run deploy:preview  # Deploy to preview channel
```

## � Pre-Deployment Checklist

Before going live, ensure:

1. **Firebase Project Setup:**

   ```bash
   # Update .firebaserc with your project ID
   {
     "projects": {
       "default": "your-actual-firebase-project-id"
     }
   }
   ```

2. **Environment Variables:**

   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local
   # Fill in your actual Firebase config values
   ```

3. **Test Build Locally:**
   ```bash
   npm run build
   # Should complete without errors
   ```

## 🌐 Live Deployment

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Setup CI/CD deployment"
   git push origin main
   ```

2. **Check GitHub Actions:**

   - Go to your repo → Actions tab
   - Watch the deployment workflow

3. **Access Your App:**
   - Live URL: `https://YOUR_PROJECT_ID.web.app`
   - Firebase Console: Monitor deployments

## 🛠️ Troubleshooting

**Build fails?**

```bash
npm run build  # Test locally first
```

**Dynamic routes not working?**

- ✅ Already configured with proper rewrites
- All routes redirect to index.html for client-side routing

**Images not loading?**

- Check Firebase Storage CORS configuration
- Verify image URLs in the app

## � You're Ready!

Your Next.js app will now automatically deploy to Firebase Hosting with:

- ✅ Zero downtime deployments
- ✅ Preview deployments for PRs
- ✅ Automatic build validation
- ✅ Client-side routing support

**Next Steps:**

1. Add GitHub secrets (see setup guide above)
2. Push to main branch
3. Watch it deploy! 🚀

**Your Firebase Project ID:** `chrono-lens-ac1885`
**Live URL:** https://chrono-lens-ac1885.web.app
