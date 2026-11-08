import { createClient } from "@supabase/supabase-js";
import siteConfig from "../config";

export const supabase = createClient(
  siteConfig.supabaseUrl,
  siteConfig.supabaseAnonKey
);
