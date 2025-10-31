/**
 * Authentication Service
 *
 * Handles all Firebase authentication operations.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateProfile,
  User,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '@/lib/firebase';
import { UserProfile, CreateUserProfile } from '@/types/firestore';

// ============================================================================
// SIGN UP
// ============================================================================

/**
 * Sign up with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create user profile in Firestore
    const userProfile: CreateUserProfile = {
      email,
      displayName: displayName || null,
    };

    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw handleAuthError(error as AuthError);
  }
};

// ============================================================================
// SIGN IN
// ============================================================================

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw handleAuthError(error as AuthError);
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user profile exists, create if not
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create user profile for new Google user
      const userProfile: CreateUserProfile = {
        email: user.email || '',
        displayName: user.displayName || null,
      };

      await setDoc(userDocRef, {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw handleAuthError(error as AuthError);
  }
};

// ============================================================================
// SIGN OUT
// ============================================================================

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw handleAuthError(error as AuthError);
  }
};

// ============================================================================
// PASSWORD RESET
// ============================================================================

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin, // Redirect back to app after reset
    });
  } catch (error) {
    console.error('Password reset error:', error);
    throw handleAuthError(error as AuthError);
  }
};

// ============================================================================
// EMAIL LINK (MAGIC LINK) AUTHENTICATION
// ============================================================================

const actionCodeSettings = {
  // URL to redirect back to (will be updated with actual deep link)
  url: window.location.origin,
  handleCodeInApp: true,
};

/**
 * Send sign-in link to email (magic link)
 */
export const sendSignInLink = async (email: string): Promise<void> => {
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // Store email in local storage for sign-in completion
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('emailForSignIn', email);
    }
  } catch (error) {
    console.error('Send sign-in link error:', error);
    throw handleAuthError(error as AuthError);
  }
};

/**
 * Complete sign-in with email link
 */
export const completeSignInWithEmailLink = async (
  emailLink: string,
  email?: string
): Promise<User> => {
  try {
    // Verify the link is a sign-in link
    if (!isSignInWithEmailLink(auth, emailLink)) {
      throw new Error('Invalid sign-in link');
    }

    // Get email from storage if not provided
    let userEmail = email;
    if (!userEmail && typeof window !== 'undefined') {
      userEmail = window.localStorage.getItem('emailForSignIn');
    }

    if (!userEmail) {
      throw new Error('Email is required to complete sign-in');
    }

    // Sign in with email link
    const userCredential = await signInWithEmailLink(auth, userEmail, emailLink);
    const user = userCredential.user;

    // Check if user profile exists, create if not
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create user profile for new user
      const userProfile: CreateUserProfile = {
        email: userEmail,
        displayName: null,
      };

      await setDoc(userDocRef, {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Clean up email from storage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('emailForSignIn');
    }

    return user;
  } catch (error) {
    console.error('Complete sign-in with email link error:', error);
    throw handleAuthError(error as AuthError);
  }
};

// ============================================================================
// USER PROFILE
// ============================================================================

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: { displayName?: string }
): Promise<void> => {
  try {
    // Update Firebase Auth profile
    if (auth.currentUser && updates.displayName !== undefined) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName,
      });
    }

    // Update Firestore profile
    await setDoc(
      doc(db, COLLECTIONS.USERS, userId),
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle Firebase Auth errors and return user-friendly messages
 */
const handleAuthError = (error: AuthError): Error => {
  let message = 'An error occurred. Please try again.';

  switch (error.code) {
    case 'auth/email-already-in-use':
      message = 'This email is already registered. Please sign in instead.';
      break;
    case 'auth/invalid-email':
      message = 'Invalid email address.';
      break;
    case 'auth/operation-not-allowed':
      message = 'Email/password accounts are not enabled. Please contact support.';
      break;
    case 'auth/weak-password':
      message = 'Password is too weak. Please use at least 6 characters.';
      break;
    case 'auth/user-disabled':
      message = 'This account has been disabled. Please contact support.';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email. Please sign up.';
      break;
    case 'auth/wrong-password':
      message = 'Incorrect password. Please try again.';
      break;
    case 'auth/invalid-credential':
      message = 'Invalid email or password.';
      break;
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Please try again later.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Please check your connection.';
      break;
    default:
      message = error.message || 'An error occurred. Please try again.';
  }

  return new Error(message);
};

// ============================================================================
// CURRENT USER
// ============================================================================

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};
