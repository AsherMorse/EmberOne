'use client';

/** Auth context provider and hooks */

import type { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode, ReactElement } from 'react';

import { supabase } from '../supabase/client';

import { AUTH_CONFIG } from './config';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  logIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect((): (() => void) => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      AUTH_CONFIG.handleAuthChange(event, session);
      setSession(session);
      setUser(session?.user ?? null);

      // Handle redirects based on auth state
      switch (event) {
        case 'SIGNED_IN':
          if (pathname === '/login' || pathname === '/signup') {
            router.push(AUTH_CONFIG.AFTER_LOGIN_URL);
            router.refresh();
          }
          break;
        case 'SIGNED_OUT':
          router.push(AUTH_CONFIG.AFTER_LOGOUT_URL);
          router.refresh();
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  const logIn = async (email: string, password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      router.push(AUTH_CONFIG.AFTER_SIGN_UP_URL);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const value = {
    session,
    user,
    loading,
    error,
    logIn,
    signUp,
    logOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
