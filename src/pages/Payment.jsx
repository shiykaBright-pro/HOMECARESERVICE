import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './Payment.css';

function Payment() {
  const { currentUser, appointments, updateAppointment } = useApp();
  const navigate = useNavigate();
  const [unpaidAppointments, setUnpaidAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [currency, setCurrency] = useState('XAF');
  const [customAmount, setCustomAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState('');

  // New payment details states
  const [momoNumber, setMomoNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [touched, setTouched] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const currencies = {
    'XAF': 1,
    'USD': 0.0016,
    'EUR': 0.0015
  };

  const paymentMethods = [
    { id: 'momo', name: 'Mobile Money (MoMo)', icon: '💰' },
    { id: 'card', name: 'Bank/Card Payment', icon: '💳' }
  ];

  useEffect(() => {
    if (currentUser) {
      const unpaid = appointments.filter(apt => 
        apt.patientId === currentUser.id && apt.payment_status === 'pending'
      );
      setUnpaidAppointments(unpaid);
      setLoading(false);
    } else {
      navigate('/login');
    }
  }, [currentUser, appointments, navigate]);

  const handlePayNow = (apt) => {
    setSelectedAppointment(apt);
    setShowPaymentModal(true);
    setError('');
  };

  const handleProcessPayment = async () => {
    if (!selectedAppointment) return;

    // Clear previous errors
    setError('');
    setFormErrors({});

    // Validate amount
    if (hasFormErrors()) return;

    setProcessing(true);
    setPaymentResult(null);

    try {
      // Log payment details
      const paymentDetails = {
        method: paymentMethod,
        amount: getFinalAmount(),
        currency,
        ...(paymentMethod === 'momo' && { momoNumber: momoNumber.trim() }),
        ...(paymentMethod === 'card' && ({
          cardholder: cardName.trim(),
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiry: cardExpiry,
          cvv: cardCVV
        }))
      };
      console.log('Payment Details:', paymentDetails);

      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success (90% chance)
      const success = Math.random() > 0.1;

      if (success) {
        updateAppointment(selectedAppointment.id, {
          payment_status: 'paid',
          status: 'Confirmed'
        });
        setPaymentResult('success');
      } else {
        updateAppointment(selectedAppointment.id, {
          payment_status: 'failed'
        });
        setPaymentResult('failed');
        setError('Payment failed. Please try again.');
      }

      // Refresh list
      const updatedUnpaid = appointments.filter(apt => 
        apt.patientId === currentUser.id && apt.payment_status === 'pending'
      );
      setUnpaidAppointments(updatedUnpaid);

    } catch (err) {
      setError('Payment processing error. Please try again.');
      setPaymentResult('error');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentAmount = () => {
    if (!selectedAppointment) return 0;
    return (selectedAppointment.price * currencies[currency]).toFixed(0);
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setSelectedAppointment(null);
    setPaymentMethod('momo');
    setCurrency('XAF');
    setCustomAmount('');
    setProcessing(false);
    setPaymentResult(null);
    setError('');
    setMomoNumber('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setTouched({});
    setFormErrors({});
  };

  const getFinalAmount = () => {
    if (!selectedAppointment) return 0;
    const base = parseFloat(customAmount) || selectedAppointment.price;
    const converted = base * currencies[currency];
    return Math.max(0, converted).toLocaleString('en-US', {maximumFractionDigits: 0});
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || (parseFloat(value) > 0 && value <= 999999)) {
      setCustomAmount(value);
      if (error) setError('');
    }
  };

  // Validation helpers
  const validateMoMo = (value) => {
    const trimmed = value.trim();
    const digits = trimmed.replace(/\D/g, '');
    if (!trimmed) return 'Mobile Money number is required';
    if (digits.length < 8 || digits.length > 12) return 'Number must be 8-12 digits';
    return '';
  };

  const validateCardName = (value) => value.trim() ? '' : 'Cardholder name is required';

  const validateCardNumber = (value) => {
    const clean = value.replace(/\s/g, '');
    const digits = clean.replace(/\D/g, '');
    if (!clean) return 'Card number is required';
    if (digits.length < 13 || digits.length > 19) return 'Card number must be 13-19 digits';
    return '';
  };

  const validateExpiry = (value) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length !== 4) return 'Enter MM/YY (e.g. 12/25)';
    const month = parseInt(clean.substring(0,2));
    const year = parseInt(clean.substring(2));
    if (month < 1 || month > 12) return 'Invalid month';
    return '';
  };

  const validateCVV = (value) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'CVV is required';
    if (digits.length < 3 || digits.length > 4) return 'CVV must be 3-4 digits';
    return '';
  };

  // Auto-format handlers
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(value);
    if (touched.cardNumber) {
      setFormErrors({...formErrors, cardNumber: validateCardNumber(value)});
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0,2) + '/' + value.substring(2,4);
    }
    setCardExpiry(value);
    if (touched.cardExpiry) {
      setFormErrors({...formErrors, cardExpiry: validateExpiry(value)});
    }
  };

  const handleInputTouch = (field) => {
    setTouched({...touched, [field]: true});
    // Validate on touch
    switch(field) {
      case 'momoNumber':
        setFormErrors({...formErrors, momoNumber: validateMoMo(momoNumber)});
        break;
      case 'cardName':
        setFormErrors({...formErrors, cardName: validateCardName(cardName)});
        break;
      case 'cardNumber':
        setFormErrors({...formErrors, cardNumber: validateCardNumber(cardNumber)});
        break;
      case 'cardExpiry':
        setFormErrors({...formErrors, cardExpiry: validateExpiry(cardExpiry)});
        break;
      case 'cardCVV':
        setFormErrors({...formErrors, cardCVV: validateCVV(cardCVV)});
        break;
    }
  };

  const hasFormErrors = () => {
    if (!customAmount || parseFloat(customAmount) <= 0) {
      setError('Please enter a valid amount');
      return true;
    }
    if (paymentMethod === 'momo') {
      const err = validateMoMo(momoNumber);
      if (err) {
        setFormErrors({...formErrors, momoNumber: err});
        setTouched({...touched, momoNumber: true});
        return true;
      }
    } else {
      const errors = {
        cardName: validateCardName(cardName),
        cardNumber: validateCardNumber(cardNumber),
        cardExpiry: validateExpiry(cardExpiry),
        cardCVV: validateCVV(cardCVV)
      };
      const hasError = Object.values(errors).some(e => e);
      if (hasError) {
        setFormErrors(errors);
        setTouched({cardName: true, cardNumber: true, cardExpiry: true, cardCVV: true});
        return true;
      }
    }
    return false;
  };

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button className="btn-back" onClick={() => navigate('/dashboard/patient')}>
            ← Back to Dashboard
          </button>
          <h1>Payments</h1>
        </div>
      </header>

      <main className="dashboard-content">
        <section>
          <h2>Pending Payments</h2>
          {unpaidAppointments.length > 0 ? (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
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
                    <td>{apt.date}</td>
                    <td>{apt.time}</td>
                    <td>XAF {apt.price}</td>
                    <td>
                      <span className="status pending">{apt.payment_status.toUpperCase()}</span>
                    </td>
                    <td>
                      <button className="btn-pay" onClick={() => handlePayNow(apt)}>
                        💳 Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No pending payments. All appointments are up to date! 🎉</p>
          )}
        </section>
      </main>

      {showPaymentModal && selectedAppointment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pay for Appointment</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="appointment-details">
                <p><strong>{selectedAppointment.providerName}</strong></p>
                <p>{selectedAppointment.service} - {selectedAppointment.date} at {selectedAppointment.time}</p>
              </div>

              <div className="payment-form">
                <div className="form-group">
                  <label>Payment Method</label>
                <div className="payment-methods">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      className={`payment-method-btn ${paymentMethod === method.id ? 'selected' : ''}`}
                      onClick={() => {
                        setPaymentMethod(method.id);
                        // Clear opposite form errors
                        if (method.id === 'momo') {
                          setFormErrors({ ...formErrors, cardName: '', cardNumber: '', cardExpiry: '', cardCVV: '' });
                        } else {
                          setFormErrors({ ...formErrors, momoNumber: '' });
                          setTouched({});
                        }
                      }}
                    >
                      {method.icon} {method.name}
                    </button>
                  ))}
                </div>

                {/* Payment Details Form */}
                <div className="payment-details-container">
                  {paymentMethod === 'momo' ? (
                    <div className="form-group">
                      <label>Enter Mobile Money Number</label>
                      <input
                        type="tel"
                        className={`input-field ${touched.momoNumber && formErrors.momoNumber ? 'error' : ''}`}
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        onBlur={() => handleInputTouch('momoNumber')}
                        placeholder="07xxxxxxxx or +237xxxxxxxxx"
                        maxLength="15"
                      />
                      {touched.momoNumber && formErrors.momoNumber && (
                        <div className="error-text">{formErrors.momoNumber}</div>
                      )}
                    </div>
                  ) : (
                    <div className="card-form">
                      <div className="form-group">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          className={`input-field ${touched.cardName && formErrors.cardName ? 'error' : ''}`}
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          onBlur={() => handleInputTouch('cardName')}
                          placeholder="John Doe"
                        />
                        {touched.cardName && formErrors.cardName && (
                          <div className="error-text">{formErrors.cardName}</div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Card Number</label>
                        <input
                          type="text"
                          className={`input-field ${touched.cardNumber && formErrors.cardNumber ? 'error' : ''}`}
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          onBlur={() => handleInputTouch('cardNumber')}
                          placeholder="1234 5678 9012 3456"
                          maxLength="23"
                        />
                        {touched.cardNumber && formErrors.cardNumber && (
                          <div className="error-text">{formErrors.cardNumber}</div>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            className={`input-field ${touched.cardExpiry && formErrors.cardExpiry ? 'error' : ''}`}
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            onBlur={() => handleInputTouch('cardExpiry')}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {touched.cardExpiry && formErrors.cardExpiry && (
                            <div className="error-text">{formErrors.cardExpiry}</div>
                          )}
                        </div>
                        <div className="form-group">
                          <label>CVV</label>
                          <input
                            type="text"
                            className={`input-field ${touched.cardCVV && formErrors.cardCVV ? 'error' : ''}`}
                            value={cardCVV}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0,4);
                              setCardCVV(value);
                              if (touched.cardCVV) {
                                setFormErrors({...formErrors, cardCVV: validateCVV(value)});
                              }
                            }}
                            onBlur={() => handleInputTouch('cardCVV')}
                            placeholder="123"
                            maxLength="4"
                          />
                          {touched.cardCVV && formErrors.cardCVV && (
                            <div className="error-text">{formErrors.cardCVV}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      {Object.keys(currencies).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Amount ({currency})</label>
                    <div className="amount-input-group">
                      <input
                        type="text"
                        className="currency-input"
                        value={customAmount || ''}
                        onChange={handleAmountChange}
                        placeholder={selectedAppointment?.price?.toLocaleString() || 'Enter amount'}
                        maxLength="12"
                      />
                      <div className="currency-display">{currency} {getFinalAmount()}</div>
                    </div>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {!paymentResult ? (
                  <button 
                    className="btn-submit" 
                    onClick={handleProcessPayment}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : `Pay ${currency} ${getFinalAmount()}`}
                  </button>
                ) : paymentResult === 'success' ? (
                  <div className="payment-success">
                    <h4>✅ Payment Successful!</h4>
                    <p>Appointment confirmed. Thank you!</p>
                    <button className="btn-primary" onClick={closeModal}>Done</button>
                  </div>
                ) : (
                  <div className="error-message">
                    <h4>❌ Payment Failed</h4>
                    <p>Please try again or contact support.</p>
                    <div style={{display: 'flex', gap: '1rem'}}>
                      <button className="btn-primary" onClick={handleProcessPayment}>Retry</button>
                      <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;

