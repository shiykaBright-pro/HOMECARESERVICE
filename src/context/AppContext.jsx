import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase, getProfile } from '../supabaseClient';
import { fetchAppointments, createAppointment, updateAppointment, cancelAppointment } from '../supabaseClient';

const AppContext = createContext();
const IS_DEV = process.env.NODE_ENV === 'development';

const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+237 679109117', role: 'patient', password: 'password123', status: 'active', joinDate: '2026-01-15', bloodType: 'O+', allergies: 'None', dob: '1990-01-15', address: '123 Main Street, Buea, Cameroon', emergencyContact: { name: 'Jane Doe', phone: '+237 673233297', relation: 'Spouse' }, medicalHistory: [] },
  { id: 2, name: 'Dr. Sarah Johnson', email: 'sarah@example.com', phone: '+237 670000001', role: 'doctor', specialty: 'General Medicine', licenseNumber: 'MD-12345', password: 'password123', status: 'active', joinDate: '2023-06-10', experience: '10 years', hospital: 'City General Hospital', rating: 4.8, totalRatings: 45 },
  { id: 3, name: 'Nurse Mike Brown', email: 'mike@example.com', phone: '+237 670000002', role: 'nurse', licenseNumber: 'RN-67890', password: 'password123', status: 'active', joinDate: '2023-08-20', experience: '7 years', specialization: 'Home Nursing, Wound Care', rating: 4.9, totalRatings: 32 },
  { id: 4, name: 'Admin User', email: 'admin@example.com', phone: '+237 670000003', role: 'admin', password: 'admin123', status: 'active', joinDate: '2023-01-01' },
  { id: 5, name: 'Dr. John Smith', email: 'john.smith@example.com', phone: '+237 670000004', role: 'doctor', specialty: 'Cardiology', licenseNumber: 'MD-54321', password: 'password123', status: 'active', joinDate: '2023-05-15', experience: '15 years', hospital: 'Heart Center Hospital', rating: 4.9, totalRatings: 78 },
  { id: 6, name: 'Test Doctor', email: 'doctor@test.com', phone: '+237 600000001', role: 'doctor', specialty: 'General Medicine', licenseNumber: 'TEST-MD-001', password: 'doctor123', status: 'active', joinDate: '2026-01-01', experience: '5 years', hospital: 'Test Hospital', rating: 4.5, totalRatings: 10 },
  { id: 7, name: 'Test Nurse', email: 'nurse@test.com', phone: '+237 600000002', role: 'nurse', licenseNumber: 'TEST-RN-001', password: 'nurse123', status: 'active', joinDate: '2026-01-01', experience: '5 years', specialization: 'General Nursing', rating: 4.5, totalRatings: 10 },
  { id: 8, name: 'Test Admin', email: 'admin@test.com', phone: '+237 600000003', role: 'admin', password: 'admin123', status: 'active', joinDate: '2026-01-01' },
];

const initialAppointments = [
  { id: 1, patientId: 1, patientName: 'John Doe', providerId: 2, providerName: 'Dr. Sarah Johnson', service: 'General Consultation', date: '2026-02-15', time: '10:00 AM', status: 'Confirmed', payment_status: 'paid', type: 'home', notes: 'Follow-up visit', price: 50 },
  { id: 2, patientId: 1, patientName: 'John Doe', providerId: 3, providerName: 'Nurse Mike Brown', service: 'Nursing Care', date: '2026-02-18', time: '2:00 PM', status: 'Pending', payment_status: 'pending', type: 'home', notes: 'Wound dressing', price: 40 },
  { id: 3, patientId: 1, patientName: 'John Doe', providerId: 5, providerName: 'Dr. John Smith', service: 'Cardiology', date: '2026-02-20', time: '11:00 AM', status: 'Confirmed', payment_status: 'paid', type: 'home', notes: 'Heart checkup', price: 60 },
];

const initialMedicalRecords = [
  { id: 1, patientId: 1, title: 'Annual Checkup', date: '2026-01-10', doctor: 'Dr. Sarah Johnson', type: 'Checkup', file: null, content: 'Patient is in good health. All vitals normal.' },
  { id: 2, patientId: 1, title: 'Blood Test Results', date: '2026-01-05', doctor: 'Lab Report', type: 'Lab Report', file: null, content: 'Hemoglobin: 14.5 g/dL, WBC: 7000/mcL, Platelets: 250000/mcL' },
  { id: 3, patientId: 1, title: 'Prescription', date: '2025-12-20', doctor: 'Dr. Sarah Johnson', type: 'Prescription', file: null, content: 'Vitamin D3 1000IU once daily, Calcium 500mg twice daily' },
];

