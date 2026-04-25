import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://czudhvjomegowmnhnrda.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_wVyLnD7qg57JZtXd9Wm0xA_9CAg6glC';
const IS_DEV = process.env.NODE_ENV === 'development';

if (IS_DEV) {
  console.log('Supabase client init:', {
    url: supabaseUrl ? '✅ Loaded' : '❌ Missing - using fallback',
    key: supabaseAnonKey ? '✅ Loaded' : '❌ Missing - using fallback'
  });
}

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

    if (IS_DEV) console.log("Google OAuth initiated:", data);
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
      if (IS_DEV) console.log("OAuth session established:", session.user);
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
    if (IS_DEV) console.log("Testing database connection...");

    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error("Connection test failed:", connectionError);
      return { success: false, error: connectionError };
    }

    if (IS_DEV) console.log("Connection successful, row count:", connectionTest);

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

    if (IS_DEV) console.log("Insert test successful:", insertData);
    return { success: true, data: insertData };

  } catch (error) {
    console.error("Database test error:", error);
    return { success: false, error };
  }
};

// Profile management functions
export const saveProfile = async (userId, profileData) => {
  try {
    if (IS_DEV) console.log("Saving profile for user:", userId, profileData);

    const validRoles = ['admin', 'doctor', 'nurse', 'patient'];
    const role = profileData.role?.trim().toLowerCase();

    if (IS_DEV) console.log('Validating role before insert:', { raw: profileData.role, normalized: role });

    if (!role || !validRoles.includes(role)) {
      throw new Error(`Invalid role: "${profileData.role}". Must be one of: ${validRoles.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: profileData.name?.trim() || 'Unknown',
        email: profileData.email?.trim() || '',
        role: role,
        license: profileData.license?.trim() || null,
        specialty: profileData.specialty?.trim() || null
      });

    if (error) {
      console.error("Profile save error:", error);
      throw error;
    }

    if (IS_DEV) console.log("✅ Profile saved successfully with role:", role, data);
    return { success: true, data };

  } catch (error) {
    console.error("Error saving profile:", error);
    return { success: false, error: error.message };
  }
};


export const getProfile = async (userId) => {
  try {
    if (IS_DEV) console.log("Fetching profile for user:", userId);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, license, specialty, created_at')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      if (IS_DEV) console.log("Profile not found, auto-creating...");
      const createResult = await saveProfile(userId, {
        email: userId + '@fallback.com',
        role: 'patient',
        name: 'Patient User'
      });

      if (!createResult.success) {
        console.error("Auto-create failed:", createResult.error);
        return { success: false, data: null, error: 'Profile fetch failed' };
      }

      const { data: retryData, error: retryError } = await supabase
        .from('profiles')
        .select('id, name, email, role, license, specialty, created_at')
        .eq('id', userId)
        .single();

      if (retryError) {
        console.error("Retry fetch failed:", retryError);
        return { success: false, data: null, error: retryError };
      }

      if (IS_DEV) console.log("Auto-created profile fetched:", retryData);
      return { success: true, data: retryData };
    }

    if (error) {
      console.error("Profile fetch error:", error);
      throw error;
    }

    if (IS_DEV) console.log("Profile fetched:", data);
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
    if (IS_DEV) console.log(`Fetching appointments for ${role}:`, userId);
    if (IS_DEV) console.time('supabase_fetchAppointments');

    let query = supabase
      .from('appointments')
      .select('id, patient_id, patient_name, provider_id, provider_name, service, date, time, status, payment_status, type, notes, price, created_at')
      .order('created_at', { ascending: false });

    if (role === 'patient') {
      query = query.eq('patient_id', userId);
    } else {
      query = query.eq('provider_id', userId);
    }

    const { data, error } = await query;
    if (IS_DEV) console.timeEnd('supabase_fetchAppointments');

    if (error) {
      console.error('❌ Fetch appointments error:', error);
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      throw error;
    }

    if (IS_DEV) console.log(`✅ ${data?.length || 0} appointments fetched for ${role} ${userId}`);
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
    console.log('========== SUPABASE: createAppointment() ==========');
    console.log('📝 INPUT DATA:');
    console.log(JSON.stringify(appointmentData, null, 2));

    // Validate input structure
    const requiredFields = ['patient_id', 'provider_id', 'service', 'date', 'time'];
    const missingFields = requiredFields.filter(field => 
      appointmentData[field] === null || 
      appointmentData[field] === undefined || 
      appointmentData[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('✅ All required fields present');
    console.log('📤 Attempting INSERT into appointments table...');

    const insertPayload = [{
      patient_id: appointmentData.patient_id,
      patient_name: appointmentData.patient_name,
      provider_id: appointmentData.provider_id,
      provider_name: appointmentData.provider_name,
      service: appointmentData.service,
      date: appointmentData.date,
      time: appointmentData.time,
      notes: appointmentData.notes || null,
      price: appointmentData.price,
      type: appointmentData.type || 'home',
      status: appointmentData.status || 'Pending',
      payment_status: appointmentData.payment_status || 'pending'
    }];

    console.log('📊 INSERT PAYLOAD:');
    console.log(JSON.stringify(insertPayload, null, 2));

    const { data, error } = await supabase
      .from('appointments')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ SUPABASE INSERT ERROR:');
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      console.error('  Details:', error.details);
      console.error('  Hint:', error.hint);
      console.error('  Status:', error.status);
      console.error('  Full Error Object:', JSON.stringify(error, null, 2));
      
      // Return error details for better debugging
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: error.status
        }
      };
    }

    console.log('✅ APPOINTMENT INSERTED SUCCESSFULLY');
    console.log('  Returned Data:', JSON.stringify(data, null, 2));
    console.log('  Appointment ID:', data?.id);
    console.log('  Created At:', data?.created_at);
    console.log('=================================================');
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ EXCEPTION IN createAppointment():');
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
    console.error('  Full Error:', JSON.stringify(error, null, 2));
    return { success: false, error };
  }
};

/**
 * Update appointment (status, payment, etc.)
 */
export const updateAppointment = async (id, updates) => {
  try {
    if (IS_DEV) console.log('Updating appointment', id, 'with:', updates);

    if (!id) {
      throw new Error('Appointment ID is required for update');
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update appointment error:', error);
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      throw error;
    }

    if (IS_DEV) console.log('✅ Appointment updated:', data);
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
    if (IS_DEV) console.log('Cancelling appointment:', id);
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
    if (IS_DEV) console.log('Deleting appointment:', id);
    const { data, error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete appointment error:', error);
      throw error;
    }

    if (IS_DEV) console.log('Appointment deleted');
    return { success: true, data };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return { success: false, error };
  }
};

