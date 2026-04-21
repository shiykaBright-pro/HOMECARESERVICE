import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://czudhvjomegowmnhnrda.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_wVyLnD7qg57JZtXd9Wm0xA_9CAg6glC';

console.log('Supabase client init:', { 
  url: supabaseUrl ? '✅ Loaded' : '❌ Missing - using fallback', 
  key: supabaseAnonKey ? '✅ Loaded' : '❌ Missing - using fallback' 
});

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

// Test function to verify database connection and insert capability
export const testDatabaseConnection = async () => {
  try {
    console.log("Testing database connection...");

    // Test 1: Check if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error("Connection test failed:", connectionError);
      return { success: false, error: connectionError };
    }

    console.log("Connection successful, row count:", connectionTest);

    // Test 2: Try to insert a test record (this will fail if RLS is blocking)
    const testData = {
      id: 'test-' + Date.now(),
      name: 'Test User',
      email: 'test@example.com',
      role: 'patient',
      license: null,
      specialty: null
    };

    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert(testData);

    if (insertError) {
      console.error("Insert test failed:", insertError);
      return { success: false, error: insertError, connectionOk: true };
    }

    console.log("Insert test successful:", insertData);
    return { success: true, data: insertData };

  } catch (error) {
    console.error("Database test error:", error);
    return { success: false, error };
  }
};

// Profile management functions
export const saveProfile = async (userId, profileData) => {
  try {
    console.log("Saving profile for user:", userId, profileData);

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        license: profileData.license || null,
        specialty: profileData.specialty || null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Profile save error:", error);
      throw error;
    }

    console.log("Profile saved successfully:", data);
    return { success: true, data };

  } catch (error) {
    console.error("Error saving profile:", error);
    return { success: false, error };
  }
};

export const getProfile = async (userId) => {
  try {
    console.log("Fetching profile for user:", userId);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error("Profile fetch error:", error);
      throw error;
    }

    console.log("Profile fetched:", data);
    return { success: true, data };

  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error };
  }
};

