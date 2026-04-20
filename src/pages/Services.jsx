import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Services.css';

function Services() {
  const services = [
    {
      id: 1,
      title: 'General Consultation',
      description: 'Comprehensive health consultation with experienced general practitioners. Get expert medical advice from the comfort of your home.',
      price: 50,
      duration: '30 minutes',
      icon: '',
      features: ['Medical history review', 'Physical examination', 'Treatment plan', 'Prescription if needed']
    },
    {
      id: 2,
      title: 'Nursing Care',
      description: 'Professional nursing services including wound care, injections, medication administration, and post-operative care.',
      price: 40,
      duration: '45 minutes',
      icon: '',
      features: ['Wound dressing', 'Injection administration', 'Vital signs monitoring', 'Medication management']
    },
    {
      id: 3,
      title: 'Physical Therapy',
      description: 'Expert rehabilitation services to help you recover from injuries, surgeries, or chronic conditions.',
      price: 60,
      duration: '60 minutes',
      icon: '',
      features: ['Movement assessment', 'Exercise therapy', 'Pain management', 'Recovery exercises']
    },
    {
      id: 4,
      title: 'Medical Tests',
      description: 'Convenient sample collection and diagnostic services at your home. No need to visit a lab.',
      price: 30,
      duration: '15 minutes',
      icon: '',
      features: ['Blood tests', 'Urine tests', 'Sample collection', 'Results delivery']
    },
    {
      id: 5,
      title: 'Elderly Care',
      description: 'Specialized care for elderly patients including daily assistance, medication reminders, and companionship.',
      price: 80,
      duration: '2 hours',
      icon: '',
      features: ['Daily living assistance', 'Medication reminders', 'Companionship', 'Health monitoring']
    },
    {
      id: 6,
      title: 'Post-Surgery Care',
      description: 'Comprehensive care for patients recovering from surgery, including wound care and rehabilitation support.',
      price: 70,
      duration: '1 hour',
      icon: '',
      features: ['Wound care', 'Recovery monitoring', 'Rehabilitation support', '24/7 availability']
    }
  ];

  return (
    <div className="services-page">
      <Navbar />
      
      <section className="services-hero">
        <h1>Our Services</h1>
        <p>Professional healthcare services at your doorstep</p>
      </section>

      <section className="services-list">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <div className="service-content">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
              <div className="service-meta">
                <span className="service-price">${service.price}</span>
                <span className="service-duration">⏱ {service.duration}</span>
              </div>

              <Link to="/login" className="btn-book-service">Login to Book</Link>
            </div>
          </div>
        ))}
      </section>

      <section className="cta-section">
        <h2>Need a Custom Service?</h2>
        <p>Contact us for specialized healthcare services tailored to your needs.</p>
        <Link to="/contact" className="btn-primary">Contact Us</Link>
      </section>

      <footer className="footer">
        <p>&copy; 2026 HomeCare. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Services;
