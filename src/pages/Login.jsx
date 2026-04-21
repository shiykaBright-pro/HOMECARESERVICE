import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import './Login.css';
import './Dashboard.css';

function Login() {
  const navigate = useNavigate();
  const { setCurrentUser, googleLogin } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: formData.email, 
        password: formData.password 
      });

      if (error) throw error;

      // Fetch full user profile and match with local users or use metadata
      const { data: { user } } = data;
      const localUser = users.find(u => u.email === user.email);
      
      const fullUser = localUser || {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        role: user.user_metadata?.role || 'patient',
        phone: user.user_metadata?.phone || '',
        status: 'active'
      };

      setCurrentUser(fullUser);

      // Redirect based on role
      let route;
      switch (fullUser.role) {
        case 'doctor':
          route = '/dashboard/doctor';
          break;
        case 'nurse':
          route = '/dashboard/nurse';
          break;
        case 'admin':
          route = '/dashboard/admin';
          break;
        default:
          route = '/dashboard/patient';
      }
      navigate(route, { replace: true });

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
              <br/>
              <div><em>Or use your real Supabase users with role in user_metadata!</em></div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
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

            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="social-login">
            <p>or continue with</p>
            <button type="button" className="btn-google-login" onClick={googleLogin}>
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
            Login only - no registration
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

