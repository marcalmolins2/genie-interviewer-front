import { createClient } from '@supabase/supabase-js';

// Public Supabase credentials (safe to expose - RLS protects data)
const SUPABASE_URL = "https://wrgeciefpwdxrjdjycgl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZ2VjaWVmcHdkeHJqZGp5Y2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjE4OTcsImV4cCI6MjA2MjAzNzg5N30.gxBnXFH3QKeaJhCfdHsQU_o7ij-QCvYr1yx60YWzI9M";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Always configured now with hardcoded credentials
export const isSupabaseConfigured = () => true;
