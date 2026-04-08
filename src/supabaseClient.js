import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pidivinfrnolticcgijg.supabase.co";
const supabaseKey = "sb_publishable_cV_1bOj2Jt22QlALo_xgUw_Pss_4-aH";
const SUPABASE_PUBLIC_KEY = supabaseKey;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export const googleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
};

export const handleAuthRedirect = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const supabaseLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
