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
    if (loading) return; // Prevent duplicates
    
    console.log('=== NEW PRESCRIPTION FORM SUBMIT ===');
    console.log('Form data:', formData);
    console.log('Current user:', currentUser);
    console.log('Supabase config:', { url: import.meta.env.VITE_SUPABASE_URL, hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY });
    
    setLoading(true);
    setError('');

    // Validation
    const validMeds = formData.medications.filter(med => med.name.trim());
    if (validMeds.length === 0) {
      setError('At least one medication is required');
      setLoading(false);
      return;
    }
    if (!formData.patientId) {
      setError('Please select a patient');
      setLoading(false);
      return;
    }

    try {
      // Try Supabase insert first
      console.log('Attempting Supabase insert...');
      const supabaseData = {
        patient_id: formData.patientId,
        doctor_id: currentUser.id,
        doctor_name: currentUser.name,
        medications: validMeds, // JSON array
        notes: formData.notes.trim() || null,
        date: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      
      console.log('Supabase data payload:', supabaseData);
      
      const { data, error } = await supabase
        .from('prescriptions')
        .insert(supabaseData)
        .select()
        .single();
      
      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Supabase insert failed:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log('✅ Supabase prescription created:', data);
      
      // Also update local context for UI sync
      await addPrescription({
        patientId: parseInt(formData.patientId),
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        medications: validMeds,
        notes: formData.notes.trim()
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/doctor'), 2000);
      
    } catch (err) {
      console.error('Full prescription error:', err);
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

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading || doctorPatients.length === 0 || !formData.patientId}
              >
                {loading ? 'Creating...' : 'Create Prescription'}
              </button>
              <button 
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/dashboard/doctor')}
                disabled={loading}
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

