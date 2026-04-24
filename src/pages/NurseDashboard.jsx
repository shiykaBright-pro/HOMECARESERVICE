import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function NurseDashboard() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, users, appointments, notifications, messages, sendMessage, getConversation, updateAppointment, logout } = useApp();
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
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Get appointments for this nurse
  const nurseAppointments = appointments.filter(apt => apt.providerId === currentUser?.id);
  
  // Get patients who have appointments with this nurse
  const patientIds = [...new Set(nurseAppointments.map(apt => apt.patientId))];
  
  // Get nurse's appointments patients
  const nursePatients = nurseAppointments.map(apt => ({
    ...users.find(u => u.id === apt.patientId),
    lastAppointment: apt.date,
    lastService: apt.service,
    appointmentId: apt.id
  })).filter(p => p.id);

  // Get unique patients
  const uniquePatients = [...new Map(nursePatients.map(p => [p.id, p])).values()];
  
  // Get user's notifications
  const userNotifications = notifications.filter(notif => notif.userId === currentUser?.id);

  // Get messages for this nurse
  const nurseMessages = messages.filter(m => m.fromId === currentUser?.id || m.toId === currentUser?.id);
  
  // Get patients who messaged this nurse
  const messagedPatientIds = [...new Set([
    ...nurseMessages.filter(m => m.fromId === currentUser?.id).map(m => m.toId),
    ...nurseMessages.filter(m => m.toId === currentUser?.id).map(m => m.fromId)
  ])];
  
  // Show ALL patients for messaging (not just those with existing messages)
  const patientsWithMessages = users.filter(u => u.role === 'patient');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'nurse') {
      switch(currentUser.role) {
        case 'patient': navigate('/dashboard/patient'); break;
        case 'doctor': navigate('/dashboard/doctor'); break;
        case 'admin': navigate('/dashboard/admin'); break;
      }
    }
  }, [currentUser, navigate]);

  // Load profile data from Supabase or fallback to currentUser
  useEffect(() => {
    if (!currentUser) return;
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError('');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setProfileForm({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            specialization: currentUser.specialization || '',
            licenseNumber: currentUser.licenseNumber || '',
            experience: currentUser.experience || ''
          });
          setProfileLoading(false);
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Error fetching profile:', profileError);
        }
        setProfileForm({
          name: profile?.name || currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          specialization: profile?.specialty || currentUser.specialization || '',
          licenseNumber: profile?.license || currentUser.licenseNumber || '',
          experience: currentUser.experience || ''
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        setProfileError('Failed to load profile data');
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [currentUser]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileError('Name is required');
      return;
    }
    if (!profileForm.licenseNumber.trim()) {
      setProfileError('License number is required');
      return;
    }
    try {
      setProfileSaving(true);
      setProfileError('');
      setProfileSuccess('');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!authError && user) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: profileForm.name.trim(),
            email: currentUser.email,
            role: currentUser.role,
            license: profileForm.licenseNumber.trim() || null,
            specialty: profileForm.specialization.trim() || null
          });
        if (upsertError) {
          console.error('Supabase upsert error:', upsertError);
          setProfileError(`Database error: ${upsertError.message}`);
          setProfileSaving(false);
          return;
        }
      }
      const updatedUser = {
        ...currentUser,
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        specialization: profileForm.specialization.trim(),
        licenseNumber: profileForm.licenseNumber.trim(),
        experience: profileForm.experience.trim()
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setProfileSuccess('Profile updated successfully!');
      setEditingProfile(false);
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

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

  const handleStartVisit = (apt) => {
    const patient = users.find(u => apt.patientId);
    setModalContent({
      title: `Visit with ${apt.patientName}`,
      content: (
        <div>
          <p><strong>Service:</strong> {apt.service}</p>
          <p><strong>Date:</strong> {apt.date}</p>
          <p><strong>Time:</strong> {apt.time}</p>
          <p><strong>Notes:</strong> {apt.notes || 'None'}</p>
          <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
            <button className="btn-primary" onClick={() => {
              setShowModal(false);
              const patient = users.find(u => u.id === apt.patientId);
              if (patient) {
                setSelectedPatient(patient);
                setShowChat(true);
              }
            }}>Message Patient</button>
            <button className="btn-edit" onClick={() => {
              setShowModal(false);
              updateAppointment(apt.id, { status: 'In Progress' });
              alert('Visit started!');
            }}>Start Visit</button>
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
            <h4>Visits ({patientAppointments.length})</h4>
            {patientAppointments.length > 0 ? (
              patientAppointments.slice(0, 3).map(apt => (
                <p key={apt.id}><strong>{apt.date}:</strong> {apt.service} - {apt.status}</p>
              ))
            ) : (
              <p>No visits</p>
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
            <button className="btn-view" onClick={() => {
              setShowModal(false);
              alert('Medical record upload feature coming soon!');
            }}>Add Record</button>
          </div>
        </div>
      )
    });
    setShowModal(true);
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

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('currentUser');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  // Filter functions
  const filteredAppointments = nurseAppointments.filter(apt => {
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

  const renderContent = () => {
    if (showChat && selectedPatient) {
      const conversation = getConversation(currentUser.id, selectedPatient.id);
      
      return (
        <div className="chat-view">
          <div className="chat-header">
            <button className="btn-back" onClick={() => setShowChat(false)}>Back</button>
            <div className="chat-user-info">
              <div className="chat-avatar">{selectedPatient.name.charAt(0)}</div>
              <div>
                <h3>{selectedPatient.name}</h3>
                <span>Patient</span>
              </div>
            </div>
          </div>
          
          <div className="chat-messages">
            {conversation.length > 0 ? (
              conversation.map(msg => {
                // Patient messages always on LEFT, Nurse messages always on RIGHT
                const sender = users.find(u => u.id === msg.fromId);
                const isFromPatient = sender?.role === 'patient';
                return (
                  <div key={msg.id} className={`message ${isFromPatient ? 'received' : 'sent'}`}>
                    <div className="message-content">
                      <p>{msg.message}</p>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>
          
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <button type="submit" className="btn-send">Send</button>
          </form>
        </div>
      );
    }

    switch(activeTab) {
      case 'overview':
        return (
          <div>
            <section className="stats-grid">
              <div className="stat-card">
                <h3>Today&apos;s Visits</h3>
                <p className="stat-number">{nurseAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Patients</h3>
                <p className="stat-number">{uniquePatients.length}</p>
              </div>
              <div className="stat-card">
                <h3>Pending Requests</h3>
                <p className="stat-number">{nurseAppointments.filter(a => a.status === 'Pending').length}</p>
              </div>
              <div className="stat-card">
                <h3>Completed This Month</h3>
                <p className="stat-number">{nurseAppointments.filter(a => a.status === 'Completed').length}</p>
              </div>
            </section>

            <section>
              <h2>Today&apos;s Schedule</h2>
              {nurseAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length > 0 ? (
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
                    {nurseAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).map(apt => (
                      <tr key={apt.id}>
                        <td>{apt.time}</td>
                        <td>{apt.patientName}</td>
                        <td>{apt.service}</td>
                        <td>{apt.notes || '-'}</td>
                        <td>
                          <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                        </td>
                        <td>
                          <button className="btn-start" onClick={() => handleStartVisit(apt)}>Start</button>
                          <button className="btn-view" onClick={() => handleViewAppointment(apt)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No visits scheduled for today</p>
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
          </div>
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
                        {apt.patientId && (
                          <button className="btn-video" onClick={() => navigate(`/video-call/${apt.patientId}`)} style={{marginLeft: '0.5rem'}}>
                            📹
                          </button>
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
                  <p>8:00 AM - 4:00 PM</p>
                  {day === 'Fri' && <p>8:00 AM - 2:00 PM</p>}
                  {(day === 'Sat' || day === 'Sun') && <p>Off</p>}
                </div>
              ))}
            </div>
          </section>
        );

      case 'profile':
        return (
          <div className="profile-section">
            <div className="profile-card">
              <div className="profile-avatar">{currentUser.name?.charAt(0) || 'N'}</div>
              <h3>{currentUser.name}</h3>
              <p>Nurse</p>
              <p>{currentUser.email}</p>
              <div style={{marginTop: '1rem', color: '#f39c12'}}>Rating: {currentUser.rating || 'New'}</div>
            </div>
            <div className="profile-info">
              <h3>Professional Information</h3>
              {profileError && <div className="error-message" style={{marginBottom: '1rem'}}>{profileError}</div>}
              {profileSuccess && <div className="success-message" style={{marginBottom: '1rem'}}>{profileSuccess}</div>}
              {profileLoading ? (
                <div className="loading">Loading profile...</div>
              ) : editingProfile ? (
                <form onSubmit={handleProfileSubmit}>
                  <div className="info-row">
                    <span className="info-label">Full Name *</span>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} required />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <input type="email" value={profileForm.email} readOnly style={{background: '#f5f5f5'}} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Specialization *</span>
                    <input type="text" value={profileForm.specialization} onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})} required />
                  </div>
                  <div className="info-row">
                    <span className="info-label">License Number *</span>
                    <input type="text" value={profileForm.licenseNumber} onChange={(e) => setProfileForm({...profileForm, licenseNumber: e.target.value})} required />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Experience</span>
                    <input type="text" value={profileForm.experience} onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})} />
                  </div>
                  <button type="submit" className="btn-edit" style={{marginTop: '1rem'}} disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button type="button" className="btn-cancel" style={{marginTop: '1rem', marginLeft: '0.5rem'}} onClick={() => setEditingProfile(false)} disabled={profileSaving}>Cancel</button>
                </form>
              ) : (
                <>
                  <div className="info-row">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{currentUser.name || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Specialization</span>
                    <span className="info-value">{currentUser.specialization || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{currentUser.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{currentUser.phone || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">License Number</span>
                    <span className="info-value">{currentUser.licenseNumber || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Experience</span>
                    <span className="info-value">{currentUser.experience || 'Not set'}</span>
                  </div>
                  <button className="btn-edit" style={{marginTop: '1rem'}} onClick={() => setEditingProfile(true)}>Edit Profile</button>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        Menu
      </button>
      
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>HomeCare</h2>
          <p>Nurse Portal</p>
        </div>
        <nav className="sidebar-nav">
          <a href="#overview" className={activeTab === 'overview' ? 'active' : ''} onClick={() => {setActiveTab('overview'); setSidebarOpen(false);}}>Dashboard</a>
          <a href="#appointments" className={activeTab === 'appointments' ? 'active' : ''} onClick={() => {setActiveTab('appointments'); setSidebarOpen(false);}}>My Appointments</a>
          <a href="#patients" className={activeTab === 'patients' ? 'active' : ''} onClick={() => {setActiveTab('patients'); setSidebarOpen(false);}}>Patient List</a>
          <a href="#messages" className={activeTab === 'messages' ? 'active' : ''} onClick={() => {setActiveTab('messages'); setSidebarOpen(false);}}>Messages</a>
          <a href="#schedule" className={activeTab === 'schedule' ? 'active' : ''} onClick={() => {setActiveTab('schedule'); setSidebarOpen(false);}}>My Schedule</a>
          <a href="#profile" className={activeTab === 'profile' ? 'active' : ''} onClick={() => {setActiveTab('profile'); setSidebarOpen(false);}}>My Profile</a>
<button className="sidebar-logout" onClick={() => {handleLogout(); setSidebarOpen(false);}}>Logout</button>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome, {currentUser?.name || 'User'}!</h1>
        </header>
        {renderContent()}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalContent.title}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
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

export default NurseDashboard;
