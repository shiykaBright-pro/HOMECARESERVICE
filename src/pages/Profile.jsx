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
    specialty: '',
    // Patient-specific fields
    age: '',
    gender: '',
    medical_history: ''
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

      // Check if user is authenticated with Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log('User not authenticated, using local data only');
        // Use local currentUser data
        setProfileData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          role: currentUser.role || '',
          license: currentUser.licenseNumber || '',
          specialty: currentUser.specialty || '',
          age: currentUser.age || '',
          gender: currentUser.gender || '',
          medical_history: currentUser.medical_history || ''
        });
        setLoading(false);
        return;
      }

      // Load from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Error fetching profile:', profileError);
      }

      let roleSpecificData = {};

      // Load role-specific data
      if (currentUser.role === 'patient') {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (patientError && patientError.code !== 'PGRST116') {
          console.warn('Error fetching patient data:', patientError);
        }

        roleSpecificData = {
          age: patientData?.age || '',
          gender: patientData?.gender || '',
          medical_history: patientData?.medical_history || ''
        };
      } else if (currentUser.role === 'doctor') {
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (doctorError && doctorError.code !== 'PGRST116') {
          console.warn('Error fetching doctor data:', doctorError);
        }

        roleSpecificData = {
          specialty: doctorData?.specialty || '',
          license: doctorData?.license || ''
        };
      }

      // Combine all data
      setProfileData({
        name: profile?.name || currentUser.name || '',
        email: currentUser.email || '',
        role: profile?.role || currentUser.role || '',
        license: roleSpecificData.license || profile?.license || currentUser.licenseNumber || '',
        specialty: roleSpecificData.specialty || profile?.specialty || currentUser.specialty || '',
        age: roleSpecificData.age || '',
        gender: roleSpecificData.gender || '',
        medical_history: roleSpecificData.medical_history || ''
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

      // Check if user is authenticated with Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        // User is not Supabase authenticated, save locally only
        console.log('User not Supabase authenticated, saving locally only');

        // Update currentUser in context
        const updatedUser = {
          ...currentUser,
          name: profileData.name.trim(),
          licenseNumber: profileData.license.trim(),
          specialty: profileData.specialty.trim()
        };
        setCurrentUser(updatedUser);

        setSuccess('Profile updated locally! (Not connected to database)');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
        setSaving(false);
        return;
      }

// User is Supabase authenticated, save to database
      console.log('Supabase user:', user.id);
      console.log('Form data for insert:', {
        id: user.id,
        name: profileData.name.trim(),
        email: currentUser.email,
        role: currentUser.role,
        license: profileData.license.trim() || null,
        specialty: profileData.specialty.trim() || null
      });

      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name.trim(),
          email: currentUser.email,
          role: currentUser.role,
          license: profileData.license.trim() || null,
          specialty: profileData.specialty.trim() || null
        });

      console.log('Upsert result:', { data: upsertData, error: upsertError });

      if (upsertError) {
        console.error('Supabase upsert error:', upsertError);
        setError(`Database error: ${upsertError.message}`);
        throw upsertError;
      }

      console.log('✅ Profile saved to database successfully!');

      // Update currentUser in context
      const updatedUser = {
        ...currentUser,
        name: profileData.name.trim(),
        licenseNumber: profileData.license.trim(),
        specialty: profileData.specialty.trim()
      };
      setCurrentUser(updatedUser);

      setSuccess('Profile updated successfully in database!');

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
                <select
                  id="role"
                  name="role"
                  value={profileData.role.toLowerCase()}
                  onChange={handleInputChange}
                  className="role-select"
                >
                  <option value="">Select Role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="admin">Admin</option>
                </select>
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