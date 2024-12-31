import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/config';
import { useToast } from '@/components/ui/use-toast';

export function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          toast({
            title: 'Authentication Successful',
            description: 'You have been successfully authenticated',
          });
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: 'Authentication Error',
          description: error instanceof Error ? error.message : 'Authentication failed',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return <div>Processing authentication...</div>;
}

export function PasswordReset() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Get the access token from the URL
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (!accessToken) {
          throw new Error('No access token found in URL');
        }

        // Verify and exchange the access token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: accessToken,
          type: 'recovery',
        });

        if (error) throw error;

        toast({
          title: 'Password Reset Successful',
          description: 'Your password has been successfully reset',
        });
        
        navigate('/login');
      } catch (error) {
        console.error('Password reset error:', error);
        toast({
          title: 'Password Reset Error',
          description: error instanceof Error ? error.message : 'Password reset failed',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    handlePasswordReset();
  }, [location, navigate, toast]);

  return <div>Processing password reset...</div>;
}
