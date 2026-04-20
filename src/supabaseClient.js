import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project URL and public key
const SUPABASE_URL = "https://aleihwautyitkgoljdrt.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_PagUlrRI0H_Z6SbZqTSzTA_59LVkAOm";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);