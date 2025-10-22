/**
 * Firebase Configuration and Initialization
 *
 * This file initializes Firebase services for the app.
 * Ensure .env file is configured with Firebase credentials.
 *
 * See docs/FIREBASE_SETUP.md for setup instructions.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate configuration
const validateConfig = () => {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]);

  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase configuration keys:', missingKeys);
    console.error('Please ensure .env file is configured with all Firebase credentials.');
    console.error('See .env.example and docs/FIREBASE_SETUP.md for details.');
    throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}`);
  }
};

// Validate before initializing
validateConfig();

// ============================================================================
// INITIALIZE FIREBASE
// ============================================================================

console.log('🔥 Initializing Firebase...');

const app = initializeApp(firebaseConfig);

// Initialize Auth - getAuth() automatically handles persistence for the platform
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

console.log('✅ Firebase initialized successfully');
console.log(`📦 Project ID: ${firebaseConfig.projectId}`);

// ============================================================================
// EXPORTS
// ============================================================================

export { app, auth, db, storage };
export default app;

// ============================================================================
// COLLECTION NAMES
// ============================================================================

export const COLLECTIONS = {
  USERS: 'users',
  CHARACTERS: 'characters',
  WILD_SHAPE_FORMS: 'wildShapeForms',
  WILD_SHAPE_TEMPLATES: 'wildShapeTemplates',
} as const;
