import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { auth, googleProvider } from '../lib/firebase.js';
import { signInWithPopup } from 'firebase/auth';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    specialty: '',
    licenseNumber: ''
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

  // Validate license number format
  const validateLicense = (license, role) => {
    if (!license || license.trim() === '') {
      return { valid: false, message: 'License number is required for healthcare providers' };
    }

    const licenseUpper = license.toUpperCase().trim();

    if (role === 'doctor') {
      const mdPattern = /^MD-\d{5,}$/i;
      const drPattern = /^DR-\d{5,}$/i;
      const generalPattern = /^[A-Z]{2,3}-\d{5,}$/i;

      if (mdPattern.test(licenseUpper) || drPattern.test(licenseUpper) || generalPattern.test(licenseUpper)) {
        return { valid: true };
      }

      if (/^\d{6,10}$/.test(license)) {
        return { valid: true };
      }

      return {
        valid: false,
        message: 'Invalid license format. Use: MD-12345, DR-12345, or 6-10 digit number'
      };
    }

    if (role === 'nurse') {
      const rnPattern = /^RN-\d{5,}$/i;
      const enPattern = /^EN-\d{5,}$/i;
      const generalPattern = /^[A-Z]{2,3}-\d{5,}$/i;

      if (rnPattern.test(licenseUpper) || enPattern.test(licenseUpper) || generalPattern.test(licenseUpper)) {
        return { valid: true };
      }

      if (/^\d{6,10}$/.test(license)) {
        return { valid: true };
      }

      return {
        valid: false,
        message: 'Invalid license format. Use: RN-12345, EN-12345, or 6-10 digit number'
      };
    }

    return { valid: true };
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    const result = await loginWithGoogle();
    setLoading(false);
    if (result.success) {
      navigate('/dashboard/patient');
    } else {
      setError(result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.role === 'doctor' || formData.role === 'nurse') {
      const licenseValidation = validateLicense(formData.licenseNumber, formData.role);
      if (!licenseValidation.valid) {
        setError(licenseValidation.message);
        setLoading(false);
        return;
      }
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      specialty: formData.specialty,
      licenseNumber: formData.licenseNumber
    };

    const result = register(userData);
    if (result.success) {
      switch (userData.role) {
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
          navigate('/dashboard/patient');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="register-page">
      <Navbar />
      <div className="register-container">
        <div className="register-box">
          <h2>Register with HomeCare</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Register as</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.role === 'doctor' && (
              <>
                <div className="form-group">
                  <label>Specialty</label>
                  <select name="specialty" value={formData.specialty} onChange={handleChange}>
                    <option value="">Select Specialty</option>
                    <option value="general">General Medicine</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="neurology">Neurology</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter your medical license number"
                  />
                </div>
              </>
            )}

            {formData.role === 'nurse' && (
              <div className="form-group">
                <label>Nursing License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter your nursing license number"
                />
              </div>
            )}

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="btn-register-submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {formData.role === 'patient' && (
            <div className="google-login">
              <p>Or sign up with</p>
              <button 
                type="button" 
                className="btn-google-login"
                onClick={handleGoogleRegister}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" className="google-icon">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          )}

          <p className="register-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;