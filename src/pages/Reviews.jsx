import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import './Reviews.css';

function Reviews() {
  const { currentUser, users, reviews, addReview, getProviderReviews } = useApp();
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [filterRating, setFilterRating] = useState(0);

  // Get doctors and nurses that can be reviewed
  const getProviders = () => {
    return users.filter(u => u.role === 'doctor' || u.role === 'nurse');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedProvider || !reviewForm.comment.trim()) return;

    addReview({
      patientId: currentUser.id,
      patientName: currentUser.name,
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim()
    });

    setShowAddReview(false);
    setSelectedProvider(null);
    setReviewForm({ rating: 5, comment: '' });
    alert('Review submitted successfully!');
  };

  // Calculate average rating
  const getAverageRating = (providerId) => {
    const providerReviews = getProviderReviews(providerId);
    if (providerReviews.length === 0) return 0;
    const sum = providerReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / providerReviews.length).toFixed(1);
  };

  // Get reviews for display
  const getDisplayReviews = (providerId) => {
    let providerReviews = getProviderReviews(providerId);
    if (filterRating > 0) {
      providerReviews = providerReviews.filter(r => r.rating >= filterRating);
    }
    return providerReviews;
  };

  // Render star rating
  const renderStars = (rating, interactive = false, onChange = () => {}) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="reviews-page">
        <Navbar />
        <div className="reviews-container">
          <div className="login-required">
            <h2>Please login to view and write reviews</h2>
            <Link to="/login" className="btn-primary">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <Navbar />
      <div className="reviews-container">
        <div className="reviews-header">
          <h1>Reviews & Ratings</h1>
          <p>Rate and review your healthcare providers</p>
          {currentUser.role === 'patient' && (
            <button 
              className="btn-add-review"
              onClick={() => setShowAddReview(!showAddReview)}
            >
              {showAddReview ? 'Cancel' : '+ Write a Review'}
            </button>
          )}
        </div>

        {/* Add Review Form */}
        {showAddReview && (
          <div className="add-review-section">
            <h2>Write a Review</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Select Provider</label>
                <select 
                  value={selectedProvider?.id || ''}
                  onChange={(e) => setSelectedProvider(getProviders().find(p => p.id === parseInt(e.target.value)))}
                  required
                >
                  <option value="">Choose a provider...</option>
                  {getProviders().map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} - {provider.role === 'doctor' ? provider.specialty : 'Nurse'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Rating</label>
                {renderStars(reviewForm.rating, true, (rating) => 
                  setReviewForm({ ...reviewForm, rating })
                )}
              </div>
              
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="btn-submit-review">
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* Provider Reviews List */}
        <div className="providers-section">
          <h2>Healthcare Providers</h2>
          <div className="filter-section">
            <label>Filter by rating:</label>
            <select value={filterRating} onChange={(e) => setFilterRating(parseInt(e.target.value))}>
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
            </select>
          </div>
          
          <div className="providers-grid">
            {getProviders().map(provider => {
              const avgRating = getAverageRating(provider.id);
              const providerReviews = getDisplayReviews(provider.id);
              
              return (
                <div key={provider.id} className="provider-card">
                  <div className="provider-header">
                    <div className="provider-avatar">
                      {provider.name.charAt(0)}
                    </div>
                    <div className="provider-info">
                      <h3>{provider.name}</h3>
                      <span className="provider-role">
                        {provider.role === 'doctor' ? provider.specialty : 'Nurse'}
                      </span>
                      {provider.experience && (
                        <span className="provider-experience">{provider.experience} experience</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="provider-rating-summary">
                    <div className="avg-rating">
                      <span className="rating-number">{avgRating}</span>
                      <div className="rating-stars">
                        {renderStars(Math.round(avgRating))}
                      </div>
                      <span className="review-count">{providerReviews.length} reviews</span>
                    </div>
                  </div>
                  
                  {providerReviews.length > 0 && (
                    <div className="provider-reviews-list">
                      <h4>Recent Reviews</h4>
                      {providerReviews.slice(0, 3).map(review => (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <span className="reviewer-name">{review.patientName}</span>
                            <span className="review-date">{review.date}</span>
                          </div>
                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))}
                      {providerReviews.length > 3 && (
                        <button className="btn-view-more">
                          View all {providerReviews.length} reviews
                        </button>
                      )}
                    </div>
                  )}
                  
                  {providerReviews.length === 0 && (
                    <div className="no-reviews">
                      <p>No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                  
                  {currentUser.role === 'patient' && (
                    <button 
                      className="btn-review-provider"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowAddReview(true);
                      }}
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* My Reviews Section (for patients) */}
        {currentUser.role === 'patient' && (
          <div className="my-reviews-section">
            <h2>My Reviews</h2>
            {reviews.filter(r => r.patientId === currentUser.id).length > 0 ? (
              <div className="my-reviews-list">
                {reviews.filter(r => r.patientId === currentUser.id).map(review => (
                  <div key={review.id} className="my-review-card">
                    <div className="review-provider-info">
                      <strong>{review.providerName}</strong>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-reviews-message">You haven't written any reviews yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
