import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wcjbaawyotvzkoslqbcl.supabase.co";
const supabaseAnonKey = "Sb_publishable_FnTNK485rGVKhgsBYKp2nw_5WnizV5c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
