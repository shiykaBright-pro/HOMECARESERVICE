import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function BookAppointment() {
  const { currentUser, users, addAppointment } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
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
    if (currentUser) {
      const availableProviders = users.filter(u => u.role === 'doctor' || u.role === 'nurse');
      setProviders(availableProviders);
      setLoading(false);
    } else {
      navigate('/login');
    }
  }, [currentUser, users, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.providerId || !formData.service || !formData.date || !formData.time) {
      setError('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const provider = providers.find(u => u.id === parseInt(formData.providerId));
      const newAppointment = {
        patientId: currentUser.id,
        patientName: currentUser.name,
        providerId: parseInt(formData.providerId),
        providerName: provider?.name || 'To be assigned',
        service: formData.service,
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        type: 'home',
        price: servicePrices[formData.service] || 50
      };

      await addAppointment(newAppointment);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/patient'), 2000);
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err.details || err.message || 'Booking failed. Please try again. Check console for details.';
      setError(errorMessage);
      console.error('Full Supabase error:', JSON.stringify(err, null, 2));
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
                  <select name="providerId" value={formData.providerId} onChange={handleChange} required>
                    <option value="">Select Provider</option>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} ({provider.role === 'doctor' ? provider.specialty : 'Nurse'})
                      </option>
                    ))}
                  </select>
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

