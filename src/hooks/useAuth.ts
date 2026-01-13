import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthUser, SignInData, SignUpData } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener BEFORE getting current user
    const { unsubscribe } = authService.onAuthStateChange((authUser) => {
      if (mounted) {
        setUser(authUser);
        setIsLoading(false);
      }
    });

    initAuth();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (data: SignInData) => {
    setIsLoading(true);
    try {
      const authUser = await authService.signIn(data);
      setUser(authUser);
      toast({
        title: 'Welcome back!',
        description: `Signed in as ${authUser.email}`,
      });
      navigate('/app/interviewers');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      toast({
        title: 'Sign in failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const signUp = useCallback(async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const authUser = await authService.signUp(data);
      setUser(authUser);
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      });
      navigate('/app/interviewers');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      toast({
        title: 'Sign up failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      toast({
        title: 'Sign out failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const updateProfile = useCallback(async (data: { name?: string; avatarUrl?: string }) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const updatedUser = await authService.updateProfile(user.id, data);
      setUser(updatedUser);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast({
        title: 'Update failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast]);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}

// Simplified hook for just checking auth status
export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.isAuthenticated().then((authenticated) => {
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    });
  }, []);

  return { isAuthenticated, isLoading };
}
