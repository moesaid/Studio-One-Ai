'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { signInWithGoogle, signOutUser, onAuthChange } from '../services';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  }, []);

  const signInBypass = useCallback(() => {
    // Dev-only: set a mock user object to bypass Firebase auth entirely
    setUser({
      uid: 'dev-bypass-user',
      email: 'dev@studioone.ai',
      displayName: 'Dev User',
      photoURL: null,
      emailVerified: true,
      isAnonymous: true,
    } as unknown as User);
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign-out failed:', error);
      throw error;
    } finally {
      setUser(null);
    }
  }, []);

  return { user, loading, signIn, signInBypass, signOut };
}
