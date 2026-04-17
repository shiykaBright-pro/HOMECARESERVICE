import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

function Home() {
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
        </div>
      </section>

      {/* Footer */}
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
