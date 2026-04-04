import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './About.css';

function About() {
  const features = [
    {
      icon: '',
      title: 'Home-Based Care',
      description: 'Receive professional medical care in the comfort of your own home. No more waiting rooms or travel hassles.'
    },
    {
      icon: '',
      title: 'Expert Professionals',
      description: 'Our team consists of licensed doctors, experienced nurses, and certified healthcare professionals.'
    },
    {
      icon: '',
      title: '24/7 Availability',
      description: 'We are available round the clock to handle your healthcare needs, any day of the week.'
    },
    {
      icon: '',
      title: 'Affordable Rates',
      description: 'Quality healthcare services at competitive prices with transparent pricing. No hidden costs.'
    },
    {
      icon: '',
      title: 'Easy Booking',
      description: 'Book appointments online in just a few clicks. Manage your healthcare from your smartphone.'
    },
    {
      icon: '',
      title: 'Secure & Private',
      description: 'Your medical information is protected with industry-standard security and privacy measures.'
    }
  ];

  const stats = [
    { number: '5000+', label: 'Patients Served' },
    { number: '150+', label: 'Healthcare Professionals' },
    { number: '50+', label: 'Partner Hospitals' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  const team = [
    { name: 'Dr. Sarah Johnson', role: 'Chief Medical Officer', image: '' },
    { name: 'Dr. John Smith', role: 'Head of Cardiology', image: '' },
    { name: 'Emily Davis', role: 'Head of Nursing', image: '' },
    { name: 'Michael Brown', role: 'Operations Director', image: '' }
  ];

  return (
    <div className="about-page">
      <Navbar />
      
      <section className="about-hero">
        <h1>About HomeCare</h1>
        <p>Your Trusted Partner in Home Healthcare Services</p>
      </section>

      <section className="about-content">
        <div className="about-text">
          <h2>Revolutionizing Healthcare at Home</h2>
          <p>
            HomeCare is a leading provider of home-based healthcare services, committed to making quality 
            medical care accessible to everyone. We believe that healthcare should be convenient, comfortable, 
            and personalized to each patient's needs.
          </p>
          <p>
            Our platform connects patients with a network of qualified doctors, nurses, and healthcare 
            professionals who provide comprehensive medical services right at your doorstep. From routine 
            check-ups to specialized treatments, we've got you covered.
          </p>
          <p>
            With HomeCare, you don't need to worry about traveling to hospitals or waiting in long queues. 
            Our dedicated team brings healthcare to you, ensuring you receive the best possible care in 
            the familiar surroundings of your home.
          </p>
        </div>
      </section>

      <section className="stats-section">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="features-section">
        <h2>Why Choose HomeCare?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="team-section">
        <h2>Our Leadership Team</h2>
        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-image">{member.image}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of satisfied patients who have chosen HomeCare for their healthcare needs.</p>
        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
          <Link to="/register" className="btn-primary">Register Now</Link>
          <Link to="/services" className="btn-secondary">View Services</Link>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 HomeCare. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default About;
