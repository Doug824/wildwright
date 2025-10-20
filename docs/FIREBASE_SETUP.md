# Firebase Setup Guide

This guide walks through setting up Firebase for the WildWright project.

---

## Prerequisites

- Google account
- Firebase CLI (we'll install this)
- Node.js and npm installed (already done)

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. **Project name**: `wildwright` (or your preferred name)
4. **Google Analytics**: Optional (recommended for production, can skip for development)
5. Click "Create project" and wait for initialization

---

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. **App nickname**: `WildWright Mobile App`
3. **Do NOT check** "Set up Firebase Hosting" (we're using Expo)
4. Click "Register app"
5. **Copy the Firebase config object** - you'll need this later

The config will look like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "wildwright-xxxxx.firebaseapp.com",
  projectId: "wildwright-xxxxx",
  storageBucket: "wildwright-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click on **Sign-in method** tab
3. Enable the following providers:

### Email/Password
- Click **Email/Password**
- **Enable** the first toggle (Email/Password)
- Optionally enable **Email link (passwordless sign-in)** for magic links
- Click **Save**

### Future: Add more providers
- Google (for social login)
- Apple (required for iOS App Store)

---

## Step 4: Set up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. **Start in production mode** (we'll add security rules next)
4. **Select location**: Choose closest to your users (e.g., `us-central1`, `europe-west1`)
5. Click **Enable**

### Deploy Security Rules

1. Create `firestore.rules` in project root:
```bash
# In your project directory
touch firestore.rules
```

2. Copy the security rules from `docs/FIRESTORE_SCHEMA.md` section into `firestore.rules`

3. In Firebase Console, go to **Firestore Database** → **Rules** tab
4. Copy and paste the rules, then **Publish**

---

## Step 5: Set up Firebase Storage

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. **Start in production mode** (we'll add rules next)
4. Use the same location as Firestore
5. Click **Done**

### Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Use these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploaded form images
    match /users/{userId}/forms/{formId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

---

## Step 6: Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Fill in your Firebase config values:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=wildwright-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=wildwright-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=wildwright-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Important:** Never commit `.env` to git! It's already in `.gitignore`.

---

## Step 7: Initialize Firebase in Code

Create `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

---

## Step 8: Install Firebase CLI (Optional for later)

The Firebase CLI is useful for deploying rules, managing data, and more.

```bash
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (optional)
firebase init
# Select: Firestore, Storage
# Use existing project: wildwright-xxxxx
```

---

## Step 9: Seed Template Data (Later)

Once the app is running, we'll need to populate `wildShapeTemplates` collection with official PF1e creatures. This will be done via a seed script.

**For now, skip this step** - we'll create the seed script in Phase 1.

---

## Step 10: Test Firebase Connection

After npm install completes, we'll create a simple test to verify Firebase is connected:

1. Update `src/app/index.tsx` to import Firebase
2. Log Firebase app initialization
3. Run `npm start` and check console

---

## Firestore Indexes

Firestore will automatically create indexes for simple queries. For complex queries (multiple fields, array-contains-any), you may need composite indexes.

**Firebase will prompt you** with a link to create indexes when you run queries that need them. Click the link and Firebase Console will auto-generate the index.

---

## Security Considerations

✅ **Do:**
- Keep `.env` in `.gitignore`
- Use environment variables for all config
- Enable security rules before deploying
- Use Firebase Authentication for all data access
- Regularly review security rules

❌ **Don't:**
- Commit API keys to git
- Disable security rules in production
- Use admin SDK in client code
- Store sensitive data in Firestore without encryption

---

## Troubleshooting

### "Permission denied" errors
- Check Firestore Security Rules
- Verify user is authenticated
- Ensure `ownerId` matches `request.auth.uid`

### "Firebase not initialized"
- Check `.env` file exists and has correct values
- Verify environment variables are prefixed with `EXPO_PUBLIC_`
- Restart Expo dev server after changing `.env`

### Slow queries
- Check Firestore Console for index recommendations
- Create composite indexes as needed
- Limit query results with `.limit()`

---

## Next Steps

After Firebase is set up:
1. ✅ Create Firebase project
2. ✅ Enable Authentication (Email/Password)
3. ✅ Set up Firestore with security rules
4. ✅ Set up Storage with security rules
5. ✅ Configure environment variables
6. Create `src/lib/firebase.ts` (next task)
7. Create authentication hooks and services
8. Build UI components
9. Seed template data

---

## Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [React Native Firebase](https://rnfirebase.io/) - Alternative library (not used in this project)
