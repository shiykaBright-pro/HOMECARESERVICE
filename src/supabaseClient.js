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

    // Validate and normalize role
    const validRoles = ['admin', 'doctor', 'nurse', 'patient'];
    const role = profileData.role?.trim().toLowerCase();
    
    console.log('Validating role before insert:', { raw: profileData.role, normalized: role });
    
    if (!role || !validRoles.includes(role)) {
      throw new Error(`Invalid role: "${profileData.role}". Must be one of: ${validRoles.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: profileData.name?.trim() || 'Unknown',
        email: profileData.email?.trim() || '',
        role: role,  // Validated lowercase role
        license: profileData.license?.trim() || null,
        specialty: profileData.specialty?.trim() || null
      });

    if (error) {
      console.error("Profile save error:", error);
      throw error;
    }

    console.log("✅ Profile saved successfully with role:", role, data);
    return { success: true, data };

  } catch (error) {
    console.error("Error saving profile:", error);
    return { success: false, error: error.message };
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

    if (error && error.code === 'PGRST116') {
      // Profile not found - auto-create minimal profile
      console.log("Profile not found, auto-creating...");
      const createResult = await saveProfile(userId, {
        email: userId + '@fallback.com', // Minimal required
        role: 'patient',
        name: 'Patient User'
      });
      
      if (!createResult.success) {
        console.error("Auto-create failed:", createResult.error);
        return { success: false, data: null, error: 'Profile fetch failed' };
      }

      // Retry fetch after create
      const { data: retryData, error: retryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (retryError) {
        console.error("Retry fetch failed:", retryError);
        return { success: false, data: null, error: retryError };
      }

      console.log("Auto-created profile fetched:", retryData);
      return { success: true, data: retryData };
    }

    if (error) {
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

// ===== APPOINTMENTS FUNCTIONS =====
/**
 * Fetch appointments for a user (patient or provider)
 */
export const fetchAppointments = async (userId, role = 'patient') => {
  try {
    console.log(`Fetching appointments for ${role}:`, userId);
    
    let query = supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (role === 'patient') {
      query = query.eq('patient_id', userId);
    } else {
      query = query.eq('provider_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch appointments error:', error);
      throw error;
    }

    console.log(`${data?.length || 0} appointments fetched`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error, data: [] };
  }
};

/**
 * Create new appointment (called by patient)
 */
export const createAppointment = async (appointmentData) => {
  try {
    console.log('Creating appointment:', appointmentData);

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: appointmentData.patientId,
        patient_name: appointmentData.patientName,
        provider_id: appointmentData.providerId,
        provider_name: appointmentData.providerName,
        service: appointmentData.service,
        date: appointmentData.date,
        time: appointmentData.time,
        notes: appointmentData.notes || null,
        price: appointmentData.price,
        type: appointmentData.type || 'home',
        status: 'Pending',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Create appointment error:', error);
      throw error;
    }

    console.log('Appointment created:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error };
  }
};

/**
 * Update appointment (status, payment, etc.)
 */
export const updateAppointment = async (id, updates) => {
  try {
    console.log('Updating appointment', id, updates);

    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...updates,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update appointment error:', error);
      throw error;
    }

    console.log('Appointment updated:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error updating appointment:', error);
    return { success: false, error };
  }
};

/**
 * Cancel appointment (soft delete via status)
 */
export const cancelAppointment = async (id) => {
  try {
    console.log('Cancelling appointment:', id);
    return await updateAppointment(id, { status: 'Cancelled' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return { success: false, error };
  }
};

/**
 * Delete appointment (hard delete)
 */
export const deleteAppointment = async (id) => {
  try {
    console.log('Deleting appointment:', id);
    const { data, error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete appointment error:', error);
      throw error;
    }

    console.log('Appointment deleted');
    return { success: true, data };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return { success: false, error };
  }
};


