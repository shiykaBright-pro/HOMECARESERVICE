import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './Reviews.css';

function Reviews() {
  const [activeTab, setActiveTab] = useState('providers');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - replace with real data from context
  const providers = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology', rating: 4.8, reviews: 124, avatar: 'SJ' },
    { id: 2, name: 'Nurse Emily Davis', specialty: 'General Nursing', rating: 4.9, reviews: 89, avatar: 'ED' },
    { id: 3, name: 'Dr. Michael Chen', specialty: 'Pediatrics', rating: 4.7, reviews: 156, avatar: 'MC' },
    { id: 4, name: 'Nurse Lisa Rodriguez', specialty: 'Wound Care', rating: 4.6, reviews: 67, avatar: 'LR' },
  ];

  const recentReviews = [
    { patient: 'John Smith', provider: 'Dr. Sarah Johnson', rating: 5, comment: 'Excellent care, very professional!', date: '2024-01-15' },
    { patient: 'Mary Wilson', provider: 'Nurse Emily Davis', rating: 4, comment: 'Compassionate and thorough.', date: '2024-01-14' },
  ];

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="reviews-page">
      <Navbar />
      <div className="reviews-wrapper">
        {/* Hero Section */}
        <div className="reviews-hero">
          <div className="hero-content">
            <h1>Patient Reviews</h1>
            <p>See what our patients say about our care providers</p>
            <div className="overall-rating">
              <span className="avg-score">4.8</span>
              <span>★ (456 reviews)</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <input 
            type="text" 
            placeholder="Search providers or read reviews..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Tabs */}
        <div className="reviews-tabs">
          <button 
            className={`tab-btn ${activeTab === 'providers' ? 'active' : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            Providers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Recent Reviews
          </button>
        </div>

        {/* Providers Grid */}
        {activeTab === 'providers' && (
          <div className="providers-grid">
            {filteredProviders.map(provider => (
              <div key={provider.id} className="provider-review-card">
                <div className="card-header">
                  <div className="avatar">{provider.avatar}</div>
                  <div className="provider-info">
                    <h3>{provider.name}</h3>
                    <span className="specialty">{provider.specialty}</span>
                  </div>
                </div>
                <div className="rating-section">
                  <div className="stars">★★★★★</div>
                  <span className="score">{provider.rating}</span>
                  <span className="review-count">({provider.reviews})</span>
                </div>
                <button className="view-reviews-btn">View Reviews</button>
              </div>
            ))}
          </div>
        )}

        {/* Reviews List */}
        {activeTab === 'reviews' && (
          <div className="reviews-list">
            {recentReviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="patient-name">{review.patient}</div>
                  <div className="review-rating">{review.rating} ★</div>
                </div>
                <p className="review-text">{review.comment}</p>
                <div className="review-provider">{review.provider}</div>
                <div className="review-date">{review.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-number">4.8</div>
            <div>Overall Rating</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">124</div>
            <div>Providers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">456</div>
            <div>Total Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reviews;

