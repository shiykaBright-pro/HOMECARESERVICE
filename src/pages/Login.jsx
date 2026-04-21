import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase, signInWithGoogle, handleOAuthCallback } from '../supabaseClient';
import Navbar from '../components/Navbar';
import './Login.css';
import './Dashboard.css';
import { useEffect } from 'react';

function Login() {
  const navigate = useNavigate();
  const { setCurrentUser, users: contextUsers } = useApp();

  // Complete fallback test credentials with all necessary fields
  const defaultTestUsers = [
    { 
      id: 6, 
      name: 'Test Doctor', 
      email: 'doctor@test.com', 
      password: 'doctor123', 
      role: 'doctor',
      phone: '+237 600000001',
      specialty: 'General Medicine',
      licenseNumber: 'TEST-MD-001',
      status: 'active',
      joinDate: '2026-01-01'
    },
    { 
      id: 7, 
      name: 'Test Nurse', 
      email: 'nurse@test.com', 
      password: 'nurse123', 
      role: 'nurse',
      phone: '+237 600000002',
      licenseNumber: 'TEST-RN-001',
      specialization: 'General Nursing',
      status: 'active',
      joinDate: '2026-01-01'
    },
    { 
      id: 8, 
      name: 'Test Admin', 
      email: 'admin@test.com', 
      password: 'admin123', 
      role: 'admin',
      phone: '+237 600000003',
      status: 'active',
      joinDate: '2026-01-01'
    },
  ];

  // Ensure test users are always available
  const ensureTestUsers = (usersList) => {
    if (!usersList || usersList.length === 0) {
      console.warn("No context users available, using default test users");
      return defaultTestUsers;
    }
    
    // Check if test users exist in the list
    const testUserEmails = ['doctor@test.com', 'nurse@test.com', 'admin@test.com'];
    const hasAllTestUsers = testUserEmails.every(email => usersList.find(u => u.email === email));
    
    if (!hasAllTestUsers) {
      console.warn("Some test users missing from context, merging with defaults");
      // Merge: keep context users but add missing test users
      const missingTestUsers = defaultTestUsers.filter(tu => 
        !usersList.find(u => u.email === tu.email)
      );
      return [...usersList, ...missingTestUsers];
    }
    
    return usersList;
  };

  const users = ensureTestUsers(contextUsers);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    license: '',
    specialty: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle OAuth callback on component mount
  useEffect(() => {
    const checkOAuthSession = async () => {
      try {
        const oauthUser = await handleOAuthCallback();
        if (oauthUser) {
          console.log("OAuth user authenticated:", oauthUser);
          
          // Determine role (default to patient for OAuth users)
          let role = 'patient';
          if (oauthUser.email.includes('doctor')) role = 'doctor';
          if (oauthUser.email.includes('nurse')) role = 'nurse';
          if (oauthUser.email.includes('admin')) role = 'admin';

          const user = {
            id: oauthUser.id,
            email: oauthUser.email,
            name: oauthUser.user_metadata?.full_name || oauthUser.email.split('@')[0],
            role,
          };

          setCurrentUser(user);
          const dashboardMap = {
            patient: '/dashboard/patient',
            doctor: '/dashboard/doctor',
            nurse: '/dashboard/nurse',
            admin: '/dashboard/admin'
          };
          navigate(dashboardMap[role] || '/');
        }
      } catch (err) {
        console.log("No active OAuth session:", err);
      }
    };

    checkOAuthSession();
  }, [setCurrentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || 'Google login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    console.log("Login attempt:", formData.email);

    try {
      // Try Supabase authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      console.log("Response:", data);

      // If Supabase fails with invalid credentials, try local authentication
      if (error) {
        console.error("Supabase login error:", error);
        console.log("Attempting local authentication as fallback...");
        
        // Always try local authentication if Supabase fails
        const localUser = users.find(u => {
          const emailMatch = u.email === formData.email;
          const passwordMatch = u.password === formData.password;
          console.log(`Checking user ${u.email}: email=${emailMatch}, password=${passwordMatch}`);
          return emailMatch && passwordMatch;
        });
        
        if (localUser) {
          console.log("Local user found:", localUser);
          
          const user = {
            id: localUser.id,
            email: localUser.email,
            name: formData.name || localUser.name,
            role: localUser.role,
            ...(formData.license && { license: formData.license }),
            ...(formData.specialty && { specialty: formData.specialty })
          };

          setCurrentUser(user);
          // Navigate to appropriate dashboard based on role
          const dashboardMap = {
            patient: '/dashboard/patient',
            doctor: '/dashboard/doctor',
            nurse: '/dashboard/nurse',
            admin: '/dashboard/admin'
          };
          navigate(dashboardMap[localUser.role.toLowerCase()] || '/');
          return;
        }
        
        // If local auth also fails, show error
        let errorMessage = error.message;
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email before logging in";
        } else if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Incorrect email or password";
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Map role for test users, fallback to patient
        let role = 'patient';
        let name = formData.name || data.user.email.split('@')[0];
        
        if (formData.email === 'doctor@test.com') {
          role = 'doctor';
          name = 'Test Doctor';
        } else if (formData.email === 'nurse@test.com') {
          role = 'nurse';
          name = 'Test Nurse';
        } else if (formData.email === 'admin@test.com') {
          role = 'admin';
          name = 'Test Admin';
        }

        const user = {
          id: data.user.id,
          email: data.user.email,
          name,
          role,
          // Add other fields from form if available
          ...(formData.license && { license: formData.license }),
          ...(formData.specialty && { specialty: formData.specialty })
        };

        setCurrentUser(user);
        // Navigate to appropriate dashboard based on role
        const dashboardMap = {
          patient: '/dashboard/patient',
          doctor: '/dashboard/doctor',
          nurse: '/dashboard/nurse',
          admin: '/dashboard/admin'
        };
        navigate(dashboardMap[role.toLowerCase()] || '/');
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2>Login to HomeCare</h2>
          
          {/* Test Credentials Info */}
          <div style={{backgroundColor: '#f0f8ff', border: '1px solid #4a90e2', borderRadius: '5px', padding: '12px', marginBottom: '20px', fontSize: '13px'}}>
            <strong>🧪 Test Credentials (Development Only):</strong>
            <div style={{marginTop: '8px', lineHeight: '1.5'}}>
              <div><strong>Doctor:</strong> doctor@test.com / doctor123</div>
              <div><strong>Nurse:</strong> nurse@test.com / nurse123</div>
              <div><strong>Admin:</strong> admin@test.com / admin123</div>
            </div>
            <div style={{marginTop: '10px'}}>
              <button type="button" onClick={() => setFormData({...formData, email: 'doctor@test.com', password: 'doctor123'})} style={{marginRight: '5px', padding: '5px 10px', fontSize: '12px'}}>Fill Doctor</button>
              <button type="button" onClick={() => setFormData({...formData, email: 'nurse@test.com', password: 'nurse123'})} style={{marginRight: '5px', padding: '5px 10px', fontSize: '12px'}}>Fill Nurse</button>
              <button type="button" onClick={() => setFormData({...formData, email: 'admin@test.com', password: 'admin123'})} style={{padding: '5px 10px', fontSize: '12px'}}>Fill Admin</button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="form-group">
              <label>License Number (Optional for test users)</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleChange}
                placeholder="Enter license number"
              />
            </div>
            <div className="form-group">
              <label>Specialty (Optional for test users)</label>
              <select 
                name="specialty" 
                value={formData.specialty}
                onChange={handleChange}
              >
                <option value="">Select Specialty</option>
                <option value="general">General Medicine</option>
                <option value="cardiology">Cardiology</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="dermatology">Dermatology</option>
                <option value="neurology">Neurology</option>
              </select>
            </div>

            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="social-login">
            <p>or continue with</p>
            <button type="button" className="btn-google-login" onClick={handleGoogleLogin} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26.71-.66 1.32-1.13 1.85v2.74h1.83c1.08-.98 1.7-2.42 1.7-4.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-1.83-1.42c-.98.66-2.23.99-3.78.99-2.92 0-5.4-1.98-6.28-4.66H4.08v1.44c0 3.73 3.39 6.64 6.92 6.64z" fill="#34A853"/>
                <path d="M5.72 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H4.08C3.11 8.47 2.43 9.94 2.43 11.5s.68 3.03 1.83 4.25l1.46-1.16z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l1.15-1.15C17.46 4.38 14.97 3 12 3c-3.53 0-6.53 2.24-7.73 5.36H7.72c.88-2.68 3.36-4.62 6.28-4.62z" fill="#EA4334"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="login-footer">
            Login to HomeCare
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

