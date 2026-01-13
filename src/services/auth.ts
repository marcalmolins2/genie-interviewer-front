import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type { Profile } from '@/integrations/supabase/database.types';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Convert Supabase profile to AuthUser
function profileToAuthUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatar_url,
  };
}

export const authService = {
  // Sign up with email and password
  async signUp({ email, password, name }: SignUpData): Promise<AuthUser> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');

    // Profile is auto-created via trigger, fetch it
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;
    
    return profileToAuthUser(profile);
  },

  // Sign in with email and password
  async signIn({ email, password }: SignInData): Promise<AuthUser> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to sign in');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;
    
    return profileToAuthUser(profile);
  },

  // Sign out
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) {
      // Clear any local mock auth state
      localStorage.removeItem('mock_user');
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current authenticated user
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured()) {
      // Return mock user if exists
      const mockUser = localStorage.getItem('mock_user');
      if (mockUser) {
        return JSON.parse(mockUser);
      }
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) return null;
    
    return profileToAuthUser(profile);
  },

  // Get current session
  async getSession() {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!isSupabaseConfigured()) {
      // For mock mode, just call once with current state
      const mockUser = localStorage.getItem('mock_user');
      callback(mockUser ? JSON.parse(mockUser) : null);
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          callback(profile ? profileToAuthUser(profile) : null);
        } else {
          callback(null);
        }
      }
    );

    return { unsubscribe: () => subscription.unsubscribe() };
  },

  // Update user profile
  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }): Promise<AuthUser> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    return profileToAuthUser(profile);
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  },
};
