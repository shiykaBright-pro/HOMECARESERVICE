import { createClient } from "@supabase/supabase-js";

// Supabase Configuration
const SUPABASE_URL = "https://aleihwautyitkgoljdrt.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_PagUlrRI0H_Z6SbZqTSzTA_59LVkAOm";

// Create and export Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);