import { supabase } from '../supabaseClient.js';


export const supabaseDB = {
  // Load all user data (appointments, prescriptions, etc. user can access)
  async loadUserData(supabaseUserId) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_user_id', supabaseUserId)
      .single();

    if (!user) throw new Error('User not found');

    const userId = user.id;

    // Fetch user's data (RLS handles filtering)
    const [appointmentsRes, prescriptionsRes, recordsRes, notificationsRes, messagesRes, reviewsRes] = 
      await Promise.all([
        supabase.from('appointments').select('*'),
        supabase.from('prescriptions').select('*'),
        supabase.from('medical_records').select('*'),
        supabase.from('notifications').select('*'),
        supabase.from('messages').select('*'),
        supabase.from('reviews').select('*')
      ]);

    return {
      appointments: appointmentsRes.data || [],
      medical_records: recordsRes.data || [],
      prescriptions: prescriptionsRes.data || [],
      notifications: notificationsRes.data || [],
      messages: messagesRes.data || [],
      reviews: reviewsRes.data || [],
      profile: user
    };
  },

  // Create appointment (patient creates, provider receives)
  async createAppointment(appointment) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create prescription (provider only)
  async createPrescription(prescription) {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([prescription])
      .select()
      .single();

    if (error) throw error;
    
    // Auto-create notification for patient
    const { error: notifError } = await supabase
      .from('notifications')
      .insert([{
        user_id: prescription.patient_id,
        title: 'New Prescription',
        message: `Prescription from ${prescription.medication}`,
        type: 'prescription'
      }]);

    return data;
  },

  // Create medical record
  async createMedicalRecord(record) {
    const { data, error } = await supabase
      .from('medical_records')
      .insert([record])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Reviews
  async createReview(review) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getProviderReviews(providerId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('provider_id', providerId);
    if (error) throw error;
    return data || [];
  },

  // Get user prescriptions
  async getUserPrescriptions(userId) {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', userId);
    if (error) throw error;
    return data || [];
  },

  // Update appointment status
  async updateAppointment(id, updates) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Realtime subscriptions
  subscribeToTable(table, callback) {
    return supabase
      .channel(`table:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  }
};



