import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import './Dashboard.css';

function Profile() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    license: '',
    specialty: ''
  });

  // Authentication check
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  // Load profile data
  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      // Try to fetch from Supabase profiles table
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        console.warn('Error fetching profile:', fetchError);
      }

      // Use Supabase data if available, otherwise fallback to currentUser
      setProfileData({
        name: profile?.name || currentUser.name || '',
        email: currentUser.email || '',
        role: profile?.role || currentUser.role || '',
        license: profile?.license || currentUser.licenseNumber || '',
        specialty: profile?.specialty || currentUser.specialty || ''
      });

    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!profileData.name.trim()) {
      setError('Name is required');
      return false;
    }

    // License and specialty validation for doctors/nurses
    if ((profileData.role === 'doctor' || profileData.role === 'nurse')) {
      if (!profileData.license.trim()) {
        setError('License number is required for healthcare professionals');
        return false;
      }
      if (profileData.role === 'doctor' && !profileData.specialty.trim()) {
        setError('Specialty is required for doctors');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Update profile in Supabase
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          name: profileData.name.trim(),
          email: currentUser.email,
          role: currentUser.role,
          license: profileData.license.trim(),
          specialty: profileData.specialty.trim(),
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        throw upsertError;
      }

      // Update currentUser in context
      const updatedUser = {
        ...currentUser,
        name: profileData.name.trim(),
        licenseNumber: profileData.license.trim(),
        specialty: profileData.specialty.trim()
      };
      setCurrentUser(updatedUser);

      setSuccess('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </header>

        <div className="profile-container">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>Personal Information</h2>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  readOnly
                  className="readonly-input"
                />
                <small style={{color: '#666', fontSize: '0.9rem'}}>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={profileData.role}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>

            {(profileData.role === 'doctor' || profileData.role === 'nurse') && (
              <div className="form-section">
                <h2>Professional Information</h2>

                <div className="form-group">
                  <label htmlFor="license">License Number *</label>
                  <input
                    type="text"
                    id="license"
                    name="license"
                    value={profileData.license}
                    onChange={handleInputChange}
                    placeholder="Enter your license number"
                    required
                  />
                </div>

                {profileData.role === 'doctor' && (
                  <div className="form-group">
                    <label htmlFor="specialty">Medical Specialty *</label>
                    <select
                      id="specialty"
                      name="specialty"
                      value={profileData.specialty}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Specialty</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Gynecology">Gynecology</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="Dentistry">Dentistry</option>
                    </select>
                  </div>
                )}

                {profileData.role === 'nurse' && (
                  <div className="form-group">
                    <label htmlFor="specialty">Specialization</label>
                    <select
                      id="specialty"
                      name="specialty"
                      value={profileData.specialty}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Specialization</option>
                      <option value="General Nursing">General Nursing</option>
                      <option value="Pediatric Nursing">Pediatric Nursing</option>
                      <option value="Critical Care">Critical Care</option>
                      <option value="Home Nursing">Home Nursing</option>
                      <option value="Wound Care">Wound Care</option>
                      <option value="Mental Health">Mental Health</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;