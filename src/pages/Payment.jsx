import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Payment.css'; // Will create next

function Payment() {
  const navigate = useNavigate();
  const { currentUser, appointments, updateAppointment } = useApp();
  const [unpaidAppointments, setUnpaidAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [currency, setCurrency] = useState('XAF');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const currencies = [
    { code: 'XAF', symbol: 'FCFA', rate: 1 },
    { code: 'USD', symbol: '$', rate: 0.00016 },
    { code: 'EUR', symbol: '€', rate: 0.00015 }
  ];

  useEffect(() => {
    if (currentUser) {
      const unpaid = appointments.filter(apt => 
        apt.patientId === currentUser.id && apt.payment_status === 'pending'
      );
      setUnpaidAppointments(unpaid);
      setLoading(false);
    }
  }, [appointments, currentUser]);

  const getAmountInCurrency = (price, currencyCode) => {
    const curr = currencies.find(c => c.code === currencyCode);
    const converted = price * curr.rate;
    return Math.round(converted * 100) / 100;
  };

  const handlePayNow = async (apt) => {
    setSelectedAppointment(apt);
    setPaymentMethod('momo');
    setCurrency('XAF');
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedAppointment) return;

    setIsProcessing(true);
    setMessage('');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 80% success rate
    const success = Math.random() > 0.2;

    try {
      if (success) {
        await updateAppointment(selectedAppointment.id, {
          payment_status: 'paid',
          status: 'Confirmed'
        });
        setMessage('Payment successful! Appointment confirmed.');
        // Refresh list
        const updatedUnpaid = unpaidAppointments.filter(a => a.id !== selectedAppointment.id);
        setUnpaidAppointments(updatedUnpaid);
      } else {
        await updateAppointment(selectedAppointment.id, {
          payment_status: 'failed'
        });
        setMessage('Payment failed. Please try again.');
      }
    } catch (error) {
      setMessage('Payment error. Please try again.');
    }

    setIsProcessing(false);
    setTimeout(() => {
      setShowPaymentModal(false);
      setSelectedAppointment(null);
    }, 2000);
  };

  const getCurrencySymbol = (code) => currencies.find(c => c.code === code)?.symbol || 'FCFA';

  const totalUnpaid = unpaidAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);

  if (loading) return <div className="loading">Loading payments...</div>;
  if (!currentUser) return <div className="loading">Please log in</div>;

  return (
    <div className="dashboard payment-page">
      <header className="dashboard-header">
        <div>
          <button className="btn-back" onClick={() => navigate('/dashboard/patient')}>
            ← Back to Dashboard
          </button>
          <h1>Payments</h1>
        </div>
        <div className="profile-icon-container">
          <div className="profile-avatar-small">{currentUser.name?.charAt(0) || 'P'}</div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="stats-grid">
          <div className="stat-card">
            <h3>Unpaid Appointments</h3>
            <p className="stat-number">{unpaidAppointments.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Amount Due</h3>
            <p className="stat-number">{totalUnpaid.toLocaleString()} FCFA</p>
          </div>
        </section>

        {unpaidAppointments.length === 0 ? (
          <section>
            <p className="no-data">No pending payments. All appointments are paid!</p>
          </section>
        ) : (
          <section>
            <h2>Pending Payments</h2>
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaidAppointments.map(apt => (
                  <tr key={apt.id}>
                    <td>{apt.providerName}</td>
                    <td>{apt.service}</td>
                    <td>{apt.date} at {apt.time}</td>
                    <td>{apt.price?.toLocaleString()} FCFA</td>
                    <td>
                      <span className="status pending">{apt.payment_status}</span>
                    </td>
                    <td>
                      <button className="btn-book" onClick={() => handlePayNow(apt)}>
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {showPaymentModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content payment-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pay for {selectedAppointment.service}</h3>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-details">
                <p><strong>Provider:</strong> {selectedAppointment.providerName}</p>
                <p><strong>Date:</strong> {selectedAppointment.date} at {selectedAppointment.time}</p>
                <p className="amount">
                  <strong>Total:</strong> {getAmountInCurrency(selectedAppointment.price, currency)} {getCurrencySymbol(currency)}
                </p>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="momo">Mobile Money (MoMo)</option>
                  <option value="card">Bank/Card</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {message && <div className={`message ${isProcessing ? 'loading' : message.includes('successful') ? 'success' : 'error'}`}>
                {message}
              </div>}

              <button 
                className="btn-submit" 
                onClick={handleProcessPayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;

