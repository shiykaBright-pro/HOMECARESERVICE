import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log(supabaseUrl, supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Google OAuth login function
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error("Google OAuth error:", error);
      throw error;
    }

    console.log("Google OAuth initiated:", data);
    return data;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Handle OAuth session callback
export const handleOAuthCallback = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("OAuth callback error:", error);
      throw error;
    }

    if (session?.user) {
      console.log("OAuth session established:", session.user);
      return session.user;
    }

    return null;
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    throw error;
  }
};

