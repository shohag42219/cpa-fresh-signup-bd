import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "your-supabase-anon-key-placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
