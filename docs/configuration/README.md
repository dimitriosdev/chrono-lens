# Configuration

## Environment Setup

See [Environment Variables](ENVIRONMENT_VARIABLES.md) for complete configuration reference.

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Add your config to `.env.local`

## Required Environment Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
