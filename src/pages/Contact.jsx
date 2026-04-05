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
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  return (
    <div className="contact-page">
      <Navbar />
      
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>Get in touch with our team. We're here to help.</p>
      </section>

      <div className="contact-container">
        <div className="contact-info">
          <div className="info-card address">
            <h3>📍 Location</h3>
            <p>Buea Medical District<br/>South West Region</p>
          </div>
          <div className="info-card phone">
            <h3>📞 Phone</h3>
            <p>+237 679 109 117</p>
          </div>
          <div className="info-card email">
            <h3>✉️ Email</h3>
            <p>info@homecare.cm</p>
          </div>
          <div className="info-card hours">
            <h3>🕒 Hours</h3>
            <p>Mon-Fri 8AM-8PM<br/>Sat-Sun 9AM-5PM</p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send Message</h2>
          {submitted ? (
            <div className="success-message">
              <h3>Thank You!</h3>
              <p>Your message has been sent. We'll reply soon.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name *"
                />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email *"
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />
              </div>
              <div className="form-group">
                <select name="subject" value={formData.subject} onChange={handleChange}>
                  <option value="">Subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="appointment">Appointment</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Message *"
                  rows="5"
                ></textarea>
                {errors.message && <span className="error">{errors.message}</span>}
              </div>
              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>

      <section className="contact-map">
        <h2>Our Location</h2>
        <div className="map-wrapper">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15868.8!2d9.234!3d4.159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2zNOKwnCDDjMww4ZqP!5e0!3m2!1sen!2scm!4v1699999999999"
            width="100%"
            height="400"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </section>
    </div>
  );
}

export default Contact;


