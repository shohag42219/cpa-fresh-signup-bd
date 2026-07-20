import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://wcjbaawyotvzkoslqbcl.supabase.co";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_FnTNK485rGVKhgsBYKp2nw_5WnizV5c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
