
import Navbar from '../components/Navbar';
import './Reviews.css';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('list');

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (reviewForm.comment.trim().length < 10) {
      alert('Comment must be at least 10 characters');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newReview = {
        id: Date.now(),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        date: new Date().toLocaleDateString(),
        patientName: 'Current Patient'
      };
      setReviews([newReview, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
      setShowForm(false);
      setLoading(false);
      alert('Review submitted successfully!');
    }, 800);
  };

  const stars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const filteredReviews = reviews.filter(review =>
    review.comment.toLowerCase().includes(reviewForm.comment.toLowerCase())
  );

  return (
    <div className="reviews-page">
      <Navbar />
      <div className="reviews-container">
        {/* Header */}
        <header className="reviews-header">
          <h1>Patient Reviews</h1>
          <p>Share your experience and help others make informed decisions</p>
          <button 
            className="btn-primary write-review-btn"
            onClick={() => setShowForm(!showForm)}
            disabled={loading}
          >
            {showForm ? 'Cancel' : '✍️ Write a Review'}
          </button>
        </header>

        {/* Review Form */}
        {showForm && (
          <section className="review-form-section">
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Your Rating</label>
                <div className="star-rating">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${reviewForm.rating >= star ? 'filled' : ''}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Review (minimum 10 characters)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Tell us about your experience..."
                  rows={5}
                  maxLength={1000}
                  required
                />
                <div className="char-counter">
                  {reviewForm.comment.length}/1000 characters
                  {reviewForm.comment.length < 10 && <span className="error"> (minimum 10 required)</span>}
                </div>
              </div>
              <div className="form-buttons">
                <button type="submit" disabled={loading || reviewForm.comment.length < 10} className="btn-submit">
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Reviews List */}
        {!showForm && (
          <section className="reviews-list-section">
            <div className="reviews-header-controls">
              <h2>Recent Reviews ({reviews.length})</h2>
              <input
                type="text"
                placeholder="Search reviews..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="search-reviews"
              />
            </div>
            
            {filteredReviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <h3>No reviews yet</h3>
                <p>Be the first to share your healthcare experience!</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Write First Review
                </button>
              </div>
            ) : (
              <div className="reviews-grid">
                {filteredReviews.map((review) => (
                  <article key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-rating-display">
                        {stars(review.rating)}
                        <span className="rating-number">({review.rating}/5)</span>
                      </div>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-patient">
                      <span className="patient-name">{review.patientName}</span>
                    </div>
                    <p className="review-content">{review.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Stats */}
        <section className="reviews-stats">
          <div className="stat">
            <span className="stat-number">{reviews.length}</span>
            <span>Total Reviews</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '0'}
            </span>
            <span>Average Rating</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Reviews;

