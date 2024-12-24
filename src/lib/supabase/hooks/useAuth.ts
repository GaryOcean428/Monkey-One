import { useEffect, useState } from 'react';
import { User, Session, Provider } from '@supabase/supabase-js';
import { supabase } from '../client';

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        error: error ? { message: error.message } : null
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message, status: error.status } };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message, status: error.status } };
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message, status: error.status } };
    }
  };

  const linkIdentity = async (provider: Provider) => {
    try {
      const { data, error } = await supabase.auth.linkIdentity({ provider });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message, status: error.status } };
    }
  };

  const unlinkIdentity = async (identity: any) => {
    try {
      const { data, error } = await supabase.auth.unlinkIdentity(identity);
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message, status: error.status } };
    }
  };

  const getLinkedIdentities = async () => {
    try {
      const { data: { identities }, error } = await supabase.auth.getUserIdentities();
      if (error) throw error;
      return { identities, error: null };
    } catch (error: any) {
      return { identities: null, error: { message: error.message, status: error.status } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message, status: error.status } };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message, status: error.status } };
    }
  };

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    signOut,
    updatePassword,
    linkIdentity,
    unlinkIdentity,
    getLinkedIdentities
  };
}
