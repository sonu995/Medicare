import React, { useState, useMemo } from 'react';

const Reviews = ({ doctors, tokenBookings }) => {
    const [selectedDoctor, setSelectedDoctor] = useState('all');
    const [filterRating, setFilterRating] = useState(0);

    const clinicDoctors = doctors;
    const doctorIds = clinicDoctors.map(d => d._id || d.id);

    // Generate mock reviews from completed bookings
    const reviews = useMemo(() => {
        return tokenBookings
            .filter(b => 
                doctorIds.includes(b.doctorId) && 
                b.status === 'completed'
            )
            .map((booking, idx) => ({
                id: booking._id || `review-${idx}`,
                doctorId: booking.doctorId,
                patientName: booking.patientName || 'Anonymous',
                rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
                comment: booking.review || getRandomComment(),
                date: booking.createdAt || booking.date,
                wouldRecommend: Math.random() > 0.1
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [tokenBookings, doctorIds]);

    function getRandomComment() {
        const comments = [
            'Great experience! Doctor was very professional.',
            'Very satisfied with the treatment.',
            'Good consultation, explained everything clearly.',
            'Highly recommended!',
            'Quick and efficient service.',
            'Doctor was patient and listened to all my concerns.',
            'Excellent care and follow-up.',
            'Very knowledgeable doctor.',
            'Would definitely come again.',
            'Professional and friendly staff.'
        ];
        return comments[Math.floor(Math.random() * comments.length)];
    }

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchesDoctor = selectedDoctor === 'all' || r.doctorId === selectedDoctor;
            const matchesRating = r.rating >= filterRating;
            return matchesDoctor && matchesRating;
        });
    }, [reviews, selectedDoctor, filterRating]);

    const stats = useMemo(() => {
        const total = reviews.length;
        const avgRating = total > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) 
            : 0;
        const fiveStars = reviews.filter(r => r.rating === 5).length;
        const fourStars = reviews.filter(r => r.rating === 4).length;
        const threeStars = reviews.filter(r => r.rating === 3).length;
        
        return { total, avgRating, fiveStars, fourStars, threeStars };
    }, [reviews]);

    const getDoctorName = (docId) => {
        return doctors.find(d => (d._id || d.id) === docId)?.name || 'Unknown';
    };

    const getDoctorIcon = (docId) => {
        return doctors.find(d => (d._id || d.id) === docId)?.icon || '👨‍⚕️';
    };

    return (
        <div className="reviews-section">
            <div className="reviews-header">
                <h2>⭐ Patient Reviews</h2>
            </div>

            {/* Stats */}
            <div className="reviews-stats">
                <div className="rating-overview">
                    <div className="big-rating">
                        <span className="rating-num">{stats.avgRating}</span>
                        <div className="stars">
                            {[1,2,3,4,5].map(i => (
                                <span key={i} className={i <= Math.round(stats.avgRating) ? 'filled' : ''}>★</span>
                            ))}
                        </div>
                        <span className="total-reviews">{stats.total} reviews</span>
                    </div>
                </div>
                <div className="rating-bars">
                    {[5,4,3,2,1].map(star => {
                        const count = star === 5 ? stats.fiveStars : star === 4 ? stats.fourStars : star === 3 ? stats.threeStars : 0;
                        const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                            <div key={star} className="rating-bar-row">
                                <span className="star-label">{star} ★</span>
                                <div className="bar-container">
                                    <div className="bar-fill" style={{ width: `${percent}%` }}></div>
                                </div>
                                <span className="count">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filters */}
            <div className="reviews-filters">
                <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                    <option value="all">All Doctors</option>
                    {clinicDoctors.map(doc => (
                        <option key={doc._id || doc.id} value={doc._id || doc.id}>
                            {doc.name}
                        </option>
                    ))}
                </select>
                <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(parseInt(e.target.value))}
                >
                    <option value="0">All Ratings</option>
                    <option value="5">5 Stars Only</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
                {filteredReviews.length === 0 ? (
                    <div className="no-reviews">
                        <span>⭐</span>
                        <p>No reviews yet</p>
                    </div>
                ) : (
                    filteredReviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <span className="reviewer-avatar">
                                        {review.patientName.charAt(0).toUpperCase()}
                                    </span>
                                    <div>
                                        <span className="reviewer-name">{review.patientName}</span>
                                        <span className="review-date">
                                            {new Date(review.date).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                                <div className="review-rating">
                                    {[1,2,3,4,5].map(i => (
                                        <span key={i} className={i <= review.rating ? 'filled' : ''}>★</span>
                                    ))}
                                </div>
                            </div>
                            
                            <p className="review-comment">{review.comment}</p>
                            
                            <div className="review-footer">
                                <span className="doctor-tag">
                                    {getDoctorIcon(review.doctorId)} {getDoctorName(review.doctorId)}
                                </span>
                                {review.wouldRecommend && (
                                    <span className="recommend-badge">✓ Would Recommend</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;
