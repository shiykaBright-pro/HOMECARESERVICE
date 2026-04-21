import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import './Dashboard.css';

function AdminDashboard() {
  const { logout, users: contextUsers, appointments: contextAppointments, updateAppointment, getAnalytics } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });

  // Fix: Essential states - **this was causing ReferenceError/blank page**
  const [localUsers, setLocalUsers] = useState([]);
  const [localAppointments, setLocalAppointments] = useState([]);
  const [reports, setReports] = useState([
    { id: 1, title: 'Monthly Revenue Report', date: '2026-02-01', type: 'Financial' },
    { id: 2, title: 'Patient Satisfaction Survey', date: '2026-01-28', type: 'Feedback' },
    { id: 3, title: 'Appointment Statistics', date: '2026-01-25', type: 'Analytics' },
  ]);
  const [services, setServices] = useState([
    { id: 1, name: 'General Consultation', description: 'Basic health consultation with a doctor', price: 50, duration: '30 min', category: 'Doctor' },
    { id: 2, name: 'Nursing Care', description: 'Professional nursing services', price: 40, duration: '45 min', category: 'Nurse' },
    { id: 3, name: 'Physical Therapy', description: 'Rehabilitation and physical therapy', price: 60, duration: '60 min', category: 'Therapist' },
    { id: 4, name: 'Medical Tests', description: 'Blood test, urine test, etc.', price: 30, duration: '15 min', category: 'Lab' },
  ]);
  const [editingItem, setEditingItem] = useState(null);
  const [settings, setSettings] = useState({ generalSettings: { appName: 'HomeCare' }, notificationSettings: { email: true, sms: true }, paymentSettings: {}, securitySettings: { twoFactor: false } });
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  // Fallback mock data (used in renderContent/handlers)
  const users = localUsers.length ? localUsers : [
    { id: 1, name: 'John Smith', role: 'Patient', email: 'john@example.com', phone: '+1 234 567 8901', status: 'Active', joinDate: '2026-01-15' },
    { id: 2, name: 'Dr. Sarah Johnson', role: 'Doctor', email: 'sarah@example.com', phone: '+1 234 567 8902', status: 'Active', joinDate: '2023-06-10', specialty: 'General Medicine', licenseNumber: 'MD-12345', licenseVerified: true },
  ];
  const appointments = localAppointments.length ? localAppointments : [
    { id: 1, service: 'General Consultation', patient: 'John Smith', provider: 'Dr. Sarah Johnson', date: '2026-02-15', status: 'Confirmed', type: 'Home Visit' },
    { id: 2, service: 'Wound Care', patient: 'Alice Williams', provider: 'Nurse Mike Brown', date: '2026-02-15', status: 'In Progress', type: 'Home Visit' },
  ];

  // Sync with context
  useEffect(() => {
    if (contextUsers) setLocalUsers(contextUsers.filter(u => u.role !== 'admin'));
  }, [contextUsers]);
  
  useEffect(() => {
    if (contextAppointments) setLocalAppointments(contextAppointments);
  }, [contextAppointments]);

  // Phase 1: Reusable components

  // Reusable FormModal Component (Step 2)
  const FormModal = ({ isOpen, onClose, title, children, onSubmit, submitLabel = 'Save' }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <form onSubmit={onSubmit} className="form-modal">
            <div className="modal-body">
              {children}
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-submit">{submitLabel}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Toast Component (Step 3)
  const ToastComponent = () => {
    if (!toast.visible) return null;
    return (
      <div className={`toast-container toast-${toast.type}`}>
        {toast.message}
      </div>
    );
  };

  // Toast handler
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  // Form validation helper
  const validateForm = (formData, requiredFields) => {
    const errors = {};
    requiredFields.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Phone number is invalid';
    }
    if (formData.date && isNaN(Date.parse(formData.date))) {
      errors.date = 'Invalid date';
    }
    return Object.keys(errors).length === 0 ? null : errors;
  };

  const [notifications, setNotifications] = useState([

    { id: 1, message: 'New user registered: John Doe', type: 'info', date: '2026-02-15', read: false },
    { id: 2, message: 'Appointment cancelled for Alice Williams', type: 'warning', date: '2026-02-14', read: false },
    { id: 3, message: 'System backup completed successfully', type: 'success', date: '2026-02-13', read: true },
    { id: 4, message: 'License verification pending for Dr. Smith', type: 'warning', date: '2026-02-12', read: false },
    { id: 5, message: 'Monthly report generated', type: 'info', date: '2026-02-11', read: true },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
      default: return 'ℹ';
    }
  };

  const handleViewUser = (user) => {
    setModalContent({
      title: 'User Details',
      content: (
        <div className="modal-details">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Status:</strong> {user.status}</p>
          <p><strong>Join Date:</strong> {user.joinDate}</p>
          {user.specialty && <p><strong>Specialty:</strong> {user.specialty}</p>}
        </div>
      )
    });
    setShowModal(true);
  };

  // Phase 4 Step 10: Edit User
  const handleEditUser = (user) => {
    setEditingItem({ type: 'user', ...user });
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const errors = validateForm(data, ['name', 'role', 'email', 'phone', 'status']);
    if (errors) {
      showToast('Please fix form errors (required fields, valid email/phone)', 'error');
      return;
    }

    // Update localUsers and contextUsers
    setLocalUsers(prev => prev.map(u => u.id === editingItem.id ? { ...u, ...data } : u));
    
    showToast(`User "${data.name}" updated successfully!`);
    setEditingItem(null);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLocalUsers(prev => prev.filter(user => user.id !== id));
      showToast('User deleted successfully!', 'success');
    }
  };


  const handleAddUser = () => {
    alert('Add user feature coming soon!');
  };

  const handleViewAppointment = (apt) => {
    setModalContent({
      title: 'Appointment Details',
      content: (
        <div className="modal-details">
          <p><strong>Service:</strong> {apt.service}</p>
          <p><strong>Patient:</strong> {apt.patient}</p>
          <p><strong>Provider:</strong> {apt.provider}</p>
          <p><strong>Date:</strong> {apt.date}</p>
          <p><strong>Type:</strong> {apt.type}</p>
          <p><strong>Status:</strong> {apt.status}</p>
        </div>
      )
    });
    setShowModal(true);
  };

  // Phase 4 Step 9: Edit Appointment
  const handleEditAppointment = (apt) => {
    setEditingItem({ type: 'appointment', ...apt });
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const errors = validateForm(data, ['service', 'date', 'status']);
    if (errors) {
      showToast('Please fix form errors', 'error');
      return;
    }

    // Update localAppointments and context
    setLocalAppointments(prev => prev.map(a => a.id === editingItem.id ? { ...a, ...data } : a));
    updateAppointment(editingItem.id, data);
    
    showToast(`Appointment #${editingItem.id} updated!`);
    setEditingItem(null);
  };

  const handleAddService = () => {
    alert('Add service feature coming soon!');
  };

  const handleEditService = (service) => {
    alert(`Edit service ${service.name} - Feature coming soon!`);
  };

  const handleDeleteService = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== id));
      alert('Service deleted successfully!');
    }
  };

  // Phase 2 Step 6: Enhanced View Report
  const handleViewReport = (report) => {
    let content = null;
    
    switch(report.type) {
      case 'Financial':
        content = (
          <div>
            <h4>Revenue Summary</h4>
            <table className="appointments-table" style={{width: '100%', fontSize: '0.9rem'}}>
              <thead>
                <tr><th>Date</th><th>Service</th><th>Patient</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                <tr><td>2026-02-01</td><td>General Consultation</td><td>John Smith</td><td>$50</td></tr>
                <tr><td>2026-02-02</td><td>Nursing Care</td><td>Alice Williams</td><td>$40</td></tr>
                <tr><td>2026-02-03</td><td>Cardiology</td><td>Robert Chen</td><td>$60</td></tr>
              </tbody>
            </table>
            <p style={{marginTop: '1rem', fontWeight: 'bold'}}>Total: $150</p>
          </div>
        );
        break;
      case 'Feedback':
        content = (
          <div>
            <h4>Patient Feedback</h4>
            <ul style={{paddingLeft: '1.5rem'}}>
              <li>John Smith: ★★★★★ "Excellent service!"</li>
              <li>Alice Williams: ★★★★☆ "Good care, prompt response"</li>
            </ul>
            <p style={{marginTop: '1rem'}}><strong>Average Rating: 4.5/5</strong></p>
          </div>
        );
        break;
      case 'Analytics':
        content = (
          <div>
            <h4>Appointment Statistics</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
              <div className="stat-card" style={{padding: '1rem'}}>
                <h4>Total Appointments</h4>
                <p className="stat-number">24</p>
              </div>
              <div className="stat-card" style={{padding: '1rem'}}>
                <h4>Confirmed</h4>
                <p className="stat-number">18</p>
              </div>
              <div className="stat-card" style={{padding: '1rem'}}>
                <h4>Pending</h4>
                <p className="stat-number">6</p>
              </div>
            </div>
          </div>
        );
        break;
      default:
        content = <div className="modal-details"><p><strong>Title:</strong> {report.title}</p><p><strong>Type:</strong> {report.type}</p><p><strong>Date:</strong> {report.date}</p></div>;
    }
    
    setModalContent({
      title: report.title,
      content
    });
    setShowModal(true);
  };

  // Phase 2 Step 5: Download Report (CSV)
  const handleDownloadReport = (report) => {
    let csvContent = '';
    
    switch(report.type) {
      case 'Financial':
        csvContent = 'Date,Service,Patient,Provider,Revenue\n' +
          '2026-02-01,General Consultation,John Smith,Dr. Sarah Johnson,$50\n' +
          '2026-02-02,Nursing Care,Alice Williams,Nurse Mike Brown,$40\n' +
          '2026-02-03,Cardiology,Robert Chen,Dr. John Smith,$60\n';
        break;
      case 'Feedback':
        csvContent = 'Patient,Rating,Comment,Date\n' +
          'John Smith,5,Excellent service,$2026-02-01\n' +
          'Alice Williams,4,Good care,$2026-02-02\n';
        break;
      case 'Analytics':
        csvContent = 'Metric,Value,Date\n' +
          'Total Appointments,24,2026-02\n' +
          'Total Revenue,$150,2026-02\n' +
          'Patient Satisfaction,4.8,2026-02\n';
        break;
      default:
        csvContent = 'Report Data\nNo data available';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast(`Downloaded ${report.title} as CSV`);
  };

  // Phase 2 Step 4: Generate Report
  const handleGenerateReport = () => {
    setEditingItem({ type: 'report' });
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const errors = validateForm(data, ['title', 'type']);
    if (errors) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    const newReport = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split('T')[0]
    };
    
    setLocalReports([newReport, ...localReports]);
    setEditingItem(null);
    showToast(`Report "${data.title}" generated successfully!`);
  };

  // Phase 3 Step 7: Settings Configuration
  const handleConfigureSettings = (category) => {
    setEditingItem({ type: 'settings', category });
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    setSettings(prev => ({ ...prev, [editingItem.category.toLowerCase().replace(/\s/g, '')]: data }));
    setEditingItem(null);
    showToast(`${editingItem.category} updated successfully!`);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Clear context/session
      localStorage.removeItem('currentUser'); // Clear app-specific session
      navigate('/login');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  // Mock license verification service
  const verifyLicenseWithAuthority = async (licenseNumber, role) => {
    // Simulate API call to external verification service
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock verification logic
        const validLicenses = {
          doctors: ['MD-12345', 'MD-54321', 'DR-11111', 'DR-22222'],
          nurses: ['RN-67890', 'RN-88888', 'EN-33333', 'EN-44444']
        };

        const isValid = validLicenses[role === 'doctor' ? 'doctors' : 'nurses'].includes(licenseNumber.toUpperCase());
        resolve({
          valid: isValid,
          details: isValid ? {
            expiryDate: '2026-12-31',
            issuingAuthority: role === 'doctor' ? 'State Medical Board' : 'State Nursing Board',
            status: 'Active'
          } : null,
          error: isValid ? null : 'License not found in official database'
        });
      }, 2000); // Simulate network delay
    });
  };

  // License verification functions
  const handleVerifyLicense = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const verification = await verifyLicenseWithAuthority(user.licenseNumber, user.role);

      if (verification.valid) {
        setUsers(users.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              licenseVerified: true,
              status: 'Active',
              licenseDetails: verification.details
            };
          }
          return u;
        }));
        alert(`License verified successfully!\n\nDetails:\n- Expiry: ${verification.details.expiryDate}\n- Authority: ${verification.details.issuingAuthority}\n- Status: ${verification.details.status}`);
      } else {
        alert(`License verification failed: ${verification.error}`);
      }
    } catch (error) {
      alert('Error verifying license. Please try again.');
    }
  };

  const handleRejectLicense = (userId) => {
    if (window.confirm('Are you sure you want to reject this license? The user will be notified and cannot practice.')) {
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, licenseVerified: false, status: 'Rejected' };
        }
        return user;
      }));
      alert('License rejected. User has been notified.');
    }
  };

  const handleViewLicense = (user) => {
    setModalContent({
      title: 'License Details - ' + user.name,
      content: (
        <div className="modal-details">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>License Number:</strong> {user.licenseNumber}</p>
          <p><strong>License Status:</strong> 
            <span className={`status ${user.licenseVerified ? 'confirmed' : 'pending'}`}>
              {user.licenseVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </p>
          {user.specialty && <p><strong>Specialty:</strong> {user.specialty}</p>}
          <p><strong>Join Date:</strong> {user.joinDate}</p>
          
          {!user.licenseVerified && (
            <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
              <button className="btn-edit" onClick={() => { handleVerifyLicense(user.id); setShowModal(false); }}>
                ✓ Verify License
              </button>
              <button className="btn-delete" onClick={() => { handleRejectLicense(user.id); setShowModal(false); }}>
                ✗ Reject License
              </button>
            </div>
          )}
        </div>
      )
    });
    setShowModal(true);
  };

  // Get users pending license verification
  const pendingLicenses = users.filter(u => (u.role === 'Doctor' || u.role === 'Nurse') && !u.licenseVerified);
  const verifiedProviders = users.filter(u => u.role === 'Doctor' || u.role === 'Nurse');

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <h3>Total Patients</h3>
                <p className="stat-number">156</p>
              </div>
              <div className="stat-card">
                <h3>Total Doctors</h3>
                <p className="stat-number">12</p>
              </div>
              <div className="stat-card">
                <h3>Total Nurses</h3>
                <p className="stat-number">8</p>
              </div>
              <div className="stat-card">
                <h3>Today's Appointments</h3>
                <p className="stat-number">24</p>
              </div>
            </section>

            <section>
              <h2>Recent Appointments</h2>
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Patient</th>
                    <th>Provider</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.service}</td>
                      <td>{apt.patient}</td>
                      <td>{apt.provider}</td>
                      <td>{apt.date}</td>
                      <td>{apt.type}</td>
                      <td>
                        <span className={`status ${apt.status.toLowerCase().replace(' ', '-')}`}>{apt.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h2>Recent Users</h2>
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 4).map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status ${user.status.toLowerCase()}`}>{user.status}</span>
                      </td>
                      <td>{user.joinDate}</td>
                      <td>
                        <button className="btn-view" onClick={() => handleViewUser(user)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        );

      case 'users':
        return (
          <section>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2>User Management</h2>
              <button className="btn-add" onClick={handleAddUser}>+ Add User</button>
            </div>
            <div className="search-filter">
              <input type="text" className="search-input" placeholder="Search users..." />
              <select className="filter-select">
                <option>All Roles</option>
                <option>Patient</option>
                <option>Doctor</option>
                <option>Nurse</option>
                <option>Admin</option>
              </select>
              <select className="filter-select">
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Inactive</option>
              </select>
            </div>
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`status ${user.status.toLowerCase()}`}>{user.status}</span>
                    </td>
                    <td>{user.joinDate}</td>
                      <td>
                        <button className="btn-view" onClick={() => handleViewUser(user)}>View</button>
                        <button className="btn-edit" onClick={() => handleEditUser(user)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                        <Link to={`/video-call/${user.id}`} className="btn-video" style={{marginLeft: '0.5rem', textDecoration: 'none'}}>
                          📹
                        </Link>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );

      case 'appointments':
        return (
          <section>
            <h2>Appointment Management</h2>
            <div className="search-filter">
              <input type="text" className="search-input" placeholder="Search appointments..." />
              <select className="filter-select">
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <select className="filter-select">
                <option>All Services</option>
                <option>General Consultation</option>
                <option>Nursing Care</option>
                <option>Physical Therapy</option>
              </select>
            </div>
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>Patient</th>
                  <th>Provider</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.id}>
                    <td>#{apt.id}</td>
                    <td>{apt.service}</td>
                    <td>{apt.patient}</td>
                    <td>{apt.provider}</td>
                    <td>{apt.date}</td>
                    <td>{apt.type}</td>
                    <td>
                      <span className={`status ${apt.status.toLowerCase().replace(' ', '-')}`}>{apt.status}</span>
                    </td>
                    <td>
                      <button className="btn-view" onClick={() => handleViewAppointment(apt)}>View</button>
                      <button className="btn-edit" onClick={() => handleEditAppointment(apt)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );

      case 'services':
        return (
          <section>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2>Service Management</h2>
              <button className="btn-add" onClick={handleAddService}>+ Add Service</button>
            </div>
            <div className="search-filter">
              <input type="text" className="search-input" placeholder="Search services..." />
              <select className="filter-select">
                <option>All Categories</option>
                <option>Doctor</option>
                <option>Nurse</option>
                <option>Therapist</option>
                <option>Lab</option>
              </select>
            </div>
            {services.map(service => (
              <div key={service.id} className="service-item">
                <div className="service-info">
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>
                  <p><strong>Category:</strong> {service.category} | <strong>Duration:</strong> {service.duration}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div className="service-price">${service.price}</div>
                  <div style={{marginTop: '0.5rem'}}>
                    <button className="btn-edit" onClick={() => handleEditService(service)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteService(service.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        );

      case 'reports':
        return (
          <section>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2>Reports</h2>
              <button className="btn-add" onClick={handleGenerateReport}>+ Generate Report</button>
            </div>
            <div className="search-filter">
              <input type="text" className="search-input" placeholder="Search reports..." />
              <select className="filter-select">
                <option>All Types</option>
                <option>Financial</option>
                <option>Analytics</option>
                <option>Feedback</option>
              </select>
            </div>
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>{report.title}</td>
                    <td>
                      <span className="status pending">{report.type}</span>
                    </td>
                    <td>{report.date}</td>
                    <td>
                      <button className="btn-view" onClick={() => handleViewReport(report)}>View</button>
                      <button className="btn-download" onClick={() => handleDownloadReport(report)}>Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );

      case 'settings':
        return (
          <section>
            <h2>System Settings</h2>
            <div className="cards-grid">
              <div className="card-item">
                <h3>General Settings</h3>
                <p>Configure system preferences</p>
                <button className="btn-edit" onClick={() => handleConfigureSettings('General Settings')}>Configure</button>
              </div>
              <div className="card-item">
                <h3>Notification Settings</h3>
                <p>Manage email and SMS notifications</p>
                <button className="btn-edit" onClick={() => handleConfigureSettings('Notification Settings')}>Configure</button>
              </div>
              <div className="card-item">
                <h3>Payment Settings</h3>
                <p>Configure payment methods and rates</p>
                <button className="btn-edit" onClick={() => handleConfigureSettings('Payment Settings')}>Configure</button>
              </div>
              <div className="card-item">
                <h3>Security Settings</h3>
                <p>Manage security and access control</p>
                <button className="btn-edit" onClick={() => handleConfigureSettings('Security Settings')}>Configure</button>
              </div>
            </div>
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
          <h2>{settings.generalSettings?.appName || 'HomeCare'}</h2>
          <p>Admin Portal</p>
          {settings.notificationSettings && (
            <small style={{opacity: 0.8}}>Notifications: {settings.notificationSettings.email ? 'Email ' : ''}{settings.notificationSettings.sms ? 'SMS' : ''}</small>
          )}
        </div>
        <nav className="sidebar-nav">
          <a href="#overview" className={activeTab === 'overview' ? 'active' : ''} onClick={() => {setActiveTab('overview'); setSidebarOpen(false);}}>Dashboard</a>
          <a href="#users" className={activeTab === 'users' ? 'active' : ''} onClick={() => {setActiveTab('users'); setSidebarOpen(false);}}>Manage Users</a>
          <a href="#appointments" className={activeTab === 'appointments' ? 'active' : ''} onClick={() => {setActiveTab('appointments'); setSidebarOpen(false);}}>Appointments</a>
          <a href="#services" className={activeTab === 'services' ? 'active' : ''} onClick={() => {setActiveTab('services'); setSidebarOpen(false);}}>Services</a>
          <a href="#reports" className={activeTab === 'reports' ? 'active' : ''} onClick={() => {setActiveTab('reports'); setSidebarOpen(false);}}>Reports</a>
          <a href="#settings" className={activeTab === 'settings' ? 'active' : ''} onClick={() => {setActiveTab('settings'); setSidebarOpen(false);}}>Settings</a>
          <button className="sidebar-logout" onClick={() => { handleLogout(); setSidebarOpen(false); }}>Logout</button>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome, {currentUser?.name || 'Administrator'}!</h1>
        </header>
        {renderContent()}
      </main>

      {/* Phase 1: Render reusable components */}
      <ToastComponent />
{editingItem && (
        <FormModal 
          key={editingItem.id || editingItem.type}
          isOpen={true} 
          onClose={() => setEditingItem(null)}
          title={editingItem.type === 'report' ? 'Generate New Report' :
                 editingItem.type === 'appointment' ? 'Edit Appointment' :
                 editingItem.type === 'user' ? 'Edit User' :
                 editingItem.type === 'settings' ? `Configure ${editingItem.category}` : 'Form'}
          onSubmit={editingItem.type === 'report' ? handleReportSubmit :
                    editingItem.type === 'settings' ? handleSettingsSubmit :
                    editingItem.type === 'appointment' ? handleAppointmentSubmit :
                    editingItem.type === 'user' ? handleUserSubmit : (e) => e.preventDefault()}
          submitLabel="Save Changes"
        >
          {editingItem.type === 'report' && (
            <div className="form-row">
              <div className="form-group">
                <label>Report Title *</label>
                <input name="title" type="text" defaultValue={editingItem.title || ''} required />
              </div>
              <div className="form-group">
                <label>Report Type *</label>
                <select name="type" required>
                  <option value="">Select Type</option>
                  <option value="Financial">Financial</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Analytics">Analytics</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input name="date" type="date" />
              </div>
            </div>
          )}
          {editingItem.type === 'appointment' && (
            <div className="form-row">
              <div className="form-group">
                <label>Service *</label>
                <input name="service" type="text" defaultValue={editingItem.service || ''} required />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input name="date" type="date" defaultValue={editingItem.date || ''} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input name="time" type="time" defaultValue={editingItem.time || ''} />
              </div>
              <div className="form-group">
                <label>Provider</label>
                <input name="provider" type="text" defaultValue={editingItem.provider || ''} />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select name="status" required>
                  <option value="Pending" selected={editingItem.status === 'Pending'}>Pending</option>
                  <option value="Confirmed" selected={editingItem.status === 'Confirmed'}>Confirmed</option>
                  <option value="In Progress" selected={editingItem.status === 'In Progress'}>In Progress</option>
                  <option value="Completed" selected={editingItem.status === 'Completed'}>Completed</option>
                  <option value="Cancelled" selected={editingItem.status === 'Cancelled'}>Cancelled</option>
                </select>
              </div>
            </div>
          )}
          {editingItem.type === 'user' && (
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input name="name" type="text" defaultValue={editingItem.name || ''} required />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select name="role" required>
                  <option value="Patient" selected={editingItem.role === 'Patient'}>Patient</option>
                  <option value="Doctor" selected={editingItem.role === 'Doctor'}>Doctor</option>
                  <option value="Nurse" selected={editingItem.role === 'Nurse'}>Nurse</option>
                </select>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" defaultValue={editingItem.email || ''} required />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input name="phone" type="tel" defaultValue={editingItem.phone || ''} required />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select name="status" required>
                  <option value="Active" selected={editingItem.status === 'Active'}>Active</option>
                  <option value="Pending" selected={editingItem.status === 'Pending'}>Pending</option>
                  <option value="Inactive" selected={editingItem.status === 'Inactive'}>Inactive</option>
                </select>
              </div>
              {(editingItem.role === 'Doctor' || editingItem.role === 'Nurse') && (
                <div className="form-group">
                  <label>Specialty (Optional)</label>
                  <input name="specialty" type="text" defaultValue={editingItem.specialty || ''} />
                </div>
              )}
            </div>
          )}
          {editingItem.type === 'settings' && (
            <div>
              {editingItem.category === 'General Settings' && (
                <div className="form-group">
                  <label>App Name</label>
                  <input name="appName" type="text" defaultValue={settings.generalSettings?.appName || ''} />
                </div>
              )}
              {editingItem.category === 'Notification Settings' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Notifications</label>
                      <input name="email" type="checkbox" defaultChecked={settings.notificationSettings?.email || false} />
                    </div>
                    <div className="form-group">
                      <label>SMS Notifications</label>
                      <input name="sms" type="checkbox" defaultChecked={settings.notificationSettings?.sms || false} />
                    </div>
                  </div>
                </>
              )}
              {editingItem.category === 'Payment Settings' && (
                <div className="form-group">
                  <label>Default Payment Method</label>
                  <select name="defaultPaymentMethod">
                    <option>Cash</option>
                    <option>Card</option>
                    <option>Mobile Money</option>
                  </select>
                </div>
              )}
              {editingItem.category === 'Security Settings' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Two-Factor Authentication</label>
                    <input name="twoFactor" type="checkbox" />
                  </div>
                  <div className="form-group">
                    <label>Session Timeout (minutes)</label>
                    <input name="sessionTimeout" type="number" min="5" max="60" />
                  </div>
                </div>
              )}
            </div>
          )}
        </FormModal>
      )}
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

export default AdminDashboard;

