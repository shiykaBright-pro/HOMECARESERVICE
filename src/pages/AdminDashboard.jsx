import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });

  const [users, setUsers] = useState([
    { id: 1, name: 'John Smith', role: 'Patient', email: 'john@example.com', phone: '+1 234 567 8901', status: 'Active', joinDate: '2026-01-15' },
    { id: 2, name: 'Dr. Sarah Johnson', role: 'Doctor', email: 'sarah@example.com', phone: '+1 234 567 8902', status: 'Active', joinDate: '2023-06-10', specialty: 'General Medicine', licenseNumber: 'MD-12345', licenseVerified: true },
    { id: 3, name: 'Nurse Mike Brown', role: 'Nurse', email: 'mike@example.com', phone: '+1 234 567 8903', status: 'Active', joinDate: '2023-08-20', licenseNumber: 'RN-67890', licenseVerified: true },
    { id: 4, name: 'Emily Davis', role: 'Patient', email: 'emily@example.com', phone: '+1 234 567 8904', status: 'Pending', joinDate: '2026-02-10' },
    { id: 5, name: 'Dr. John Smith', role: 'Doctor', email: 'john.smith@example.com', phone: '+1 234 567 8905', status: 'Active', joinDate: '2023-05-15', specialty: 'Cardiology', licenseNumber: 'MD-54321', licenseVerified: true },
    { id: 6, name: 'Dr. New Doctor', role: 'Doctor', email: 'newdoc@example.com', phone: '+1 234 567 8906', status: 'Pending', joinDate: '2026-02-15', specialty: 'Pediatrics', licenseNumber: 'MD-99999', licenseVerified: false },
    { id: 7, name: 'Nurse New Nurse', role: 'Nurse', email: 'newnurse@example.com', phone: '+1 234 567 8907', status: 'Pending', joinDate: '2026-02-16', licenseNumber: 'RN-88888', licenseVerified: false },
  ]);

  const [appointments] = useState([
    { id: 1, service: 'General Consultation', patient: 'John Smith', provider: 'Dr. Sarah Johnson', date: '2026-02-15', status: 'Confirmed', type: 'Home Visit' },
    { id: 2, service: 'Wound Care', patient: 'Alice Williams', provider: 'Nurse Mike Brown', date: '2026-02-15', status: 'In Progress', type: 'Home Visit' },
    { id: 3, service: 'Cardiology', patient: 'Robert Chen', provider: 'Dr. John Smith', date: '2026-02-16', status: 'Pending', type: 'Home Visit' },
  ]);

  const [services, setServices] = useState([
    { id: 1, name: 'General Consultation', description: 'Basic health consultation with a doctor', price: 50, duration: '30 min', category: 'Doctor' },
    { id: 2, name: 'Nursing Care', description: 'Professional nursing services', price: 40, duration: '45 min', category: 'Nurse' },
    { id: 3, name: 'Physical Therapy', description: 'Rehabilitation and physical therapy', price: 60, duration: '60 min', category: 'Therapist' },
    { id: 4, name: 'Medical Tests', description: 'Blood test, urine test, etc.', price: 30, duration: '15 min', category: 'Lab' },
  ]);

  const [reports] = useState([
    { id: 1, title: 'Monthly Revenue Report', date: '2026-02-01', type: 'Financial' },
    { id: 2, title: 'Patient Satisfaction Survey', date: '2026-01-28', type: 'Feedback' },
    { id: 3, title: 'Appointment Statistics', date: '2026-01-25', type: 'Analytics' },
  ]);

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

  const handleEditUser = (user) => {
    alert(`Edit user ${user.name} - Feature coming soon!`);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
      alert('User deleted successfully!');
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

  const handleEditAppointment = (apt) => {
    alert(`Edit appointment #${apt.id} - Feature coming soon!`);
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

  const handleViewReport = (report) => {
    setModalContent({
      title: report.title,
      content: (
        <div className="modal-details">
          <p><strong>Title:</strong> {report.title}</p>
          <p><strong>Type:</strong> {report.type}</p>
          <p><strong>Date:</strong> {report.date}</p>
        </div>
      )
    });
    setShowModal(true);
  };

  const handleDownloadReport = (report) => {
    alert(`Downloading ${report.title}...`);
  };

  const handleGenerateReport = () => {
    alert('Generate report feature coming soon!');
  };

  const handleConfigureSettings = (setting) => {
    alert(`${setting} configuration coming soon!`);
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
          <h2>HomeCare</h2>
          <p>Admin Portal</p>
        </div>
        <nav className="sidebar-nav">
          <a href="#overview" className={activeTab === 'overview' ? 'active' : ''} onClick={() => {setActiveTab('overview'); setSidebarOpen(false);}}>Dashboard</a>
          <a href="#users" className={activeTab === 'users' ? 'active' : ''} onClick={() => {setActiveTab('users'); setSidebarOpen(false);}}>Manage Users</a>
          <a href="#appointments" className={activeTab === 'appointments' ? 'active' : ''} onClick={() => {setActiveTab('appointments'); setSidebarOpen(false);}}>Appointments</a>
          <a href="#services" className={activeTab === 'services' ? 'active' : ''} onClick={() => {setActiveTab('services'); setSidebarOpen(false);}}>Services</a>
          <a href="#reports" className={activeTab === 'reports' ? 'active' : ''} onClick={() => {setActiveTab('reports'); setSidebarOpen(false);}}>Reports</a>
          <a href="#settings" className={activeTab === 'settings' ? 'active' : ''} onClick={() => {setActiveTab('settings'); setSidebarOpen(false);}}>Settings</a>
          <Link to="/" onClick={() => setSidebarOpen(false)}>Logout</Link>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome, Administrator!</h1>
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

export default AdminDashboard;
