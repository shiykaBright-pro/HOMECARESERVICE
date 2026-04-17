import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Dashboard.css';

function PatientDashboard() {
  const navigate = useNavigate();
  const { currentUser, users, appointments, medicalRecords, prescriptions, notifications, addAppointment, cancelAppointment, logout } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBooking, setShowBooking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [recordFilter, setRecordFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  // Get user's appointments
  const userAppointments = appointments.filter(apt => apt.patientId === currentUser?.id);
  
  // Get user's medical records
  const userMedicalRecords = medicalRecords.filter(rec => rec.patientId === currentUser?.id);
  
  // Get user's prescriptions
  const userPrescriptions = prescriptions.filter(pres => pres.patientId === currentUser?.id);
  
  // Get user's notifications
  const userNotifications = notifications.filter(notif => notif.userId === currentUser?.id);
  
  // Get available doctors
  const doctors = users.filter(u => u.role === 'doctor');

  useEffect(() => {
    setProfileForm({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      dob: currentUser.dob || '',
      address: currentUser.address || '',
      bloodType: currentUser.bloodType || '',
      allergies: currentUser.allergies || '',
      emergencyContact: currentUser.emergencyContact?.name || '',
      emergencyPhone: currentUser.emergencyContact?.phone || '',
      emergencyRelation: currentUser.emergencyContact?.relation || ''
    });
  }, [currentUser]);

  const [bookingForm, setBookingForm] = useState({
    service: '',
    providerId: '',
    date: '',
    time: '',
    notes: ''
  });

  const servicePrices = {
    'General Consultation': 50,
    'Nursing Care': 40,
    'Physical Therapy': 60,
    'Medical Tests': 30,
    'Elderly Care': 80,
    'Post-Surgery Care': 70
  };

  const handleBookingChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.service || !bookingForm.date || !bookingForm.time) {
      alert('Please fill in all required fields');
      return;
    }

    const provider = users.find(u => u.id === parseInt(bookingForm.providerId));
    const newAppointment = {
      patientId: currentUser.id,
      patientName: currentUser.name,
      providerId: parseInt(bookingForm.providerId),
      providerName: provider?.name || 'To be assigned',
      service: bookingForm.service,
      date: bookingForm.date,
      time: bookingForm.time,
      notes: bookingForm.notes,
      type: 'home',
      price: servicePrices[bookingForm.service] || 50
    };

    addAppointment(newAppointment);
    alert('Appointment request submitted successfully!');
    setShowBooking(false);
    setBookingForm({ service: '', providerId: '', date: '', time: '', notes: '' });
    setActiveTab('appointments');
  };

  const handleViewAppointment = (apt) => {
    setModalContent({
      title: 'Appointment Details',
      content: (
        <div className="modal-details">
          <p><strong>Service:</strong> {apt.service}</p>
          <p><strong>Provider:</strong> {apt.providerName}</p>
          <p><strong>Date:</strong> {apt.date}</p>
          <p><strong>Time:</strong> {apt.time}</p>
          <p><strong>Status:</strong> <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span></p>
          <p><strong>Type:</strong> {apt.type === 'home' ? 'Home Visit' : 'Clinic'}</p>
          {apt.notes && <p><strong>Notes:</strong> {apt.notes}</p>}
          {apt.price && <p><strong>Price:</strong> ${apt.price}</p>}
        </div>
      )
    });
    setShowModal(true);
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointment(id);
      alert('Appointment cancelled successfully!');
    }
  };

  const handleBookDoctor = (doc) => {
    setBookingForm({ ...bookingForm, service: doc.specialty || 'General Consultation', providerId: doc.id });
    setShowBooking(true);
    setActiveTab('overview');
  };

  const handleViewRecord = (record) => {
    setModalContent({
      title: record.title,
      content: (
        <div className="modal-details">
          <p><strong>Title:</strong> {record.title}</p>
          <p><strong>Date:</strong> {record.date}</p>
          <p><strong>Doctor:</strong> {record.doctor}</p>
          <p><strong>Type:</strong> {record.type}</p>
          {record.content && <p><strong>Details:</strong> {record.content}</p>}
        </div>
      )
    });
    setShowModal(true);
  };

  const handleViewPrescription = (prescription) => {
    const provider = users.find(u => u.id === prescription.provider_id);
    setModalContent({
      title: `Prescription from ${provider?.name || 'Provider'}`,
      content: (
        <div className="modal-details">
          <p><strong>Date:</strong> {prescription.created_at ? new Date(prescription.created_at).toLocaleDateString() : 'Recent'}</p>
          <p><strong>Provider:</strong> {provider?.name || 'Unknown'}</p>
          <div className="medication-item">
            <p><strong>Medication:</strong> {prescription.medication}</p>
            <p><strong>Dosage:</strong> {prescription.dosage}</p>
            <p><strong>Instructions:</strong> {prescription.instructions}</p>
          </div>
        </div>
      )
    });
    setShowModal(true);
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter functions
  const filteredAppointments = userAppointments.filter(apt => {
    if (statusFilter && apt.status !== statusFilter) return false;
    if (searchQuery && !apt.service.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredRecords = userMedicalRecords.filter(rec => {
    if (recordFilter && rec.type !== recordFilter) return false;
    if (searchQuery && !rec.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredDoctors = doctors.filter(doc => {
    if (specialtyFilter && doc.specialty !== specialtyFilter) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!currentUser) {
    return <div className="loading">Loading...</div>;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <h3>Total Appointments</h3>
                <p className="stat-number">{userAppointments.length}</p>
              </div>
              <div className="stat-card">
                <h3>Confirmed</h3>
                <p className="stat-number">{userAppointments.filter(a => a.status === 'Confirmed').length}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-number">{userAppointments.filter(a => a.status === 'Pending').length}</p>
              </div>
              <div className="stat-card">
                <h3>Medical Records</h3>
                <p className="stat-number">{userMedicalRecords.length}</p>
              </div>
            </section>

            <section>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h2>Upcoming Appointments</h2>
                <button className="btn-book" onClick={() => setShowBooking(!showBooking)}>
                  {showBooking ? 'Cancel' : '+ Book New'}
                </button>
              </div>
              
              {showBooking && (
                <div className="booking-form-section">
                  <h3>Book New Appointment</h3>
                  <form onSubmit={handleBookingSubmit} className="booking-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Select Doctor/Nurse</label>
                        <select name="providerId" value={bookingForm.providerId} onChange={handleBookingChange} required>
                          <option value="">Select Provider</option>
                          {users.filter(u => u.role === 'doctor' || u.role === 'nurse').map(provider => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name} - {provider.role === 'doctor' ? provider.specialty : 'Nurse'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Service Type</label>
                        <select name="service" value={bookingForm.service} onChange={handleBookingChange} required>
                          <option value="">Select Service</option>
                          <option value="General Consultation">General Consultation ($50)</option>
                          <option value="Nursing Care">Nursing Care ($40)</option>
                          <option value="Physical Therapy">Physical Therapy ($60)</option>
                          <option value="Medical Tests">Medical Tests ($30)</option>
                          <option value="Elderly Care">Elderly Care ($80)</option>
                          <option value="Post-Surgery Care">Post-Surgery Care ($70)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Preferred Date</label>
                        <input type="date" name="date" value={bookingForm.date} onChange={handleBookingChange} required min={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-group">
                        <label>Preferred Time</label>
                        <select name="time" value={bookingForm.time} onChange={handleBookingChange} required>
                          <option value="">Select Time</option>
                          <option value="9:00 AM">Morning (9AM - 12PM)</option>
                          <option value="12:00 PM">Afternoon (12PM - 4PM)</option>
                          <option value="4:00 PM">Evening (4PM - 7PM)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Additional Notes</label>
                      <textarea name="notes" value={bookingForm.notes} onChange={handleBookingChange} placeholder="Describe your symptoms or concerns" />
                    </div>
                    <button type="submit" className="btn-submit">Submit Request</button>
                  </form>
                </div>
              )}

              {userAppointments.length > 0 ? (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Provider</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAppointments.slice(0, 5).map(apt => (
                      <tr key={apt.id}>
                        <td>{apt.service}</td>
                        <td>{apt.providerName}</td>
                        <td>{apt.date}</td>
                        <td>{apt.time}</td>
                        <td>
                          <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                        </td>
                        <td>
                          <button className="btn-view" onClick={() => handleViewAppointment(apt)}>View</button>
                          {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                            <button className="btn-cancel" onClick={() => handleCancelAppointment(apt.id)}>Cancel</button>
                          )}
                          {apt.providerId && (
                            <button className="btn-video" onClick={() => navigate(`/video-call/${apt.providerId}`)} style={{marginLeft: '0.5rem'}}>
                              📹
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No appointments yet. Book your first appointment!</p>
              )}
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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2>All Appointments</h2>
              <button className="btn-book" onClick={() => setShowBooking(!showBooking)}>
                + Book New
              </button>
            </div>
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
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            {filteredAppointments.length > 0 ? (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Provider</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.service}</td>
                      <td>{apt.providerName}</td>
                      <td>{apt.date}</td>
                      <td>{apt.time}</td>
                      <td>{apt.type === 'home' ? 'Home Visit' : 'Clinic'}</td>
                      <td>
                        <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                      </td>
                      <td>
                        <button className="btn-view" onClick={() => handleViewAppointment(apt)}>View</button>
                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                          <button className="btn-cancel" onClick={() => handleCancelAppointment(apt.id)}>Cancel</button>
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

      case 'records':
        return (
          <section>
            <h2>Medical Records & Prescriptions</h2>
            <div className="search-filter">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search records..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select className="filter-select" value={recordFilter} onChange={(e) => setRecordFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="Checkup">Checkup</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
              </select>
            </div>
            <div className="records-section">
              <h3>Medical Records</h3>
              <div className="cards-grid">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map(record => (
                    <div key={record.id} className="card-item">
                      <h3>{record.title}</h3>
                      <p><strong>Date:</strong> {record.date}</p>
                      <p><strong>Doctor:</strong> {record.doctor}</p>
                      <p><strong>Type:</strong> {record.type}</p>
                      <div style={{marginTop: '1rem'}}>
                        <button className="btn-view" onClick={() => handleViewRecord(record)}>View</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No medical records found</p>
                )}
              </div>
              
              <h3 style={{marginTop: '2rem'}}>Prescriptions</h3>
              <div className="cards-grid">
                {userPrescriptions.length > 0 ? (
                  userPrescriptions.map(prescription => (
                    <div key={prescription.id} className="card-item">
                      <h3>Prescription from {prescription.doctorName}</h3>
                      <p><strong>Date:</strong> {prescription.date}</p>
                      <p><strong>Status:</strong> <span className={`status ${prescription.status.toLowerCase()}`}>{prescription.status}</span></p>
                      <div style={{marginTop: '1rem'}}>
                        <button className="btn-view" onClick={() => handleViewPrescription(prescription)}>View Details</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No prescriptions found</p>
                )}
              </div>
            </div>
          </section>
        );

      case 'doctors':
        return (
          <section>
            <h2>Find Doctors</h2>
            <div className="search-filter">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by name or specialty..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select className="filter-select" value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                <option value="">All Specialties</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
            </div>
            <div className="cards-grid">
              {filteredDoctors.map(doc => (
                <div key={doc.id} className="card-item">
                  <div className="provider-avatar" style={{fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem'}}>
                    {doc.name.charAt(0)}
                  </div>
                  <h3>{doc.name}</h3>
                  <p><strong>Specialty:</strong> {doc.specialty}</p>
                  <p><strong>Experience:</strong> {doc.experience}</p>
                  <p><strong>Rating:</strong> {doc.rating || 'New'}/5</p>
                  <div style={{marginTop: '1rem'}}>
                    <button className="btn-book" onClick={() => handleBookDoctor(doc)}>Book Appointment</button>
                    <Link to="/messages" className="btn-view" style={{marginLeft: '0.5rem', textDecoration: 'none'}}>Message</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'messages':
        return (
          <section>
            <h2>Messages</h2>
            <p>Chat with your healthcare providers</p>
            <Link to="/messages" className="btn-primary" style={{display: 'inline-block', padding: '12px 24px', background: '#4a90e2', color: 'white', textDecoration: 'none', borderRadius: '8px'}}>
              Open Messages
            </Link>
          </section>
        );

      case 'reviews':
        return (
          <section>
            <h2>Reviews</h2>
            <p>Rate and review your healthcare providers</p>
            <Link to="/reviews" className="btn-primary" style={{display: 'inline-block', padding: '12px 24px', background: '#4a90e2', color: 'white', textDecoration: 'none', borderRadius: '8px'}}>
              Write a Review
            </Link>
          </section>
        );

      case 'profile':
        return (
          <div className="profile-section">
            <div className="profile-card">
              <div className="profile-avatar">{currentUser.name?.charAt(0) || 'U'}</div>
              <h3>{currentUser.name}</h3>
              <p>Patient</p>
              <p>{currentUser.email}</p>
            </div>
            <div className="profile-info">
              <h3>Personal Information</h3>
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
                    <span className="info-label">Date of Birth</span>
                    <input type="date" value={profileForm.dob} onChange={(e) => setProfileForm({...profileForm, dob: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Address</span>
                    <input type="text" value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Blood Type</span>
                    <select value={profileForm.bloodType} onChange={(e) => setProfileForm({...profileForm, bloodType: e.target.value})}>
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Allergies</span>
                    <input type="text" value={profileForm.allergies} onChange={(e) => setProfileForm({...profileForm, allergies: e.target.value})} placeholder="List any allergies" />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Emergency Contact</span>
                    <input type="text" value={profileForm.emergencyContact} onChange={(e) => setProfileForm({...profileForm, emergencyContact: e.target.value})} placeholder="Contact name" />
                  </div>
                  <div className="info-row">
                    <span className="info-label">Emergency Phone</span>
                    <input type="tel" value={profileForm.emergencyPhone} onChange={(e) => setProfileForm({...profileForm, emergencyPhone: e.target.value})} placeholder="Phone number" />
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
                    <span className="info-label">Email</span>
                    <span className="info-value">{currentUser.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{currentUser.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date of Birth</span>
                    <span className="info-value">{currentUser.dob || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Address</span>
                    <span className="info-value">{currentUser.address || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Blood Type</span>
                    <span className="info-value">{currentUser.bloodType || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Allergies</span>
                    <span className="info-value">{currentUser.allergies || 'None'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Emergency Contact</span>
                    <span className="info-value">{currentUser.emergencyContact?.name || 'Not set'} - {currentUser.emergencyContact?.phone || ''}</span>
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
        ☰
      </button>
      
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>HomeCare</h2>
          <p>Patient Portal</p>
        </div>
        <nav className="sidebar-nav">
          <a href="#overview" className={activeTab === 'overview' ? 'active' : ''} onClick={() => {setActiveTab('overview'); setSidebarOpen(false);}}>Dashboard</a>
          <a href="#appointments" className={activeTab === 'appointments' ? 'active' : ''} onClick={() => {setActiveTab('appointments'); setSidebarOpen(false);}}>My Appointments</a>
          <a href="#records" className={activeTab === 'records' ? 'active' : ''} onClick={() => {setActiveTab('records'); setSidebarOpen(false);}}>Medical Records</a>
          <a href="#doctors" className={activeTab === 'doctors' ? 'active' : ''} onClick={() => {setActiveTab('doctors'); setSidebarOpen(false);}}>Find Doctors</a>
          <a href="#messages" className={activeTab === 'messages' ? 'active' : ''} onClick={() => {setActiveTab('messages'); setSidebarOpen(false);}}>Messages</a>
          <a href="#reviews" className={activeTab === 'reviews' ? 'active' : ''} onClick={() => {setActiveTab('reviews'); setSidebarOpen(false);}}>Reviews</a>
          <a href="#payments" className={activeTab === 'payments' ? 'active' : ''} onClick={() => {setActiveTab('payments'); setSidebarOpen(false); navigate('/dashboard/patient/payment');}}>Payments</a>
          <a href="#profile" className={activeTab === 'profile' ? 'active' : ''} onClick={() => {setActiveTab('profile'); setSidebarOpen(false);}}>My Profile</a>
          <a href="#logout" onClick={() => {handleLogout(); setSidebarOpen(false);}}>Logout</a>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome, {currentUser?.name || 'Patient'}!</h1>
          <div className="profile-icon-container">
            <button className="profile-icon-btn" onClick={() => setActiveTab('profile')}>
              <div className="profile-avatar-small">{currentUser?.name?.charAt(0) || 'P'}</div>
            </button>
          </div>
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

export default PatientDashboard;
