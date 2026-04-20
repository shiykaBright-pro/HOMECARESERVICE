import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+237 679109117', role: 'patient', password: 'password123', status: 'active', joinDate: '2026-01-15', bloodType: 'O+', allergies: 'None', dob: '1990-01-15', address: '123 Main Street, Buea, Cameroon', emergencyContact: { name: 'Jane Doe', phone: '+237 673233297', relation: 'Spouse' }, medicalHistory: [] },
  { id: 2, name: 'Dr. Sarah Johnson', email: 'sarah@example.com', phone: '+237 670000001', role: 'doctor', specialty: 'General Medicine', licenseNumber: 'MD-12345', password: 'password123', status: 'active', joinDate: '2023-06-10', experience: '10 years', hospital: 'City General Hospital', rating: 4.8, totalRatings: 45 },
  { id: 3, name: 'Nurse Mike Brown', email: 'mike@example.com', phone: '+237 670000002', role: 'nurse', licenseNumber: 'RN-67890', password: 'password123', status: 'active', joinDate: '2023-08-20', experience: '7 years', specialization: 'Home Nursing, Wound Care', rating: 4.9, totalRatings: 32 },
  { id: 4, name: 'Admin User', email: 'admin@example.com', phone: '+237 670000003', role: 'admin', password: 'admin123', status: 'active', joinDate: '2023-01-01' },
  { id: 5, name: 'Dr. John Smith', email: 'john.smith@example.com', phone: '+237 670000004', role: 'doctor', specialty: 'Cardiology', licenseNumber: 'MD-54321', password: 'password123', status: 'active', joinDate: '2023-05-15', experience: '15 years', hospital: 'Heart Center Hospital', rating: 4.9, totalRatings: 78 },
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
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

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

  // Video call state
  const [videoCallState, setVideoCallState] = useState({
    isInCall: false,
    callParticipant: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
    callStartTime: null,
    callType: null // 'incoming' or 'outgoing'
  });

  const [videoCallHistory, setVideoCallHistory] = useState(() => {
    const saved = localStorage.getItem('videoCalls');
    return saved ? JSON.parse(saved) : initialVideoCalls;
  });

  // Save video call history to localStorage
  useEffect(() => {
    localStorage.setItem('videoCalls', JSON.stringify(videoCallHistory));
  }, [videoCallHistory]);

  // Video call functions
  const startVideoCall = (participant, callType = 'outgoing') => {
    setVideoCallState({
      isInCall: true,
      callParticipant: participant,
      isAudioEnabled: true,
      isVideoEnabled: true,
      callStartTime: new Date().toISOString(),
      callType
    });
    
    // Add to call history
    const newCall = {
      id: videoCallHistory.length + 1,
      callerId: callType === 'outgoing' ? currentUser?.id : participant.id,
      callerName: callType === 'outgoing' ? currentUser?.name : participant.name,
      receiverId: callType === 'outgoing' ? participant.id : currentUser?.id,
      receiverName: callType === 'outgoing' ? participant.name : currentUser?.name,
      status: 'ongoing',
      startTime: new Date().toLocaleString(),
      endTime: null
    };
    setVideoCallHistory([...videoCallHistory, newCall]);
  };

  const endVideoCall = () => {
    if (videoCallState.callStartTime) {
      // Update the call history with end time
      const ongoingCall = videoCallHistory.find(
        call => call.status === 'ongoing' && 
        (call.callerId === currentUser?.id || call.receiverId === currentUser?.id)
      );
      
      if (ongoingCall) {
        setVideoCallHistory(videoCallHistory.map(call => 
          call.id === ongoingCall.id 
            ? { ...call, status: 'completed', endTime: new Date().toLocaleString() }
            : call
        ));
      }
    }
    
    setVideoCallState({
      isInCall: false,
      callParticipant: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      callStartTime: null,
      callType: null
    });
  };

  const toggleAudio = () => {
    setVideoCallState(prev => ({
      ...prev,
      isAudioEnabled: !prev.isAudioEnabled
    }));
  };

  const toggleVideo = () => {
    setVideoCallState(prev => ({
      ...prev,
      isVideoEnabled: !prev.isVideoEnabled
    }));
  };

  const getVideoCallHistory = (userId) => {
    return videoCallHistory.filter(
      call => call.callerId === userId || call.receiverId === userId
    );
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Auth functions
  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (userData) => {
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = { ...userData, id: users.length + 1, status: 'active', joinDate: new Date().toISOString().split('T')[0] };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Appointment functions
  const addAppointment = (appointment) => {
const newAppointment = { ...appointment, id: appointments.length + 1, status: 'Pending', payment_status: 'pending' };

    setAppointments([...appointments, newAppointment]);
    
    // Add notification
    const newNotification = {
      id: notifications.length + 1,
      userId: appointment.providerId,
      title: 'New Appointment Request',
      message: `${appointment.patientName} requested an appointment for ${appointment.service}`,
      time: 'Just now',
      read: false,
      type: 'appointment'
    };
    setNotifications([newNotification, ...notifications]);
    
    return newAppointment;
  };

  const updateAppointment = (id, updates) => {
    setAppointments(appointments.map(apt => apt.id === id ? { ...apt, ...updates } : apt));
  };

  const cancelAppointment = (id) => {
    setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: 'Cancelled' } : apt));
  };

  // Medical Records functions
  const addMedicalRecord = (record) => {
    const newRecord = { ...record, id: medicalRecords.length + 1, date: new Date().toISOString().split('T')[0] };
    setMedicalRecords([...medicalRecords, newRecord]);
    return newRecord;
  };

  // Prescription functions
  const addPrescription = (prescription) => {
    const newPrescription = { ...prescription, id: prescriptions.length + 1, date: new Date().toISOString().split('T')[0], status: 'Active' };
    setPrescriptions([...prescriptions, newPrescription]);
    
    // Add notification for patient
    const patientNotification = {
      id: notifications.length + 1,
      userId: prescription.patientId,
      title: 'New Prescription',
      message: `You have a new prescription from ${prescription.doctorName}`,
      time: 'Just now',
      read: false,
      type: 'prescription'
    };
    setNotifications([patientNotification, ...notifications]);
    
    return newPrescription;
  };

  const deletePrescription = (id) => {
    setPrescriptions((prev) => (prev || []).filter(p => p.id !== id));
  };

  // Notification functions
  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const addNotification = (notification) => {
    const newNotification = { ...notification, id: notifications.length + 1, time: 'Just now', read: false };
    setNotifications([newNotification, ...notifications]);
  };

  // Message functions
  const sendMessage = (message) => {
    const newMessage = { ...message, id: messages.length + 1, timestamp: new Date().toLocaleString(), read: false };
    setMessages([...messages, newMessage]);
    
    // Add notification for recipient
    const newNotification = {
      id: notifications.length + 1,
      userId: message.toId,
      title: 'New Message',
      message: `You have a new message from ${message.fromName}`,
      time: 'Just now',
      read: false,
      type: 'message'
    };
    setNotifications([newNotification, ...notifications]);
    
    return newMessage;
  };

  const getConversation = (userId1, userId2) => {
    return messages.filter(m => 
      (m.fromId === userId1 && m.toId === userId2) || 
      (m.fromId === userId2 && m.toId === userId1)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // Review functions
  const addReview = (review) => {
    const newReview = { ...review, id: reviews.length + 1, date: new Date().toISOString().split('T')[0] };
    setReviews([...reviews, newReview]);
    return newReview;
  };

  const getProviderReviews = (providerId) => {
    return reviews.filter(r => r.providerId === providerId);
  };

  // Search and filter functions
  const searchDoctors = (query) => {
    return users.filter(u => 
      u.role === 'doctor' && 
      (u.name.toLowerCase().includes(query.toLowerCase()) || 
       u.specialty?.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const filterAppointments = (filters) => {
    return appointments.filter(apt => {
      if (filters.status && apt.status !== filters.status) return false;
      if (filters.date && apt.date !== filters.date) return false;
      if (filters.service && apt.service !== filters.service) return false;
      if (filters.patientId && apt.patientId !== filters.patientId) return false;
      if (filters.providerId && apt.providerId !== filters.providerId) return false;
      return true;
    });
  };

  // Analytics for admin
  const getAnalytics = () => {
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
      monthlyAppointments: appointments.filter(a => a.date.startsWith('2026-02')).length,
      newUsersThisMonth: users.filter(u => u.joinDate?.startsWith('2026-02')).length
    };
  };

  const value = {
    // Users
    users,
    currentUser,
    login,
    register,
    logout,
    
    // Appointments
    appointments,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    filterAppointments,
    
    // Medical Records
    medicalRecords,
    addMedicalRecord,
    
    // Prescriptions
    prescriptions,
    addPrescription,
    deletePrescription,
    
    // Notifications
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    
    // Messages
    messages,
    sendMessage,
    getConversation,
    
    // Reviews
    reviews,
    addReview,
    getProviderReviews,
    
    // Video Call
    videoCallState,
    videoCallHistory,
    startVideoCall,
    endVideoCall,
    toggleAudio,
    toggleVideo,
    getVideoCallHistory,
    
    // Search
    searchDoctors,
    
    // Analytics
    getAnalytics,
  };

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
