import { createClient } from "@supabase/supabase-js";

export const BUCKET = "UniNest";

// Login is handled by your own backend, so Supabase only needs to store files
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);