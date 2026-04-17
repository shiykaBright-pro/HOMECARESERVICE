import { useState } from 'react';
import Navbar from '../components/Navbar';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="contact-page">
      <Navbar />
      
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Get in touch with us for any inquiries.</p>
      </div>

      <div className="contact-container">
        <div className="contact-info-section">
          <div className="contact-info-card">
            <div className="info-icon"></div>
            <div className="info-content">
              <h3>Our Address</h3>
              <p>123 Healthcare Avenue Buea<br />Medical District, City 12345</p>
            </div>
          </div>
          
          <div className="contact-info-card">
            <div className="info-icon"></div>
            <div className="info-content">
              <h3>Phone Number</h3>
              <p>+237 679109117<br />+237 673233297</p>
            </div>
          </div>
          
          <div className="contact-info-card">
            <div className="info-icon"></div>
            <div className="info-content">
              <h3>Email Address</h3>
              <p>shiyka@homecare.com<br />Bright@homecare.com</p>
            </div>
          </div>
          
          <div className="contact-info-card">
            <div className="info-icon"></div>
            <div className="info-content">
              <h3>Working Hours</h3>
              <p>Mon - Fri: 8:00 AM - 8:00 PM<br />Sat - Sun: 9:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <div className="form-header">
            <h2>Send us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
          </div>

          {submitted ? (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <h3>Thank You!</h3>
              <p>Your message has been sent successfully. We'll contact you soon.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Shiyka Bright"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="shiyka@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+237 673233297"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="appointment">Book an Appointment</option>
                    <option value="feedback">Feedback</option>
                    <option value="complaint">Complaint</option>
                    <option value="partnership">Partnership</option>
                    <option value="career">Career</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows="5"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Send Message
                <span className="btn-icon">→</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="map-section">
        <div className="map-placeholder">
          <span className="map-icon">🗺️</span>
          <p>Map View - Our Location</p>
        </div>
      </div>

      <footer className="footer-modern">
        <div className="footer-bottom">
          <p>&copy; 2026 HomeCare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Contact;
