import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import './Login.css';
import './Dashboard.css';

function Login() {
  const navigate = useNavigate();
  const { login, setCurrentUser, currentUser } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    license: '',
    specialty: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  // Handle OAuth callback on component mount
  useEffect(() => {
    let isMounted = true;

    const handleAuthCallback = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }
        
        if (data.session && data.session.user) {
          // Create patient user object for Google OAuth users
          const oauthUser = {
            id: data.session.user.id || Date.now(),
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email,
            role: 'patient',
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0],
            phone: data.session.user.phone || '',
            bloodType: 'Unknown',
            allergies: 'None',
            dob: '',
            address: '',
            emergencyContact: { name: '', phone: '', relation: '' },
            medicalHistory: []
          };
          
          setCurrentUser(oauthUser);
          navigate('/dashboard/patient');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
      }
    };

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, setCurrentUser]);

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser && currentUser.role === 'patient') {
      navigate('/dashboard/patient');
    }
  }, [currentUser, navigate]);

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

    if (!formData.email || !formData.password || !formData.license || !formData.specialty) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = login(formData.email, formData.password, formData.license, formData.specialty);
    
    if (result.success) {
      const route = `/dashboard/${result.user.role}`;
      navigate(route);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async (e) => {
    e?.preventDefault();
    
    try {
      setError('');
      setIsOAuthLoading(true);
      
      const redirectURL = `${window.location.origin}/login`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        setError(error.message || 'Google login failed. Please try again.');
        setIsOAuthLoading(false);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err?.message || 'An error occurred during Google login. Please try again.');
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2>Login to HomeCare</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
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
              <label>License Number</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleChange}
                placeholder="Enter license number"
                required
              />
            </div>
            <div className="form-group">
              <label>Specialty</label>
              <select 
                name="specialty" 
                value={formData.specialty}
                onChange={handleChange}
                required
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
            <button 
              type="button" 
              className="btn-google-login" 
              onClick={handleGoogleLogin}
              disabled={isOAuthLoading || loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26.71-.66 1.32-1.13 1.85v2.74h1.83c1.08-.98 1.7-2.42 1.7-4.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-1.83-1.42c-.98.66-2.23.99-3.78.99-2.92 0-5.4-1.98-6.28-4.66H4.08v1.44c0 3.73 3.39 6.64 6.92 6.64z" fill="#34A853"/>
                <path d="M5.72 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H4.08C3.11 8.47 2.43 9.94 2.43 11.5s.68 3.03 1.83 4.25l1.46-1.16z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l1.15-1.15C17.46 4.38 14.97 3 12 3c-3.53 0-6.53 2.24-7.73 5.36H7.72c.88-2.68 3.36-4.62 6.28-4.62z" fill="#EA4334"/>
              </svg>
              {isOAuthLoading ? 'Authenticating...' : 'Continue with Google'}
            </button>
          </div>

          <p className="login-footer">
            Login only - no registration
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

