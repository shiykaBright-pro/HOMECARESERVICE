import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import './Home.css';

function Home() {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const { loginWithGoogle } = useApp();
  const navigate = useNavigate();

  const emergencyNumbers = [
    { name: 'John Doe (Patient Support)', phone: '+237 679109117' },
    { name: 'Jane Doe (Emergency)', phone: '+237 673233297' },
    { name: 'Emergency Response', phone: '+237 673239967' }
  ];

  const openEmergencyModal = () => setShowEmergencyModal(true);
  const closeEmergencyModal = () => setShowEmergencyModal(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setGoogleError('');
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) {
      // Context listener will handle redirect and set user
      // Navigate happens automatically via ProtectedRoute
    } else {
      setGoogleError(result.error);
    }
  };

  return (
    <div className="home">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-modern">
        <div className="hero-overlay"></div>
        <div className="hero-content-modern">
          <span className="hero-badge">Trusted Home Healthcare</span>
          <h1>Quality Healthcare <br/><span>At Your Doorstep</span></h1>
          <p>Professional medical care from certified doctors and nurses in the comfort of your home. Because your health matters, everywhere.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary">
              Book Appointment
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/services" className="btn-hero-secondary">
              Explore Services
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Patients Served</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Medical Experts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support Available</span>
            </div>
          </div>
        </div>
        <div className="hero-image-container">
          <img src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&q=80" alt="Doctor checking patient at home" className="hero-image" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-modern">
        <div className="section-header">
          <span className="section-tag">Why Choose Us</span>
          <h2>Healthcare Made Simple</h2>
          <p>We bring the best medical care to your home, making health accessible for everyone.</p>
        </div>
        <div className="features-grid-modern">
          <div className="feature-card-modern">
            <div className="feature-icon"></div>
            <h3>Home-Based Care</h3>
            <p>Receive quality medical care in the comfort of your own home without the hassle of traveling.</p>
          </div>
          <div className="feature-card-modern">
            <div className="feature-icon"></div>
            <h3>Expert Professionals</h3>
            <p>Our team of certified doctors and nurses are dedicated to providing you with the best care.</p>
          </div>
          <div className="feature-card-modern">
            <div className="feature-icon"></div>
            <h3>24/7 Availability</h3>
            <p>Round-the-clock healthcare services whenever you need, day or night.</p>
          </div>
          <div className="feature-card-modern">
            <div className="feature-icon"></div>
            <h3>Personalized Care</h3>
            <p>Tailored treatment plans designed specifically for your unique health needs.</p>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="services-modern">
        <div className="section-header">
          <span className="section-tag">Our Services</span>
          <h2>Comprehensive Care Solutions</h2>
          <p>From routine checkups to specialized treatments, we've got you covered.</p>
        </div>
        <div className="services-grid-modern">
          <div className="service-card-modern">
            <div className="service-image"></div>
            <h3>General Consultation</h3>
            <p>Expert medical advice and treatment from experienced general practitioners.</p>
            <Link to="/services" className="service-link">Learn More →</Link>
          </div>
          <div className="service-card-modern">
            <div className="service-image"></div>
            <h3>Nursing Care</h3>
            <p>Professional nursing services including wound care, injections, and IV therapy.</p>
            <Link to="/services" className="service-link">Learn More →</Link>
          </div>
          <div className="service-card-modern">
            <div className="service-image"></div>
            <h3>Physical Therapy</h3>
            <p>Rehabilitation and physiotherapy services to help you recover at home.</p>
            <Link to="/services" className="service-link">Learn More →</Link>
          </div>
          <div className="service-card-modern">
            <div className="service-image"></div>
            <h3>Medical Tests</h3>
            <p>Sample collection and diagnostic tests conducted at your convenience.</p>
            <Link to="/services" className="service-link">Learn More →</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="process-modern">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2>Get Started in 3 Easy Steps</h2>
        </div>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-circle">1</div>
            <div className="step-content">
              <h3>Create Account</h3>
              <p>Sign up and create your personal health profile in minutes.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-circle">2</div>
            <div className="step-content">
              <h3>Book Appointment</h3>
              <p>Choose your preferred service and schedule a visit at your convenience.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-circle">3</div>
            <div className="step-content">
              <h3>Receive Care</h3>
              <p>Get professional medical care from our experts at your home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-modern">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of patients who trust us for their healthcare needs.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta-primary">Create Account</Link>
            <Link to="/login" className="btn-cta-secondary">Sign In</Link>
          </div>
          {googleError && <div className="error-message" style={{textAlign: 'center', marginTop: '1rem'}}>{googleError}</div>}
          <div className="google-login" style={{marginTop: '1.5rem'}}>
            <p>Or continue with</p>
            <button 
              type="button" 
              className="btn-google-login"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              <svg viewBox="0 0 24 24" className="google-icon" style={{width: '20px', height: '20px'}}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      {showEmergencyModal && (
        <div className="emergency-modal-overlay" onClick={closeEmergencyModal}>
          <div className="emergency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emergency-modal-header">
              <h2>🚨 Emergency Contacts</h2>
              <button className="modal-close" onClick={closeEmergencyModal}>×</button>
            </div>
            <div className="emergency-numbers">
              {emergencyNumbers.map((contact, index) => (
                <div key={index} className="emergency-contact">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-number">{contact.phone}</div>
                  <div className="contact-actions">
                    <a href={`tel:${contact.phone}`} className="btn-call">📞 Call</a>
                    <a href={`sms:${contact.phone}`} className="btn-sms">💬 SMS</a>
                    <a href={`https://wa.me/${contact.phone.replace(/[^0-9+]/g, '')}`} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">💚 WhatsApp</a>
                  </div>
                </div>
              ))}
            </div>
            <div className="emergency-footer">
              <p>Stay safe! Professional help is here for you 24/7.</p>
            </div>
          </div>
        </div>
      )}

      <footer className="footer-modern">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>HomeCare</h3>
            <p>Professional healthcare services at your doorstep.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Services</h4>
              <a href="/services">General Consultation</a>
              <a href="/services">Nursing Care</a>
              <a href="/services">Physical Therapy</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="/about">About Us</a>
              <a href="/contact">Contact</a>
              <a href="/careers">Careers</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HomeCare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
