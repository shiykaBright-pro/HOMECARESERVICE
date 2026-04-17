import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ❌ removed useApp (not needed anymore)
import Navbar from '../components/Navbar';
import './Register.css';

function Register() {
  const navigate = useNavigate();

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

    try {
      const res = await fetch("http://localhost/hospital-api/auth/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      console.log(data);

      if (data.message) {
        // Redirect based on role
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
        setError(data.error);
      }

    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
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

          <p className="register-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;