const initialPrescriptions = [
  { id: 1, patientId: 1, doctorId: 2, doctorName: 'Dr. Sarah Johnson', date: '2026-01-10', medications: [{ name: 'Vitamin D3', dosage: '1000IU', frequency: 'Once daily', duration: '30 days' }, { name: 'Calcium', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' }], notes: 'Take with food', status: 'Active' },
];

const initialNotifications = [
  { id: 1, userId: 1, title: 'Appointment Confirmed', message: 'Your appointment with Dr. Sarah Johnson is confirmed', time: '2 hours ago', read: false, type: 'appointment' },
  { id: 2, userId: 1, title: 'New Prescription', message: 'You have a new prescription from Dr. John Smith', time: '1 day ago', read: false, type: 'prescription' },
];

const initialMessages = [
  { id: 1, fromId: 2, fromName: 'Dr. Sarah Johnson', toId: 1, message: 'Hello John, your test results look good. Keep up the healthy lifestyle!', timestamp: '2026-01-12 10:30 AM', read: true },
  { id: 2, fromId: 1, fromName: 'John Doe', toId: 2, message: 'Thank you doctor! I have a question about the medication.', timestamp: '2026-01-12 11:00 AM', read: false },
];

const initialReviews = [
  { id: 1, patientId: 1, patientName: 'John Doe', providerId: 2, providerName: 'Dr. Sarah Johnson', rating: 5, comment: 'Excellent doctor! Very thorough and caring.', date: '2026-01-15' },
  { id: 2, patientId: 1, patientName: 'Emily Davis', providerId: 2, providerName: 'Dr. Sarah Johnson', rating: 4, comment: 'Good experience, but wait time was a bit long.', date: '2026-01-20' },
  { id: 3, patientId: 1, patientName: 'John Doe', providerId: 3, providerName: 'Nurse Mike Brown', rating: 5, comment: 'Very professional and gentle. Highly recommend!', date: '2026-01-18' },
];

const initialVideoCalls = [
  { id: 1, callerId: 2, callerName: 'Dr. Sarah Johnson', receiverId: 1, receiverName: 'John Doe', status: 'completed', startTime: '2026-01-15 10:00 AM', endTime: '2026-01-15 10:15 AM' },
];

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    let parsedUsers = saved ? JSON.parse(saved) : initialUsers;
    const testUserIds = [6, 7, 8];
    const testUsersInInitial = initialUsers.filter(u => testUserIds.includes(u.id));
    const hasAllTestUsers = testUserIds.every(id => parsedUsers.find(u => u.id === id));
    if (!hasAllTestUsers) {
      const mergedUsers = [...parsedUsers.filter(u => !testUserIds.includes(u.id)), ...testUsersInInitial];
      localStorage.setItem('users', JSON.stringify(mergedUsers));
      return mergedUsers;
    }
    return parsedUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [providers, setProviders] = useState([]);
  const [providersFetched, setProvidersFetched] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsFetched, setAppointmentsFetched] = useState(false);

  const [medicalRecords, setMedicalRecords] = useState(() => {
    const saved = localStorage.getItem('medicalRecords');
    return saved ? JSON.parse(saved) : initialMedicalRecords;
  });

  const [prescriptions, setPrescriptions] = useState(() => {
    const saved = localStorage.getItem('prescriptions');
    return saved ? JSON.parse(saved) : initialPrescriptions;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [videoCallState, setVideoCallState] = useState({
    isInCall: false,
    callParticipant: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
    callStartTime: null,
    callType: null
  });

  const [videoCallHistory, setVideoCallHistory] = useState(() => {
    const saved = localStorage.getItem('videoCalls');
    return saved ? JSON.parse(saved) : initialVideoCalls;
  });

  const authInitialized = useRef(false);

  // Auth state initialization and listener
  useEffect(() => {
    if (authInitialized.current) return;
    authInitialized.current = true;

    const initAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        const profileResult = await getProfile(user.id);
        const resolvedName =
          profileResult.data?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User';
        if (profileResult.success && profileResult.data) {
          setCurrentUser({
            id: user.id,
            email: user.email,
            name: resolvedName,
            role: profileResult.data.role || 'patient',
            licenseNumber: profileResult.data.license || '',
            specialty: profileResult.data.specialty || '',
            ...profileResult.data
          });
        } else {
          if (IS_DEV) console.warn('Profile fetch failed, using auth fallback:', profileResult.error);
          setCurrentUser({
            id: user.id,
            email: user.email,
            name: resolvedName,
            role: 'patient',
            licenseNumber: '',
            specialty: ''
          });
        }
      }
    };
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profileResult = await getProfile(session.user.id);
        const resolvedName =
          profileResult.data?.name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'User';
        const fullUser = {
          id: session.user.id,
          email: session.user.email,
          name: resolvedName,
          role: profileResult.data?.role || 'patient',
          licenseNumber: profileResult.data?.license || '',
          specialty: profileResult.data?.specialty || '',
          ...(profileResult.data || {})
        };
        setCurrentUser(fullUser);
        localStorage.setItem('currentUser', JSON.stringify(fullUser));
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch providers from Supabase
  const fetchProviders = useCallback(async () => {
    try {
      if (IS_DEV) console.log('📊 Fetching providers from Supabase...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, specialty, license')
        .in('role', ['doctor', 'nurse']);

      if (error) {
        console.error('❌ Error fetching providers:', error);
        setProviders([]);
        return;
      }
      if (!data) {
        if (IS_DEV) console.warn('⚠️ No data returned from provider fetch');
        setProviders([]);
        return;
      }
      if (IS_DEV) console.log(`✅ Successfully fetched ${data.length} providers`);
      setProviders(data);
      setProvidersFetched(true);
    } catch (err) {
      console.error('💥 Exception during provider fetch:', err);
      setProviders([]);
    }
  }, []);

  const refreshProviders = useCallback(async () => {
    setProvidersFetched(false);
    await fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    if (!providersFetched) {
      fetchProviders();
    }
  }, [fetchProviders, providersFetched]);

  // Fetch appointments from Supabase
  const refreshAppointments = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      setAppointmentsLoading(true);
      if (IS_DEV) console.time('fetchAppointments');
      const role = currentUser.role === 'patient' ? 'patient' : 'provider';
      const { success, data, error } = await fetchAppointments(currentUser.id, role);
      if (IS_DEV) console.timeEnd('fetchAppointments');
      if (success) {
        const mapped = (data || []).map(apt => ({
          ...apt,
          patientId: apt.patient_id,
          providerId: apt.provider_id,
        }));
        setAppointments(prev => {
          const merged = [...mapped, ...prev.filter(p => typeof p.id === 'number')];
          return merged;
        });
        setAppointmentsFetched(true);
      } else {
        console.error('Failed to fetch appointments:', error);
      }
    } catch (err) {
      console.error('Error refreshing appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (currentUser?.id && !appointmentsFetched) {
      refreshAppointments();
    }
  }, [currentUser?.id, appointmentsFetched, refreshAppointments]);

  // Save video call history to localStorage
  useEffect(() => {
    localStorage.setItem('videoCalls', JSON.stringify(videoCallHistory));
  }, [videoCallHistory]);

  // Video call functions
  const startVideoCall = useCallback((participant, callType = 'outgoing') => {
    setVideoCallState({
      isInCall: true,
      callParticipant: participant,
      isAudioEnabled: true,
      isVideoEnabled: true,
      callStartTime: new Date().toISOString(),
      callType
    });

    setVideoCallHistory(prev => {
      const newCall = {
        id: prev.length + 1,
        callerId: callType === 'outgoing' ? currentUser?.id : participant.id,
        callerName: callType === 'outgoing' ? currentUser?.name : participant.name,
        receiverId: callType === 'outgoing' ? participant.id : currentUser?.id,
        receiverName: callType === 'outgoing' ? participant.name : currentUser?.name,
        status: 'ongoing',
        startTime: new Date().toLocaleString(),
        endTime: null
      };
      return [...prev, newCall];
    });
  }, [currentUser?.id, currentUser?.name]);

  const endVideoCall = useCallback(() => {
    setVideoCallState(prev => {
      if (prev.callStartTime) {
        setVideoCallHistory(history => {
          const ongoingCall = history.find(
            call => call.status === 'ongoing' &&
            (call.callerId === currentUser?.id || call.receiverId === currentUser?.id)
          );
          if (ongoingCall) {
            return history.map(call =>
              call.id === ongoingCall.id
                ? { ...call, status: 'completed', endTime: new Date().toLocaleString() }
                : call
            );
          }
          return history;
        });
      }
      return {
        isInCall: false,
        callParticipant: null,
        isAudioEnabled: true,
        isVideoEnabled: true,
        callStartTime: null
      };
    });
  }, [currentUser?.id]);

  const login = useCallback(async (email, password) => {
    try {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, data: user };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile } = await getProfile(data.user.id);
      const fullUser = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || '',
        role: profile?.role || 'patient',
        ...profile
      };
      setCurrentUser(fullUser);
      localStorage.setItem('currentUser', JSON.stringify(fullUser));
      return { success: true, data: fullUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, [users]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase logout error:', err);
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const addAppointment = useCallback(async (appointmentData) => {
    try {
      if (
        !appointmentData.patientId ||
        !appointmentData.providerId ||
        !appointmentData.service ||
        !appointmentData.date ||
        !appointmentData.time
      ) {
        throw new Error('Missing required fields');
      }

      if (typeof appointmentData.patientId !== 'string' || typeof appointmentData.providerId !== 'string') {
        if (IS_DEV) console.warn('Non-UUID IDs detected (using demo data)');
      }

      const supabaseData = {
        patient_id: appointmentData.patientId,
        patient_name: appointmentData.patientName,
        provider_id: appointmentData.providerId,
        provider_name: appointmentData.providerName,
        service: appointmentData.service,
        date: appointmentData.date,
        time: appointmentData.time,
        notes: appointmentData.notes || null,
        price: Number(appointmentData.price),
        type: appointmentData.type || 'home',
        status: 'Pending',
        payment_status: 'pending'
      };

      if (IS_DEV) console.log('Sending to Supabase:', supabaseData);
      const { success, data, error } = await createAppointment(supabaseData);
      if (!success) throw error;

      const newApt = { ...data, patientId: data.patient_id, providerId: data.provider_id };
      setAppointments(prev => [newApt, ...prev]);

      addNotification({
        userId: appointmentData.providerId,
        title: 'New Appointment Request',
        message: `${appointmentData.patientName} requested ${appointmentData.service}`,
        type: 'appointment'
      });

      return newApt;
    } catch (error) {
      console.error('addAppointment error:', error);
      throw error;
    }
  }, []);

  const updateAppointmentFn = useCallback(async (id, updates) => {
    try {
      const { success, data } = await updateAppointment(id, updates);
      if (success) {
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...data } : apt));
      }
      return success;
    } catch (error) {
      console.error('updateAppointment error:', error);
      throw error;
    }
  }, []);

  const cancelAppointmentFn = useCallback(async (id) => {
    return await updateAppointmentFn(id, { status: 'Cancelled' });
  }, [updateAppointmentFn]);

  const addMedicalRecord = useCallback((record) => {
    const newRecord = { ...record, id: medicalRecords.length + 1, date: new Date().toISOString().split('T')[0] };
    setMedicalRecords(prev => [...prev, newRecord]);
    return newRecord;
  }, [medicalRecords.length]);

  const addPrescription = useCallback((prescription) => {
    const newPrescription = { ...prescription, id: prescriptions.length + 1, date: new Date().toISOString().split('T')[0], status: 'Active' };
    setPrescriptions(prev => [...prev, newPrescription]);

    const patientNotification = {
      id: notifications.length + 1,
      userId: prescription.patientId,
      title: 'New Prescription',
      message: `You have a new prescription from ${prescription.doctorName}`,
      time: 'Just now',
      read: false,
      type: 'prescription'
    };
    setNotifications(prev => [patientNotification, ...prev]);

    return newPrescription;
  }, [prescriptions.length, notifications.length]);

  const deletePrescription = useCallback((id) => {
    setPrescriptions(prev => (prev || []).filter(p => p.id !== id));
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => {
      const newNotification = { ...notification, id: (prev.length || 0) + 1, time: 'Just now', read: false };
      return [newNotification, ...prev];
    });
  }, []);

  const sendMessage = useCallback((message) => {
    setMessages(prev => {
      const newMessage = { ...message, id: (prev.length || 0) + 1, timestamp: new Date().toLocaleString(), read: false };
      return [...prev, newMessage];
    });

    setNotifications(prev => {
      const newNotification = {
        id: (prev.length || 0) + 1,
        userId: message.toId,
        title: 'New Message',
        message: `You have a new message from ${message.fromName}`,
        time: 'Just now',
        read: false,
        type: 'message'
      };
      return [newNotification, ...prev];
    });
  }, []);

  const getConversation = useCallback((userId1, userId2) => {
    return messages.filter(m =>
      (m.fromId === userId1 && m.toId === userId2) ||
      (m.fromId === userId2 && m.toId === userId1)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [messages]);

  const addReview = useCallback((review) => {
    const newReview = { ...review, id: reviews.length + 1, date: new Date().toISOString().split('T')[0] };
    setReviews(prev => [...prev, newReview]);
    return newReview;
  }, [reviews.length]);

  const getProviderReviews = useCallback((providerId) => {
    return reviews.filter(r => r.providerId === providerId);
  }, [reviews]);

  const toggleAudio = useCallback(() => {
    setVideoCallState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }));
  }, []);

  const toggleVideo = useCallback(() => {
    setVideoCallState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
  }, []);

  const getVideoCallHistory = useCallback(() => videoCallHistory, [videoCallHistory]);

  const searchDoctors = useCallback((query) => {
    return users.filter(u =>
      u.role === 'doctor' &&
      (u.name.toLowerCase().includes(query.toLowerCase()) ||
       u.specialty?.toLowerCase().includes(query.toLowerCase()))
    );
  }, [users]);

  const filterAppointments = useCallback((filters) => {
    return appointments.filter(apt => {
      if (filters.status && apt.status !== filters.status) return false;
      if (filters.date && apt.date !== filters.date) return false;
      if (filters.service && apt.service !== filters.service) return false;
      if (filters.patientId && apt.patientId !== filters.patientId) return false;
      if (filters.providerId && apt.providerId !== filters.providerId) return false;
      return true;
    });
  }, [appointments]);

  const getAnalytics = useCallback(() => {
    const patients = users.filter(u => u.role === 'patient');
    const doctors = users.filter(u => u.role === 'doctor');
    const nurses = users.filter(u => u.role === 'nurse');
    const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed');
    const totalRevenue = confirmedAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);

    return {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      totalNurses: nurses.length,
      totalAppointments: appointments.length,
      confirmedAppointments: confirmedAppointments.length,
      pendingAppointments: appointments.filter(a => a.status === 'Pending').length,
      cancelledAppointments: appointments.filter(a => a.status === 'Cancelled').length,
      totalRevenue,
      monthlyAppointments: appointments.filter(a => a.date?.startsWith('2026-02')).length,
      newUsersThisMonth: users.filter(u => u.joinDate?.startsWith('2026-02')).length
    };
  }, [users, appointments]);

  const value = useMemo(() => ({
    users,
    currentUser,
    setCurrentUser,
    providers,
    providersFetched,
    refreshProviders,
    appointments,
    appointmentsLoading,
    appointmentsFetched,
    refreshAppointments,
    medicalRecords,
    addMedicalRecord,
    prescriptions,
    addPrescription,
    deletePrescription,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    messages,
    sendMessage,
    getConversation,
    reviews,
    addReview,
    getProviderReviews,
    videoCallState,
    videoCallHistory,
    startVideoCall,
    endVideoCall,
    toggleAudio,
    toggleVideo,
    getVideoCallHistory,
    searchDoctors,
    filterAppointments,
    getAnalytics,
    login,
    logout,
    addAppointment,
    updateAppointment: updateAppointmentFn,
    cancelAppointment: cancelAppointmentFn,
  }), [
    users, currentUser, providers, providersFetched, refreshProviders,
    appointments, appointmentsLoading, appointmentsFetched, refreshAppointments,
    medicalRecords, addMedicalRecord, prescriptions, addPrescription, deletePrescription,
    notifications, markNotificationRead, markAllNotificationsRead, addNotification,
    messages, sendMessage, getConversation,
    reviews, addReview, getProviderReviews,
    videoCallState, videoCallHistory, startVideoCall, endVideoCall, toggleAudio, toggleVideo, getVideoCallHistory,
    searchDoctors, filterAppointments, getAnalytics,
    login, logout, addAppointment, updateAppointmentFn, cancelAppointmentFn
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

