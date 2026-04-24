import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Dashboard.css'; // Reuse dashboard styling

function NewPrescription() {
  const navigate = useNavigate();
  const { currentUser, users, appointments, addPrescription } = useApp();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });

  // Get doctor's patients from appointments
  const doctorAppointments = appointments.filter(apt => apt.providerId === currentUser?.id);
  const patientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))];
  const doctorPatients = users.filter(user => 
    patientIds.includes(user.id) && user.role === 'patient'
  );

  // Auth check - redirect if not doctor
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'doctor') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const newMeds = formData.medications.filter((_, i) => i !== index);
      setFormData({ ...formData, medications: newMeds });
    }
  };

  const updateMedication = (index, field, value) => {
    const newMeds = [...formData.medications];
    newMeds[index][field] = value;
    setFormData({ ...formData, medications: newMeds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('SUBMIT CLICKED!');
    
    console.log('Form validation state:', {
      loading,
      hasPatients: doctorPatients.length > 0,
      hasPatientId: !!formData.patientId,
      hasValidMeds: formData.medications.some(med => med.name.trim())
    });
    
    if (loading) return;
    
    console.log('=== NEW PRESCRIPTION FORM SUBMIT ===');
    console.log('Form data:', formData);
    console.log('Current user:', currentUser);
    
    setLoading(true);
    setError('');

    // Validation
    const validMeds = formData.medications.filter(med => med.name.trim());
    if (validMeds.length === 0) {
      setError('At least one medication name is required');
      setLoading(false);
      return;
    }
    if (!formData.patientId || doctorPatients.find(p => p.id == formData.patientId) === undefined) {
      setError('Please select a valid patient');
      setLoading(false);
      return;
    }

    try {
      console.log('Calling addPrescription from context...');
      
      await addPrescription({
        patientId: parseInt(formData.patientId),
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        medications: validMeds,
        notes: formData.notes.trim()
      });
      
      console.log('✅ addPrescription completed');
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/doctor'), 2000);
      
    } catch (err) {
      console.error('addPrescription failed:', err);
      setError(`Failed to create prescription: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="dashboard">
        <main className="dashboard-content">
          <div className="form-modal success-message">
            <h2>✅ Prescription Created Successfully!</h2>
            <p>The prescription has been sent to your patient.</p>
            <div className="status confirmed">Redirecting to dashboard...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>New Prescription</h1>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/dashboard/doctor')}
            aria-label="Back to dashboard"
          >
            ← Back
          </button>
        </header>

        <div className="form-modal">
          <form onSubmit={handleSubmit}>
            {/* Patient Selection */}
            <div className="form-group">
              <label htmlFor="patient">Patient *</label>
              <select 
                id="patient"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
                disabled={loading}
              >
                <option value="">Select Patient</option>
                {doctorPatients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.phone})
                  </option>
                ))}
              </select>
              {doctorPatients.length === 0 && (
                <p className="empty-state">
                  No patients assigned yet. Create appointments first.
                </p>
              )}
            </div>

            {/* Medications */}
            <div className="form-section">
              <label>Medications *</label>
              {formData.medications.map((med, index) => (
                <div key={index} className="medication-row">
                  <input
                    type="text"
                    placeholder="Medication name *"
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    required
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g., 500mg)"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g., twice daily)"
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g., 7 days)"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    disabled={loading}
                  />
                  {formData.medications.length > 1 && (
                    <button 
                      type="button" 
                      className="btn-remove"
                      onClick={() => removeMedication(index)}
                      disabled={loading}
                      aria-label="Remove medication"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                className="btn-add" 
                onClick={addMedication}
                disabled={loading}
              >
                + Add Medication
              </button>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special instructions..."
                rows="3"
                disabled={loading}
              />
            </div>

{error && (
  <div className="error-message" style={{ 
    background: '#fee', 
    color: '#c33', 
    padding: '12px', 
    borderRadius: '8px', 
    borderLeft: '4px solid #c33', 
    margin: '16px 0' 
  }}>
    <strong>❌ Error:</strong> {error}
    <br />
    <small>Check console for details. Prescriptions table may need RLS policies.</small>
  </div>
)}

            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button 
                type="submit" 
                className="btn-submit btn-primary"
                disabled={loading}
                aria-label="Create prescription"
                style={{
                  flex: '1',
                  minHeight: '44px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: loading ? '#ccc' : '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => !loading && !e.currentTarget.disabled && (
                  e.target.style.background = '#357abd',
                  e.target.style.transform = 'translateY(-1px)',
                  e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.4)'
                )}
                onMouseOut={(e) => (
                  e.target.style.background = '#4a90e2',
                  e.target.style.transform = 'translateY(0)',
                  e.target.style.boxShadow = '0 2px 8px rgba(74, 144, 226, 0.3)'
                )}
              >
                {loading ? 'Creating...' : 'Create Prescription'}
              </button>
              <button 
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/dashboard/doctor')}
                disabled={loading}
                style={{
                  minHeight: '44px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  flex: loading ? '1' : 'auto'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default NewPrescription;

