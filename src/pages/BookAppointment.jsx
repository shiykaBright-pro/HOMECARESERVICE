import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function BookAppointment() {
  const { currentUser, providers, addAppointment } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState('');
  // Removed local providers state; now using providers from context
  const [formData, setFormData] = useState({
    providerId: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const servicePrices = {
    'General Consultation': 50,
    'Nursing Care': 40,
    'Physical Therapy': 60,
    'Medical Tests': 30,
    'Elderly Care': 80,
    'Post-Surgery Care': 70
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Check providers loading status
    if (providers && providers.length > 0) {
      console.log('✅ Providers loaded:', providers);
      setProvidersError('');
      setProvidersLoading(false);
    } else if (providers) {
      console.warn('⚠️ Providers array is empty');
      setProvidersError('No providers available');
      setProvidersLoading(false);
    } else {
      console.log('⏳ Waiting for providers to load...');
      setProvidersLoading(true);
    }
    
    setLoading(false);
  }, [currentUser, providers, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields first
    const missingFields = [];
    if (!formData.providerId) missingFields.push('Provider');
    if (!formData.service) missingFields.push('Service Type');
    if (!formData.date) missingFields.push('Date');
    if (!formData.time) missingFields.push('Time');

    if (missingFields.length > 0) {
      const errorMsg = `Please fill all required fields: ${missingFields.join(', ')}`;
      setError(errorMsg);
      console.warn('❌ Validation Error:', errorMsg);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // DEBUG LOGGING - User data verification
      console.log('========== APPOINTMENT SUBMISSION DEBUG ==========');
      console.log('📋 USER DATA:');
      console.log('  - User ID (user.id):', currentUser?.id);
      console.log('  - User Email:', currentUser?.email);
      console.log('  - User Name:', currentUser?.name);
      console.log('  - User Role:', currentUser?.role);
      console.log('  - User Object:', JSON.stringify(currentUser, null, 2));

      // Validate user data
      if (!currentUser?.id) {
        throw new Error('❌ CRITICAL: User ID is missing or undefined. Cannot proceed with appointment.');
      }

      // DEBUG LOGGING - Form data verification
      console.log('📝 FORM DATA:');
      console.log('  - Provider ID:', formData.providerId);
      console.log('  - Service Type:', formData.service);
      console.log('  - Date:', formData.date);
      console.log('  - Time:', formData.time);
      console.log('  - Notes:', formData.notes);
      console.log('  - Form Data Object:', JSON.stringify(formData, null, 2));

      // Find provider and validate
      const provider = providers.find(u => u.id === formData.providerId);
      if (!provider) {
        throw new Error(`❌ Provider not found: ${formData.providerId}. Available providers: ${providers.map(p => p.id).join(', ')}`);
      }
      console.log('✅ Provider found:', provider.name);

      // Build appointment object for Supabase
      const newAppointment = {
        patientId: currentUser.id,
        patientName: currentUser.name || 'Unknown Patient',
        providerId: formData.providerId,
        providerName: provider.name || 'To be assigned',
        service: formData.service,
        date: formData.date,
        time: formData.time,
        notes: formData.notes || null,
        type: 'home',
        price: servicePrices[formData.service] || 50
      };

      console.log('💾 APPOINTMENT OBJECT TO INSERT:');
      console.log(JSON.stringify(newAppointment, null, 2));

      // Verify all required fields are present and valid
      const requiredFields = {
        patientId: newAppointment.patientId,
        providerId: newAppointment.providerId,
        service: newAppointment.service,
        date: newAppointment.date,
        time: newAppointment.time
      };

      console.log('🔍 FIELD VALIDATION:');
      Object.entries(requiredFields).forEach(([field, value]) => {
        const isValid = value !== null && value !== undefined && value !== '';
        const status = isValid ? '✅' : '❌';
        console.log(`  ${status} ${field}: ${value} (Type: ${typeof value})`);
      });

      const invalidFields = Object.entries(requiredFields)
        .filter(([_, value]) => value === null || value === undefined || value === '')
        .map(([field]) => field);

      if (invalidFields.length > 0) {
        throw new Error(`❌ Invalid fields: ${invalidFields.join(', ')} - these cannot be empty.`);
      }

      console.log('📤 Calling addAppointment() to insert into Supabase...');
      await addAppointment(newAppointment);
      
      console.log('✅ Appointment successfully created!');
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/patient'), 2000);
    } catch (err) {
      const errorMessage = err.message || JSON.stringify(err, null, 2);
      setError(errorMessage);
      console.error('❌ APPOINTMENT CREATION ERROR:');
      console.error('  Message:', err.message);
      console.error('  Code:', err.code);
      console.error('  Details:', err.details);
      console.error('  Status:', err.status);
      console.error('  Full Error:', JSON.stringify(err, null, 2));
      console.log('==============================================');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button className="btn-back" onClick={() => navigate('/dashboard/patient')}>
            ← Back to Dashboard
          </button>
          <h1>Book Appointment</h1>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="booking-form-section">
          <h2>Schedule New Appointment</h2>
          {success ? (
            <div className="success-message" style={{textAlign: 'center', padding: '2rem'}}>
              <h3>✅ Appointment Booked Successfully!</h3>
              <p>Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="booking-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Provider *</label>
                  <select name="providerId" value={formData.providerId} onChange={handleChange} required disabled={providersLoading || (providers && providers.length === 0)}>
                    <option value="">
                      {providersLoading ? '⏳ Loading providers...' : providers && providers.length > 0 ? 'Select Provider' : '❌ No providers available'}
                    </option>
                    {!providersLoading && providers && providers.length > 0 && (providers || []).map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} {provider.role === 'doctor' ? `(Dr. - ${provider.specialty || 'General'})` : '(Nurse)'}
                      </option>
                    ))}
                  </select>
                  {providersError && <div style={{color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem'}}>⚠️ {providersError}</div>}
                  {!providersLoading && providers && providers.length === 0 && (
                    <div style={{color: '#ea580c', fontSize: '0.875rem', marginTop: '0.5rem'}}>
                      No providers found. Check browser console for errors.
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Service Type *</label>
                  <select name="service" value={formData.service} onChange={handleChange} required>
                    <option value="">Select Service</option>
                    <option value="General Consultation">General Consultation (XAF 50)</option>
                    <option value="Nursing Care">Nursing Care (XAF 40)</option>
                    <option value="Physical Therapy">Physical Therapy (XAF 60)</option>
                    <option value="Medical Tests">Medical Tests (XAF 30)</option>
                    <option value="Elderly Care">Elderly Care (XAF 80)</option>
                    <option value="Post-Surgery Care">Post-Surgery Care (XAF 70)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <select name="time" value={formData.time} onChange={handleChange} required>
                    <option value="">Select Time</option>
                    <option value="9:00 AM">Morning (9AM - 12PM)</option>
                    <option value="12:00 PM">Afternoon (12PM - 4PM)</option>
                    <option value="4:00 PM">Evening (4PM - 7PM)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  placeholder="Describe symptoms or special requirements" 
                  rows="3"
                />
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default BookAppointment;

