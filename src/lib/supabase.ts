import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Try multiple ways to get environment variables. Avoid direct `process` access in the browser.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) ||
  (typeof process !== 'undefined' && (process as any).env ? (process as any).env.VITE_SUPABASE_URL : undefined);

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) ||
  (typeof process !== 'undefined' && (process as any).env ? (process as any).env.VITE_SUPABASE_ANON_KEY : undefined);

// Debug logging for production
console.log('[DEBUG] Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('[DEBUG] Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('[DEBUG] All env vars:', import.meta.env);

let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  // In dev, missing env vars will previously throw and crash the app.
  // Log a clear warning and export a minimal stub that surface-errors when used.
  // This keeps the UI from failing to mount so you can still work on layout/components.
  // Create a lightweight stub with the same shape for the auth methods used in the app.
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Supabase client will be a noop. Create a .env.local with values from .env.example');

  // Minimal stub to prevent runtime throws; methods return objects similar to supabase responses.
  supabase = {
    auth: {
      async getSession() {
        return { data: { session: null } } as any;
      },
      onAuthStateChange(_: any) {
        return { data: { subscription: { unsubscribe: () => {} } } } as any;
      },
      async signUp() {
        return { error: new Error('Supabase not configured') } as any;
      },
      async signInWithPassword() {
        return { error: new Error('Supabase not configured') } as any;
      },
      async signOut() {
        return { error: new Error('Supabase not configured') } as any;
      },
    },
    from() {
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) } as any;
    },
  } as unknown as SupabaseClient;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  is_paid: boolean;
  stripe_customer_id: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
};
