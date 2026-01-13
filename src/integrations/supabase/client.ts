import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Some features may not work.');
}

export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};
