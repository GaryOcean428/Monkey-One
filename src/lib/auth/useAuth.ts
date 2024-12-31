import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import type { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error loading auth session:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to load authentication session',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in',
      });

      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Sign In Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Welcome!',
        description: 'Please check your email to verify your account',
      });

      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: 'Sign Up Error',
        description: error instanceof Error ? error.message : 'Failed to sign up',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Signed out',
        description: 'Successfully signed out',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign Out Error',
        description: error instanceof Error ? error.message : 'Failed to sign out',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your email to reset your password',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Password Reset Error',
        description: error instanceof Error ? error.message : 'Failed to send password reset email',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Password Update Error',
        description: error instanceof Error ? error.message : 'Failed to update password',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}
