import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import './Login.css';
import './Dashboard.css';

function Login() {
  const navigate = useNavigate();
  const { login, users } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
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
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = login(formData.email, formData.password);
    
    if (result.success) {
      switch(result.user.role) {
        case 'patient':
          navigate('/dashboard/patient');
          break;
        case 'doctor':
          navigate('/dashboard/doctor');
          break;
        case 'nurse':
          navigate('/dashboard/nurse');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/'); // fallback  
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  // Quick login helper for demo
  const handleQuickLogin = (userRole) => {
    const demoUser = users.find(u => u.role === userRole);
    if (demoUser) {
      const result = login(demoUser.email, demoUser.password);
      if (result.success) {
        switch(result.user.role) {
          case 'patient':
            navigate('/dashboard/patient');
            break;
          case 'doctor':
            navigate('/dashboard/doctor');
            break;
          case 'nurse':
            navigate('/dashboard/nurse');
            break;
          case 'admin':
            navigate('/dashboard/admin');
            break;
        }
      }
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
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
              />
            </div>
            <div className="form-group">
              <label>Login as</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          {/* Quick Login for Demo */}
          <div className="quick-login">
            <p>Quick Demo Login:</p>
            <div className="quick-login-buttons">
              <button onClick={() => handleQuickLogin('patient')} className="btn-quick">Patient</button>
              <button onClick={() => handleQuickLogin('doctor')} className="btn-quick">Doctor</button>
              <button onClick={() => handleQuickLogin('nurse')} className="btn-quick">Nurse</button>
              <button onClick={() => handleQuickLogin('admin')} className="btn-quick">Admin</button>
            </div>
          </div>
          
          <p className="login-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
