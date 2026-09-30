import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, isConfigured } from '../services/firebase';
import { UserProfile, ProviderProfile } from '../types';
import { getUserProfile, signOutUser } from '../services/authService';
import { getProviderByUserId } from '../services/providerService';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  providerProfile: ProviderProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isProvider: boolean;
  isCustomer: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid);
      setUserProfile(profile);

      if (profile?.role === 'provider' || profile?.role === 'admin') {
        const prov = await getProviderByUserId(uid);
        setProviderProfile(prov);
      } else {
        setProviderProfile(null);
      }
    } catch (err) {
      console.warn('Error loading user profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser.uid);
    }
  };

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserProfile(null);
        setProviderProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  const logout = async () => {
    await signOutUser();
    setUserProfile(null);
    setProviderProfile(null);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isProvider = userProfile?.role === 'provider';
  const isCustomer = userProfile?.role === 'customer' || (!isAdmin && !isProvider && !!firebaseUser);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        providerProfile,
        loading,
        isAdmin,
        isProvider,
        isCustomer,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
