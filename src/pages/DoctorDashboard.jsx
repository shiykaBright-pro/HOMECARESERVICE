import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Dashboard.css';

function DoctorDashboard() {
  const navigate = useNavigate();
  const { currentUser, users, appointments, medicalRecords, prescriptions, notifications, messages, sendMessage, getConversation, updateAppointment, addPrescription, deletePrescription, addMedicalRecord, logout } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  
  // Doctor's prescriptions - filter from context
  const doctorPrescriptions = (prescriptions || []).filter(p => p.doctorId === currentUser?.id);
  
  // Prescription form state - single med for prescriptions tab
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });

  
  // Medical record form state
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordForm, setRecordForm] = useState({
    title: '',
    type: 'Checkup',
    content: ''
  });

  // Get appointments for this doctor
  const doctorAppointments = (appointments || []).filter(apt => apt.providerId === currentUser?.id);
  
  // Get patients who have appointments with this doctor
  const patientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))];
  const patients = (users || []).filter(u => patientIds.includes(u.id) && u.role === 'patient');
  
  // Get doctor's appointments patients
  const doctorPatients = doctorAppointments.map(apt => ({
    ...((users || []).find(u => u.id === apt.patientId) || {}),
    lastAppointment: apt.date,
    lastService: apt.service,
    appointmentId: apt.id
  })).filter(p => p.id);

  // Get unique patients
  const uniquePatients = [...new Map(doctorPatients.map(p => [p.id, p])).values()];
  
  // Get user's notifications
  const userNotifications = (notifications || []).filter(notif => notif.userId === currentUser?.id);

  // Get messages for this doctor
  const doctorMessages = (messages || []).filter(m => m.fromId === currentUser?.id || m.toId === currentUser?.id);
  
  // Show ALL patients for messaging
  const patientsWithMessages = (users || []).filter(u => u.role === 'patient');

  const getPatientName = (patientId) => {
    return (users || []).find(u => u.id === patientId)?.name || 'Unknown';
  };

  const filteredDoctorPrescriptions = (doctorPrescriptions || []).filter(pres => {
    const query = searchQuery.toLowerCase();
    const medicationNames = (pres.medications || []).map(m => m.name || '').join(' ').toLowerCase();
    return !searchQuery ||
      getPatientName(pres.patientId).toLowerCase().includes(query) ||
      medicationNames.includes(query) ||
      (pres.date || '').toLowerCase().includes(query);
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'doctor') {
      switch(currentUser.role) {
        case 'patient': navigate('/dashboard/patient'); break;
        case 'nurse': navigate('/dashboard/nurse'); break;
        case 'admin': navigate('/dashboard/admin'); break;
      }
    } else {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        specialty: currentUser.specialty || '',
        licenseNumber: currentUser.licenseNumber || '',
        experience: currentUser.experience || '',
        hospital: currentUser.hospital || ''
      });
    }
  }, [currentUser, navigate]);

  const handleViewAppointment = (apt) => {
    const patient = users.find(u => u.id === apt.patientId);
    setModalContent({
      title: 'Appointment Details',
      content: (
        <div className="modal-details">
          <p><strong>Patient:</strong> {apt.patientName}</p>
          <p><strong>Service:</strong> {apt.service}</p>
          <p><strong>Date:</strong> {apt.date}</p>
          <p><strong>Time:</strong> {apt.time}</p>
          <p><strong>Notes:</strong> {apt.notes || 'None'}</p>
          <p><strong>Phone:</strong> {patient?.phone || 'N/A'}</p>
          <p><strong>Status:</strong> <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span></p>
          {apt.price && <p><strong>Price:</strong> ${apt.price}</p>}
        </div>
      )
    });
    setShowModal(true);
  };

  const handleViewPrescription = (prescription) => {
    setModalContent({
      title: 'Prescription Details',
      content: (
        <div className="modal-details">
          <p><strong>Patient:</strong> {getPatientName(prescription.patientId)}</p>
          <p><strong>Date:</strong> {prescription.date}</p>
          <p><strong>Medications:</strong></p>
          <ul>
            {(prescription.medications || []).map((med, index) => (
              <li key={index}>{`${med.name} ${med.dosage} ${med.frequency} ${med.duration}`}</li>
            ))}
          </ul>
          <p><strong>Notes:</strong> {prescription.notes || 'None'}</p>
        </div>
      )
    });
    setShowModal(true);
  };

  const handleDeletePrescription = (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    deletePrescription(id);
    alert('Prescription deleted!');
  };

  const handleStartConsultation = (apt) => {
    const patient = users.find(u => u.id === apt.patientId);
    setModalContent({
      title: `Consultation with ${apt.patientName}`,
      content: (
        <div>
          <p><strong>Service:</strong> {apt.service}</p>
          <p><strong>Date:</strong> {apt.date}</p>
          <p><strong>Time:</strong> {apt.time}</p>
          <p><strong>Notes:</strong> {apt.notes || 'None'}</p>
          <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
            <button className="btn-primary" onClick={() => {
              setShowModal(false);
              const patient = users.find(u => u.id === apt.patientId);
              if (patient) {
                setSelectedPatient(patient);
                setShowChat(true);
              }
            }}>Message Patient</button>
            <button className="btn-primary" style={{background: '#4CAF50'}} onClick={() => {
              setShowModal(false);
              navigate(`/video-call/${apt.patientId}`);
            }}>📹 Video Call</button>
            <button className="btn-edit" onClick={() => {
              const patient = users.find(u => u.id === apt.patientId);
              if (patient) {
                setShowModal(false);
                setSelectedPatient(patient);
                setShowPrescriptionForm(true);
              }
            }}>Create Prescription</button>
            <button className="btn-view" onClick={() => {
              const patient = users.find(u => u.id === apt.patientId);
              if (patient) {
                setShowModal(false);
                setSelectedPatient(patient);
                setShowRecordForm(true);
              }
            }}>Add Medical Record</button>
            <button className="btn-start" onClick={() => {
              setShowModal(false);
              updateAppointment(apt.id, { status: 'In Progress' });
              alert('Consultation started!');
            }}>Start Consultation</button>
          </div>
        </div>
      )
    });
    setShowModal(true);
  };

  const handleAcceptAppointment = (id) => {
    updateAppointment(id, { status: 'Confirmed' });
    alert('Appointment accepted!');
  };

  const handleDeclineAppointment = (id) => {
    if (window.confirm('Are you sure you want to decline this appointment?')) {
      updateAppointment(id, { status: 'Cancelled' });
      alert('Appointment declined!');
    }
  };

  const handleCompleteAppointment = (id) => {
    updateAppointment(id, { status: 'Completed' });
    alert('Appointment marked as completed!');
  };

  const handleViewPatient = (patient) => {
    const patientAppointments = appointments.filter(a => a.patientId === patient.id && a.providerId === currentUser?.id);
    const patientRecords = medicalRecords.filter(r => r.patientId === patient.id);
    const patientPrescriptions = prescriptions.filter(p => p.patientId === patient.id);
    
    setModalContent({
      title: 'Patient Details',
      content: (
        <div className="patient-details-modal">
          <div className="patient-info-section">
            <h4>Personal Information</h4>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
            <p><strong>Date of Birth:</strong> {patient.dob || 'Not set'}</p>
            <p><strong>Address:</strong> {patient.address || 'Not set'}</p>
            <p><strong>Blood Type:</strong> {patient.bloodType || 'Not set'}</p>
            <p><strong>Allergies:</strong> {patient.allergies || 'None'}</p>
          </div>
          
          <div className="patient-info-section">
            <h4>Appointments ({patientAppointments.length})</h4>
            {patientAppointments.length > 0 ? (
              patientAppointments.slice(0, 3).map(apt => (
                <p key={apt.id}><strong>{apt.date}:</strong> {apt.service} - {apt.status}</p>
              ))
            ) : (
              <p>No appointments</p>
            )}
          </div>
          
          <div className="patient-info-section">
            <h4>Medical Records ({patientRecords.length})</h4>
            {patientRecords.length > 0 ? (
              patientRecords.slice(0, 3).map(rec => (
                <p key={rec.id}><strong>{rec.date}:</strong> {rec.title}</p>
              ))
            ) : (
              <p>No medical records</p>
            )}
          </div>
          
          <div className="patient-info-section">
            <h4>Prescriptions ({patientPrescriptions.length})</h4>
            {patientPrescriptions.length > 0 ? (
              patientPrescriptions.slice(0, 3).map(pres => (
                <p key={pres.id}><strong>{pres.date}:</strong> {pres.status}</p>
              ))
            ) : (
              <p>No prescriptions</p>
            )}
          </div>
          
          <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
            <button className="btn-primary" onClick={() => {
              setShowModal(false);
              setSelectedPatient(patient);
              setShowChat(true);
            }}>Message</button>
            <button className="btn-primary" style={{background: '#4CAF50'}} onClick={() => {
              setShowModal(false);
              navigate(`/video-call/${patient.id}`);
            }}>📹 Video Call</button>
            <button className="btn-edit" onClick={() => {
              setShowModal(false);
              setSelectedPatient(patient);
              setShowPrescriptionForm(true);
            }}>Create Prescription</button>
            <button className="btn-view" onClick={() => {
              setShowModal(false);
              setSelectedPatient(patient);
              setShowRecordForm(true);
            }}>Add Record</button>
          </div>
        </div>
      )
    });
    setShowModal(true);
  };

  // Handle prescription form
  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient || !prescriptionForm.medications.some(m => m.name.trim() !== '')) {
      alert('Please add at least one medication');
      return;
    }

    addPrescription({
      patientId: selectedPatient.id,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      medications: prescriptionForm.medications.filter(m => m.name !== ''),
      notes: prescriptionForm.notes
    });

    alert('Prescription created successfully!');
    setShowPrescriptionForm(false);
    setPrescriptionForm({ medications: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: '' });
    setSelectedPatient(null);
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...prescriptionForm.medications];
    newMedications[index][field] = value;
    setPrescriptionForm({ ...prescriptionForm, medications: newMedications });
  };

  const addMedicationField = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [...prescriptionForm.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedicationField = (index) => {
    if (prescriptionForm.medications.length > 1) {
      const newMedications = prescriptionForm.medications.filter((_, i) => i !== index);
      setPrescriptionForm({ ...prescriptionForm, medications: newMedications });
    }
  };

  // Handle medical record form
  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient || !recordForm.title || !recordForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    addMedicalRecord({
      patientId: selectedPatient.id,
      doctor: currentUser.name,
      title: recordForm.title,
      type: recordForm.type,
      content: recordForm.content
    });

    alert('Medical record added successfully!');
    setShowRecordForm(false);
    setRecordForm({ title: '', type: 'Checkup', content: '' });
    setSelectedPatient(null);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedPatient) return;

    sendMessage({
      fromId: currentUser.id,
      fromName: currentUser.name,
      toId: selectedPatient.id,
      message: chatMessage.trim()
    });

    setChatMessage('');
  };

  const handleStartChat = (patient) => {
    setSelectedPatient(patient);
    setShowChat(true);
  };


  const handleLogout = () => {
    try {
      logout();
      localStorage.removeItem('currentUser');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('currentUser');
      navigate('/login');
    }
  };

  // Filter functions
  const filteredAppointments = doctorAppointments.filter(apt => {
    if (statusFilter && apt.status !== statusFilter) return false;
    if (searchQuery && !apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredPatients = uniquePatients.filter(p => {
    if (searchQuery && !p.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!currentUser) {
    return <div className="loading">Loading...</div>;
  }

  // Render prescription form modal
  if (showPrescriptionForm && selectedPatient) {
    return (
      <div className="dashboard">
        <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h2>HomeCare</h2>
            <p>Doctor Portal</p>
          </div>
        </aside>
        <main className="dashboard-content">
          <div className="form-modal">
            <h2>Create Prescription for {selectedPatient.name}</h2>
            <form onSubmit={handlePrescriptionSubmit}>
              <div className="medications-section">
                <h3>Medications</h3>
                {prescriptionForm.medications.map((med, index) => (
                  <div key={index} className="medication-row">
                    <input
                      type="text"
                      placeholder="Medication name"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g., 500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Frequency (e.g., 2x daily)"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g., 7 days)"
                      value={med.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    />
                    {prescriptionForm.medications.length > 1 && (
                      <button type="button" className="btn-remove" onClick={() => removeMedicationField(index)}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={addMedicationField}>+ Add Medication</button>
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={prescriptionForm.notes}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                  placeholder="Additional instructions..."
                  rows="3"
                ></textarea>
              </div>
              
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="submit" className="btn-submit">Create Prescription</button>
                <button type="button" className="btn-cancel" onClick={() => { setShowPrescriptionForm(false); setSelectedPatient(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Render medical record form modal
  if (showRecordForm && selectedPatient) {
    return (
      <div className="dashboard">
        <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h2>HomeCare</h2>
            <p>Doctor Portal</p>
          </div>
        </aside>
        <main className="dashboard-content">
          <div className="form-modal">
            <h2>Add Medical Record for {selectedPatient.name}</h2>
            <form onSubmit={handleRecordSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={recordForm.title}
                  onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                  placeholder="e.g., Annual Checkup"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <select
                  value={recordForm.type}
                  onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })}
                >
                  <option value="Checkup">Checkup</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Diagnosis">Diagnosis</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Details</label>
                <textarea
                  value={recordForm.content}
                  onChange={(e) => setRecordForm({ ...recordForm, content: e.target.value })}
                  placeholder="Enter medical details..."
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="submit" className="btn-submit">Add Record</button>
                <button type="button" className="btn-cancel" onClick={() => { setShowRecordForm(false); setSelectedPatient(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const renderContent = () => {
    console.log("renderContent called", { activeTab, showChat, selectedPatient, currentUser });
    if (showChat && selectedPatient) {
      const conversation = getConversation(currentUser.id, selectedPatient.id);
      
      return (
        <div className="whatsapp-chat">
          <div className="whatsapp-header">
            <button className="back-button" onClick={() => setShowChat(false)}>←</button>
            <div className="chat-avatar-large">{selectedPatient.name.charAt(0)}</div>
            <div className="chat-info">
              <h3>{selectedPatient.name}</h3>
              <span className="online-status">● Online</span>
            </div>
          </div>
          
          <div className="whatsapp-messages">
            {conversation.length > 0 ? (
              conversation.map(msg => {
                const sender = users.find(u => u.id === msg.fromId);
                const isFromPatient = sender?.role === 'patient';
                return (
                  <div key={msg.id} className={`whatsapp-message ${isFromPatient ? 'received' : 'sent'}`}>
                    <div className="message-bubble">
                      <p>{msg.message}</p>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-messages">
                <p>💬 Start a conversation with {selectedPatient.name}</p>
              </div>
            )}
          </div>
          
          <form className="whatsapp-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <button type="submit" className="send-button">➤</button>
          </form>
        </div>
      );
    }

    switch(activeTab) {
      case 'overview':
        return (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <h3>Today's Appointments</h3>
                <p className="stat-number">{doctorAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Patients</h3>
                <p className="stat-number">{uniquePatients.length}</p>
              </div>
              <div className="stat-card">
                <h3>Pending Requests</h3>
                <p className="stat-number">{doctorAppointments.filter(a => a.status === 'Pending').length}</p>
              </div>
              <div className="stat-card">
                <h3>Completed This Month</h3>
                <p className="stat-number">{doctorAppointments.filter(a => a.status === 'Completed').length}</p>
              </div>
            </section>

            <section>
              <h2>Today's Schedule</h2>
              {doctorAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length > 0 ? (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Service</th>
                      <th>Notes</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).map(apt => (
                      <tr key={apt.id}>
                        <td>{apt.time}</td>
                        <td>{apt.patientName}</td>
                        <td>{apt.service}</td>
                        <td>{apt.notes || '-'}</td>
                        <td>
                          <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                        </td>
                        <td>
                          <button className="btn-start" onClick={() => handleStartConsultation(apt)}>Start</button>
                          <button className="btn-view" onClick={() => handleViewAppointment(apt)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No appointments scheduled for today</p>
              )}
            </section>

            <section>
              <h2>Recent Messages</h2>
              {patientsWithMessages.length > 0 ? (
                <div className="cards-grid">
                  {patientsWithMessages.slice(0, 4).map(patient => {
                    const lastMsg = [...getConversation(currentUser.id, patient.id)].pop();
                    const unread = getConversation(currentUser.id, patient.id).filter(m => m.toId === currentUser.id && !m.read).length;
                    return (
                      <div key={patient.id} className="message-card" onClick={() => handleStartChat(patient)}>
                        <div className="message-card-avatar">{patient.name.charAt(0)}</div>
                        <div className="message-card-content">
                          <h4>{patient.name}</h4>
                          <p>{lastMsg?.message?.substring(0, 40) || 'No messages'}...</p>
                          {unread > 0 && <span className="unread-badge">{unread}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-data">No messages yet</p>
              )}
              <Link to="/messages" className="btn-primary" style={{marginTop: '1rem', display: 'inline-block'}}>View All Messages</Link>
            </section>

            <section>
              <h2>Recent Notifications</h2>
              {userNotifications.length > 0 ? (
                userNotifications.slice(0, 5).map(notif => (
                  <div key={notif.id} className="notification-item">
                    <div className="notification-icon">
                      {notif.type === 'appointment' ? '📅' : notif.type === 'prescription' ? '💊' : '💬'}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notif.title}</div>
                      <div>{notif.message}</div>
                      <div className="notification-time">{notif.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No notifications</p>
              )}
            </section>
          </>
        );

      case 'appointments':
        return (
          <section>
            <h2>All Appointments</h2>
            <div className="search-filter">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search appointments..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            {filteredAppointments.length > 0 ? (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.date}</td>
                      <td>{apt.time}</td>
                      <td>{apt.patientName}</td>
                      <td>{apt.service}</td>
                      <td>
                        <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                      </td>
                      <td>
                        <button className="btn-view" onClick={() => handleViewAppointment(apt)}>View</button>
                        {apt.status === 'Pending' && (
                          <>
                            <button className="btn-edit" onClick={() => handleAcceptAppointment(apt.id)}>Accept</button>
                            <button className="btn-cancel" onClick={() => handleDeclineAppointment(apt.id)}>Decline</button>
                          </>
                        )}
                        {apt.status === 'Confirmed' && (
                          <button className="btn-start" onClick={() => handleCompleteAppointment(apt.id)}>Complete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No appointments found</p>
            )}
          </section>
        );

      case 'patients':
        return (
          <section>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2>My Patients</h2>
            </div>
            <div className="search-filter">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search patients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {filteredPatients.length > 0 ? (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Last Visit</th>
                    <th>Last Service</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(patient => (
                    <tr key={patient.id}>
                      <td>{patient.name}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.lastAppointment || 'N/A'}</td>
                      <td>{patient.lastService || 'N/A'}</td>
                      <td>
                        <button className="btn-view" onClick={() => handleViewPatient(patient)}>View</button>
                        <button className="btn-edit" onClick={() => handleStartChat(patient)}>Message</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No patients found</p>
            )}
          </section>
        );

      case 'messages':
        return (
          <section>
            <h2>Patient Messages</h2>
            <p>Chat with your patients</p>
            <Link to="/messages" className="btn-primary" style={{display: 'inline-block', padding: '12px 24px', background: '#4a90e2', color: 'white', textDecoration: 'none', borderRadius: '8px'}}>
              Open Messages
            </Link>
            
            <h3 style={{marginTop: '2rem'}}>Recent Conversations</h3>
            {patientsWithMessages.length > 0 ? (
              <div className="cards-grid">
                {patientsWithMessages.map(patient => {
                  const lastMsg = [...getConversation(currentUser.id, patient.id)].pop();
                  const unread = getConversation(currentUser.id, patient.id).filter(m => m.toId === currentUser.id && !m.read).length;
                  return (
                    <div key={patient.id} className="card-item" onClick={() => handleStartChat(patient)}>
                      <div className="provider-avatar" style={{fontSize: '2rem'}}>{patient.name.charAt(0)}</div>
                      <h3>{patient.name}</h3>
                      <p><strong>Last message:</strong> {lastMsg?.message?.substring(0, 30) || 'No messages'}...</p>
                      {unread > 0 && <span className="badge" style={{position: 'absolute', top: '10px', right: '10px'}}>{unread}</span>}
                      <button className="btn-primary" style={{marginTop: '1rem'}}>Reply</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">No conversations yet</p>
            )}
          </section>
        );

      case 'schedule':
        return (
          <section>
            <h2>My Schedule</h2>
            <div className="cards-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="card-item">
                  <h3>{day}</h3>
                  <p>9:00 AM - 12:00 PM</p>
                  {day !== 'Sat' && day !== 'Sun' && <p>2:00 PM - 5:00 PM</p>}
                  {day === 'Sat' && <p>10:00 AM - 1:00 PM</p>}
                  {day === 'Sun' && <p>Off</p>}
                </div>
              ))}
            </div>
          </section>
        );

      case 'profile':
        return (
          <div className="profile-section">
            <div className="profile-card">
              <div className="profile-avatar">{currentUser.name?.charAt(0) || 'D'}</div>
              <h3>{currentUser.name}</h3>
              <p>{currentUser.specialty}</p>
              <p>{currentUser.email}</p>
              <div style={{marginTop: '1rem', color: '#f39c12'}}>⭐⭐⭐⭐⭐ {currentUser.rating || 'New'} Rating</div>
            </div>
            <div className="profile-info">
              <h3>Professional Information</h3>
              {editingProfile ? (
                <form onSubmit={(e) => { e.preventDefault(); setEditingProfile(false); alert('Profile updated!'); }}>
                  <div className="info-row">
                    <span className="info-label">Full Name</span>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Specialty</span>
                    <input type="text" value={profileForm.specialty} onChange={(e) => setProfileForm({...profileForm, specialty: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">License Number</span>
                    <input type="text" value={profileForm.licenseNumber} onChange={(e) => setProfileForm({...profileForm, licenseNumber: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Experience</span>
                    <input type="text" value={profileForm.experience} onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Hospital</span>
                    <input type="text" value={profileForm.hospital} onChange={(e) => setProfileForm({...profileForm, hospital: e.target.value})} />
                  </div>
                  <button type="submit" className="btn-edit" style={{marginTop: '1rem'}}>Save Profile</button>
                  <button type="button" className="btn-cancel" style={{marginTop: '1rem', marginLeft: '0.5rem'}} onClick={() => setEditingProfile(false)}>Cancel</button>
                </form>
              ) : (
                <>
                  <div className="info-row">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{currentUser.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Specialty</span>
                    <span className="info-value">{currentUser.specialty}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{currentUser.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{currentUser.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">License Number</span>
                    <span className="info-value">{currentUser.licenseNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Experience</span>
                    <span className="info-value">{currentUser.experience}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Hospital Affiliation</span>
                    <span className="info-value">{currentUser.hospital}</span>
                  </div>
                  <button className="btn-edit" style={{marginTop: '1rem'}} onClick={() => setEditingProfile(true)}>Edit Profile</button>
                </>
              )}
            </div>
          </div>
        );

      case 'prescriptions':
        return (
          <section>
            <h2>My Prescriptions</h2>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <div className="search-filter">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search prescriptions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

                <button className="btn-primary" onClick={() => {
                  setSelectedPatient(uniquePatients[0] || null);
                  setPrescriptionForm({ medications: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: '' });
                  setShowPrescriptionForm(true);
                }}>
                  + New Prescription
                </button>

            </div>
            

            {/* Prescription Form */}
            {showPrescriptionForm && selectedPatient && (
              <div className="form-section">
                <h3>Create New Prescription for {selectedPatient.name}</h3>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!prescriptionForm.medications[0].name.trim()) {
                    alert('Medication name is required');
                    return;
                  }
                  addPrescription({
                    patientId: selectedPatient.id,
                    doctorId: currentUser.id,
                    doctorName: currentUser.name,
                    medications: prescriptionForm.medications.filter(m => m.name.trim() !== ''),
                    notes: prescriptionForm.notes
                  });
                  alert('Prescription created!');
                  setSelectedPatient(null);
                  setPrescriptionForm({ medications: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: '' });
                }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient</label>
                      <select 
                        value={selectedPatient?.id || ''} 
                        onChange={(e) => setSelectedPatient(uniquePatients.find(p => p.id == e.target.value))}
                        required
                      >
                        <option value="">Select Patient</option>
                        {uniquePatients.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Medication</label>
                      <input 
                        type="text" 
                        value={prescriptionForm.medications[0].name}
                        onChange={(e) => {
                          const newMeds = [...prescriptionForm.medications];
                          newMeds[0].name = e.target.value;
                          setPrescriptionForm({...prescriptionForm, medications: newMeds});
                        }}
                        placeholder="e.g., Paracetamol"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Dosage</label>
                      <input 
                        type="text" 
                        value={prescriptionForm.medications[0].dosage}
                        onChange={(e) => {
                          const newMeds = [...prescriptionForm.medications];
                          newMeds[0].dosage = e.target.value;
                          setPrescriptionForm({...prescriptionForm, medications: newMeds});
                        }}
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Frequency</label>
                      <input 
                        type="text" 
                        value={prescriptionForm.medications[0].frequency}
                        onChange={(e) => {
                          const newMeds = [...prescriptionForm.medications];
                          newMeds[0].frequency = e.target.value;
                          setPrescriptionForm({...prescriptionForm, medications: newMeds});
                        }}
                        placeholder="e.g., twice daily"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Duration</label>
                      <input 
                        type="text" 
                        value={prescriptionForm.medications[0].duration}
                        onChange={(e) => {
                          const newMeds = [...prescriptionForm.medications];
                          newMeds[0].duration = e.target.value;
                          setPrescriptionForm({...prescriptionForm, medications: newMeds});
                        }}
                        placeholder="e.g., 5 days"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea 
                        value={prescriptionForm.notes}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                        placeholder="Additional instructions (optional)"
                        rows="2"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-submit">Create Prescription</button>
                  <button type="button" className="btn-cancel" onClick={() => setSelectedPatient(null)}>Cancel</button>
                </form>
              </div>
            )}

            {/* Prescriptions List */}
            <h3>Prescription History ({doctorPrescriptions.length})</h3>
            {doctorPrescriptions.length > 0 ? (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctorPrescriptions.map(pres => (
                    <tr key={pres.id}>
                      <td>{getPatientName(pres.patientId)}</td>
                      <td>{(pres.medications || []).map(m => m.name).join(', ') || pres.medication || '-'}</td>
                      <td>{(pres.medications || [])[0]?.dosage || pres.dosage || '-'}</td>
                      <td>{pres.date}</td>
                      <td>
                        <button className="btn-view" onClick={() => handleViewPrescription(pres)}>View</button>
                        <button className="btn-delete" onClick={() => handleDeletePrescription(pres.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No prescriptions created yet</p>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>
      
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>HomeCare</h2>
          <p>Doctor Portal</p>
        </div>
        <nav className="sidebar-nav">
          <a href="#overview" className={activeTab === 'overview' ? 'active' : ''} onClick={() => {setActiveTab('overview'); setSidebarOpen(false);}}>Dashboard</a>
          <a href="#appointments" className={activeTab === 'appointments' ? 'active' : ''} onClick={() => {setActiveTab('appointments'); setSidebarOpen(false);}}>My Appointments</a>
          <a href="#patients" className={activeTab === 'patients' ? 'active' : ''} onClick={() => {setActiveTab('patients'); setSidebarOpen(false);}}>My Patients</a>
          <a href="#messages" className={activeTab === 'messages' ? 'active' : ''} onClick={() => {setActiveTab('messages'); setSidebarOpen(false);}}>Messages</a>
          <a href="#schedule" className={activeTab === 'schedule' ? 'active' : ''} onClick={() => {setActiveTab('schedule'); setSidebarOpen(false);}}>My Schedule</a>
          <a href="#profile" className={activeTab === 'profile' ? 'active' : ''} onClick={() => {setActiveTab('profile'); setSidebarOpen(false);}}>My Profile</a>
          <a href="#prescriptions" className={activeTab === 'prescriptions' ? 'active' : ''} onClick={() => {setActiveTab('prescriptions'); setSidebarOpen(false);}}>💊 Prescriptions</a>
<button className="sidebar-logout" onClick={() => {handleLogout(); setSidebarOpen(false);}}>Logout</button>
        </nav>
      </aside>

      <main className="dashboard-content">

        <header className="dashboard-header">
          <h1>Welcome, {currentUser?.name || 'Doctor'}!</h1>
        </header>

        {renderContent()}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalContent.title}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {modalContent.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
