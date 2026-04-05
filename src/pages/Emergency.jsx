import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParticlesCanvas from '../components/ParticlesCanvas';
import './Emergency.css';

function Emergency() {
  const [copied, setCopied] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const emergencyNumbers = [
    { 
      name: 'John Doe (Patient Support)', 
      phone: '+237 679109117',
      avatar: '👨‍⚕️'
    },
    { 
      name: 'Jane Doe (Emergency)', 
      phone: '+237 673233297',
      avatar: '🚑'
    },
    { 
      name: 'Emergency Response', 
      phone: '+237 673239967',
      avatar: '⚕️'
    }
  ];

  const copyNumber = (phone) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(phone);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        });
        setLocationError('');
      },
      (error) => {
        setLocationError('Unable to get location. Enable permissions.');
      }
    );
  };

  const PhoneIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
  );

  const MessageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
  );

  const WhatsAppIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 01 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.86 1.86 0 0012.47 0C5.37 0 0 5.372 0 12.47a11.85 1.85 625 2.893 6.994c.003 5.45 4.42 9.884 6.88 9.884m8.413-18.297A11.86 1.86 0 0012.47 0C5.37 0 0 5.372 0 12.47a11.85 1.85 625 2.893 6.994c.003 5.45 4.42 9.884 6.88 9.884m8.413-18.297A11.86 1.86 0 0012.47 0C5.37 0 0 5.372 0 12.47a11.85 1.85 625 2.893 6.994c.003 5.45 4.42 9.884 6.88 9.884m8.413-18.297A11.86 1.86 0 001"/>
    </svg>
  );

  return (
    <div className="emergency-page">
      <ParticlesCanvas />
      <Navbar />
      <div className="emergency-hero">
        <div className="emergency-hero-content">
          <div className="emergency-icon">🚨</div>
          <h1>Emergency Services</h1>
          <p>Immediate help is available 24/7. Call, SMS, or WhatsApp for urgent medical assistance.</p>
        </div>
      </div>

      <div className="emergency-contacts-full">
        {emergencyNumbers.map((contact, index) => (
          <div key={index} className="emergency-contact-full">
            <div className="contact-avatar">{contact.avatar}</div>
            <div className="contact-details">
              <h3>{contact.name}</h3>
              <div className="contact-number-large">{contact.phone}</div>
            </div>
            <div className="contact-actions-full">
              <a href={`tel:${contact.phone}`} className="btn-emergency-full call">
                <PhoneIcon />
                CALL NOW
              </a>
              <a href={`sms:${contact.phone}?body=Emergency%20help%20needed`} className="btn-emergency-full sms">
                <MessageIcon />
                SMS
              </a>
              <a href={`https://wa.me/${contact.phone.replace(/[^0-9+]/g, '')}`} className="btn-emergency-full whatsapp" target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                WHATSAPP
              </a>
              <button onClick={() => copyNumber(contact.phone)} className="btn-copy">
                {copied === contact.phone ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="location-section">
        <h3>📍 Your Location</h3>
        {location ? (
          <div className="location-display">
            Lat: {location.lat}, Lng: {location.lng}
            <button className="btn-copy" onClick={() => copyNumber(`Lat: ${location.lat}, Lng: ${location.lng}`)}>
              Copy Location
            </button>
          </div>
        ) : locationError ? (
          <p className="location-error">{locationError}</p>
        ) : (
          <button className="btn-location" onClick={getCurrentLocation}>
            Get My Location
          </button>
        )}
      </div>

      <div className="emergency-timer">
        <div className="timer-circle">
          <span className="timer-text">Help Arrives In</span>
          <span className="timer-number">05:23</span>
        </div>
      </div>

      <div className="emergency-info">
        <h2>⚠️ When to Call Emergency</h2>
        <ul>
          <li>Difficulty breathing or chest pain</li>
          <li>Severe bleeding that doesn't stop</li>
          <li>Sudden confusion or loss of consciousness</li>
          <li>Signs of stroke (FAST: Face, Arms, Speech, Time)</li>
          <li>Severe allergic reactions</li>
          <li>Any life-threatening situation</li>
        </ul>
        <div className="emergency-back">
          <Link to="/" className="btn-back-home">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default Emergency;

