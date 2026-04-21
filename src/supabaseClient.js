// src/supabaseClient.js
// Replace the values below with your actual Supabase project credentials

const SUPABASE_URL = "https://czudhvjomegowmnhnrda.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_wVyLnD7qg57JZtXd9Wm0xA_9CAg6glC";

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

