import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookingPrescriptionModal from './BookingPrescriptionModal';
import './BookingHistory.css';

// eslint-disable-next-line no-unused-vars
function BookingHistory({ bookings = [], doctors = [], clinics = [], tokenStates = {}, tokenBookings = [] }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const getDoctor = (doctorId) => {
    return doctors.find(d => (d._id === doctorId || d.id?.toString() === doctorId?.toString()));
  };

  const filterByDateRange = (booking) => {
    const bookingDate = new Date(booking.bookingDate || booking.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateRange === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return bookingDate >= today && bookingDate < tomorrow;
    }
    if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bookingDate >= weekAgo;
    }
    if (dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return bookingDate >= monthAgo;
    }
    return true;
  };

  const filteredBookings = bookings
    .filter(b => {
      if (filter === 'all') return true;
      if (filter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0];
        return new Date(b.bookingDate) >= new Date(today) && b.status !== 'cancelled';
      }
      if (filter === 'completed') return b.status === 'completed';
      if (filter === 'cancelled') return b.status === 'cancelled';
      if (filter === 'pending') return b.status === 'pending';
      if (filter === 'serving') return b.status === 'serving';
      return true;
    })
    .filter(b => filterByDateRange(b))
    .filter(b => {
      if (!searchTerm) return true;
      const doctor = getDoctor(b.doctorId);
      return (
        b.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.tokenId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };



  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', class: 'pending' },
      serving: { text: 'In Progress', class: 'serving' },
      completed: { text: 'Completed', class: 'completed' },
      cancelled: { text: 'Cancelled', class: 'cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      serving: '🔄',
      completed: '✅',
      cancelled: '❌'
    };
    return icons[status] || icons.pending;
  };

  const totalStats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    upcoming: bookings.filter(b => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(b.bookingDate) >= new Date(today) && b.status !== 'cancelled';
    }).length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    console.log('Cancel booking:', selectedBooking?.tokenId);
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const openPrescription = (booking) => {
    setSelectedBooking(booking);
    setShowPrescriptionModal(true);
  };

  const isToday = (date) => {
    const bookingDate = new Date(date);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  };

  const isTomorrow = (date) => {
    const bookingDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return bookingDate.toDateString() === tomorrow.toDateString();
  };

  return (
    <div className="booking-history-page">
      <div className="bh-container">
        <div className="bh-header">
          <h1>📋 My Booking History</h1>
          <p>Track all your appointments and tokens</p>
        </div>

        <div className="bh-stats">
          <div className="bh-stat" onClick={() => setFilter('all')}>
            <span className="stat-icon">📊</span>
            <span className="stat-value">{totalStats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="bh-stat upcoming" onClick={() => setFilter('upcoming')}>
            <span className="stat-icon">📅</span>
            <span className="stat-value">{totalStats.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
          <div className="bh-stat completed" onClick={() => setFilter('completed')}>
            <span className="stat-icon">✅</span>
            <span className="stat-value">{totalStats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="bh-stat cancelled-stat" onClick={() => setFilter('cancelled')}>
            <span className="stat-icon">❌</span>
            <span className="stat-value">{totalStats.cancelled}</span>
            <span className="stat-label">Cancelled</span>
          </div>
        </div>

        <div className="bh-filters">
          <div className="bh-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by doctor, token ID, or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="bh-filter-row">
            <div className="bh-filter-tabs">
              {['all', 'upcoming', 'pending', 'serving', 'completed', 'cancelled'].map(f => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="bh-date-filter">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="bh-view-toggle">
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                📋
              </button>
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
                ⊞
              </button>
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bh-empty">
            <span className="empty-icon">📭</span>
            <h3>No bookings found</h3>
            <p>{searchTerm ? 'Try a different search term' : 'You haven\'t made any bookings yet'}</p>
            <Link to="/find-doctor" className="bh-find-btn">Find a Doctor</Link>
          </div>
        ) : (
          <div className={`bh-list ${viewMode}`}>
            {filteredBookings.map((booking) => {
              const doctor = getDoctor(booking.doctorId);
              const status = getStatusBadge(booking.status);
              const bookingDate = booking.bookingDate || booking.createdAt;
              const dateLabel = isToday(bookingDate) ? 'Today' : isTomorrow(bookingDate) ? 'Tomorrow' : formatDate(bookingDate);
              
              return (
                <div key={booking._id || booking.tokenId} className={`bh-card ${booking.status}`}>
                  <div className="bh-card-header">
                    <div className="bh-token">
                      <span className="token-icon">{getStatusIcon(booking.status)}</span>
                      <span className="token-num">#{booking.tokenNumber}</span>
                      <span className="token-id">{booking.tokenId}</span>
                      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <span className="current-token">Current: #{tokenStates[booking.doctorId]?.currentToken || 1}</span>
                      )}
                    </div>
                    <div className="bh-header-right">
                      {isToday(bookingDate) && booking.status === 'pending' && (
                        <span className="today-badge">🔥 Today</span>
                      )}
                      <span className={`bh-status ${status.class}`}>{status.text}</span>
                    </div>
                  </div>

                  <div className="bh-card-body" onClick={() => openDetails(booking)}>
                    <div className="bh-doctor">
                      <span className="doctor-icon">{doctor?.icon || '👨‍⚕️'}</span>
                      <div className="doctor-info">
                        <span className="doctor-name">{doctor?.name || booking.doctorId?.name || 'Doctor'}</span>
                        <span className="doctor-specialty">{doctor?.specialty || booking.doctorId?.specialty || 'General'}</span>
                      </div>
                    </div>

                    <div className="bh-details">
                      <div className="bh-detail">
                        <span className="detail-icon">📅</span>
                        <span className={isToday(bookingDate) ? 'today-text' : ''}>{dateLabel}</span>
                      </div>
                      <div className="bh-detail">
                        <span className="detail-icon">⏰</span>
                        <span>{booking.session === 'morning' ? '🌅 Morning' : '🌙 Evening'}</span>
                      </div>
                      <div className="bh-detail">
                        <span className="detail-icon">{booking.visitType === 'online' ? '📹' : '🏥'}</span>
                        <span>{booking.visitType === 'online' ? 'Video Consult' : 'Clinic Visit'}</span>
                      </div>
                      <div className="bh-detail">
                        <span className="detail-icon">💰</span>
                        <span>₹{booking.fee || doctor?.fee || 0}</span>
                      </div>
                    </div>

                    {booking.symptoms && (
                      <div className="bh-symptoms">
                        <span className="symptoms-label">Symptoms:</span>
                        <span className="symptoms-text">{booking.symptoms}</span>
                      </div>
                    )}
                  </div>

                  <div className="bh-card-footer">
                    <div className="bh-patient">
                      <span>👤 {booking.patientName}</span>
                      {booking.patientPhone && <span>📱 {booking.patientPhone}</span>}
                    </div>
                    <div className="bh-actions">
                      {booking.status === 'pending' && (
                        <>
                          <button className="bh-btn details" onClick={() => openDetails(booking)}>
                            Details
                          </button>
                          <button className="bh-btn cancel" onClick={() => handleCancelBooking(booking)}>
                            Cancel
                          </button>
                          <button className="bh-btn track" onClick={() => navigate(`/live-tracking?doctorId=${booking.doctorId?._id || booking.doctorId}&session=${booking.session}&type=${booking.visitType}`)}>
                            📍 Track Live
                          </button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <>
                          <button className="bh-btn prescription" onClick={() => openPrescription(booking)}>
                            📄 Prescription
                          </button>
                          <button className="bh-btn book-again" onClick={() => navigate(`/doctor/${booking.doctorId?._id || booking.doctorId}`)}>
                            Book Again
                          </button>
                        </>
                      )}
                      {booking.status === 'serving' && (
                        <button className="bh-btn track" onClick={() => navigate(`/live-tracking?doctorId=${booking.doctorId?._id || booking.doctorId}&session=${booking.session}&type=${booking.visitType}`)}>
                          📍 Track Now
                        </button>
                      )}
                      <button className="bh-btn book-again" onClick={() => navigate(`/doctor/${booking.doctorId?._id || booking.doctorId}`)}>
                        Book Again
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="bh-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="bh-modal" onClick={e => e.stopPropagation()}>
            <div className="bh-modal-header">
              <h3>Cancel Booking</h3>
              <button className="close-btn" onClick={() => setShowCancelModal(false)}>×</button>
            </div>
            <div className="bh-modal-body">
              <p>Are you sure you want to cancel this booking?</p>
              <div className="cancel-details">
                <p><strong>Token:</strong> #{selectedBooking?.tokenNumber}</p>
                <p><strong>Date:</strong> {formatDate(selectedBooking?.bookingDate)}</p>
                <p><strong>Session:</strong> {selectedBooking?.session === 'morning' ? 'Morning' : 'Evening'}</p>
              </div>
              <p className="warning-text">⚠️ This action cannot be undone.</p>
            </div>
            <div className="bh-modal-footer">
              <button className="bh-btn cancel-modal" onClick={confirmCancel}>
                Yes, Cancel Booking
              </button>
              <button className="bh-btn keep-booking" onClick={() => setShowCancelModal(false)}>
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedBooking && (
        <div className="bh-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="bh-modal details-modal" onClick={e => e.stopPropagation()}>
            <div className="bh-modal-header">
              <h3>Booking Details</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="bh-modal-body">
              <div className="detail-section">
                <h4>Appointment</h4>
                <div className="detail-row">
                  <span>Token Number</span>
                  <strong>#{selectedBooking.tokenNumber}</strong>
                </div>
                <div className="detail-row">
                  <span>Token ID</span>
                  <strong>{selectedBooking.tokenId}</strong>
                </div>
                <div className="detail-row">
                  <span>Date & Time</span>
                  <strong>{formatDate(selectedBooking.bookingDate)}</strong>
                </div>
                <div className="detail-row">
                  <span>Session</span>
                  <strong>{selectedBooking.session === 'morning' ? '🌅 Morning (9AM-1PM)' : '🌙 Evening (5PM-9PM)'}</strong>
                </div>
                <div className="detail-row">
                  <span>Status</span>
                  <span className={`bh-status ${getStatusBadge(selectedBooking.status).class}`}>
                    {getStatusBadge(selectedBooking.status).text}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Doctor</h4>
                <div className="detail-row">
                  <span>Name</span>
                  <strong>{getDoctor(selectedBooking.doctorId)?.name || selectedBooking.doctorId?.name || 'Doctor'}</strong>
                </div>
                <div className="detail-row">
                  <span>Specialty</span>
                  <strong>{getDoctor(selectedBooking.doctorId)?.specialty || 'General'}</strong>
                </div>
                <div className="detail-row">
                  <span>Clinic</span>
                  <strong>{getDoctor(selectedBooking.doctorId)?.clinicName || 'Clinic'}</strong>
                </div>
                <div className="detail-row">
                  <span>Location</span>
                  <strong>{getDoctor(selectedBooking.doctorId)?.location || 'N/A'}</strong>
                </div>
              </div>

              <div className="detail-section">
                <h4>Patient</h4>
                <div className="detail-row">
                  <span>Name</span>
                  <strong>{selectedBooking.patientName}</strong>
                </div>
                <div className="detail-row">
                  <span>Phone</span>
                  <strong>{selectedBooking.patientPhone || 'N/A'}</strong>
                </div>
                <div className="detail-row">
                  <span>Visit Type</span>
                  <strong>{selectedBooking.visitType === 'online' ? '📹 Video Consultation' : '🏥 Clinic Visit'}</strong>
                </div>
              </div>

              <div className="detail-section">
                <h4>Payment</h4>
                <div className="detail-row">
                  <span>Consultation Fee</span>
                  <strong className="fee">₹{selectedBooking.fee || getDoctor(selectedBooking.doctorId)?.fee || 0}</strong>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="detail-section">
                  <h4>Notes</h4>
                  <p className="notes-text">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            <div className="bh-modal-footer">
              <button className="bh-btn share-btn" onClick={() => {
                navigator.clipboard.writeText(`Booking #${selectedBooking.tokenNumber} - Token ID: ${selectedBooking.tokenId}`);
                alert('Booking details copied!');
              }}>
                📋 Copy Details
              </button>
              <button className="bh-btn close-modal" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrescriptionModal && selectedBooking && (
        <BookingPrescriptionModal
          booking={selectedBooking}
          doctor={getDoctor(selectedBooking.doctorId)}
          clinic={clinics.find(c => c._id === getDoctor(selectedBooking.doctorId)?.clinicId || c.id === getDoctor(selectedBooking.doctorId)?.clinicId)}
          onClose={() => {
            setShowPrescriptionModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}

export default BookingHistory;
