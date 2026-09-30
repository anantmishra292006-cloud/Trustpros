import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, UserRole } from '../types';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();

export function isDesignatedAdminEmail(email: string): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === ADMIN_EMAIL;
}

export function formatAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address entered is not valid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 8 characters with letters and numbers.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access has been temporarily restricted for security. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network communication failed. Please check your internet connection.';
    default:
      return error?.message || 'Authentication operation failed. Please try again.';
  }
}

export async function shouldBeFirstUserAdmin(): Promise<boolean> {
  if (!db) return false;
  try {
    const q = query(collection(db, 'users'), limit(1));
    const snap = await getDocs(q);
    return snap.empty;
  } catch (error) {
    console.warn('Could not check user count for admin bootstrapping:', error);
    return false;
  }
}

export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string,
  preferredRole: UserRole = 'customer'
): Promise<UserProfile> {
  if (!auth || !db) throw new Error('Firebase services are not initialized.');

  // Password length enforcement: minimum 8 characters
  if (!pass || pass.length < 8) {
    throw new Error('Password must be at least 8 characters in length.');
  }

  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = userCredential.user;

  await updateProfile(user, { displayName: displayName.trim() });

  // Automatically trigger email verification
  try {
    await sendEmailVerification(user);
  } catch (e) {
    console.warn('Initial verification email trigger note:', e);
  }

  // Determine role:
  // 1. Matches VITE_ADMIN_EMAIL? -> Admin
  // 2. First registered user in system? -> Admin
  // 3. Otherwise preferredRole
  let finalRole: UserRole = preferredRole;
  const isTargetAdmin = isDesignatedAdminEmail(email);
  const isFirst = await shouldBeFirstUserAdmin();

  if (isTargetAdmin || isFirst) {
    finalRole = 'admin';
  }

  const profile: UserProfile = {
    id: user.uid,
    email: user.email?.toLowerCase().trim() || email.toLowerCase().trim(),
    displayName: displayName.trim(),
    role: finalRole,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), profile);

    // If admin, record in /admins/{uid} for Firestore rules verification
    if (finalRole === 'admin') {
      await setDoc(doc(db, 'admins', user.uid), {
        id: user.uid,
        email: profile.email,
        assignedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }

  return profile;
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!auth) throw new Error('Authentication is not initialized.');
  if (!email || !email.trim()) throw new Error('Please enter your account email address.');
  await sendPasswordResetEmail(auth, email.trim());
}

export async function sendVerificationEmail(): Promise<void> {
  if (!auth?.currentUser) throw new Error('No signed-in user found.');
  await sendEmailVerification(auth.currentUser);
}

export async function signInWithEmail(email: string, pass: string): Promise<UserProfile> {
  if (!auth || !db) throw new Error('Firebase services are not initialized.');

  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const profile = await getUserProfile(userCredential.user.uid);

  if (!profile) {
    // If auth succeeds but profile is missing, self-heal and create one
    const isTargetAdmin = isDesignatedAdminEmail(email);
    const fallbackProfile: UserProfile = {
      id: userCredential.user.uid,
      email: email.toLowerCase().trim(),
      displayName: userCredential.user.displayName || email.split('@')[0],
      role: isTargetAdmin ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), fallbackProfile);
    if (isTargetAdmin) {
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        id: userCredential.user.uid,
        email: fallbackProfile.email,
        assignedAt: new Date().toISOString(),
      });
    }
    return fallbackProfile;
  }

  // Double-check if email matches admin email and upgrade if not yet set
  if (isDesignatedAdminEmail(email) && profile.role !== 'admin') {
    try {
      profile.role = 'admin';
      await updateDoc(doc(db, 'users', profile.id), { role: 'admin' });
      await setDoc(doc(db, 'admins', profile.id), {
        id: profile.id,
        email: profile.email,
        assignedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not auto-promote admin in Firestore:', e);
    }
  }

  return profile;
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn(`Could not fetch profile for user ${uid}:`, err);
    return null;
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (!db) return [];
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  if (!db) return;
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });
    if (newRole === 'admin') {
      await setDoc(doc(db, 'admins', userId), {
        id: userId,
        assignedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}
