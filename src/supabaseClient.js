// Import createClient from @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

// Replace the URL below with your actual Supabase project URL
const SUPABASE_URL = "https://aleihwautyitkgoljdrt.supabase.co";

// Replace the key below with your actual Supabase public anon key
const SUPABASE_PUBLIC_KEY = "sb_publishable_PagUlrRI0H_Z6SbZqTSzTA_59LVkAOm";

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

