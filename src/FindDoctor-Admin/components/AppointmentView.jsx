import React, { useState } from 'react';

const AppointmentView = ({ bookings, doctors, onUpdateBookingStatus, onStatusChange }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [viewType, setViewType] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);

    const filtered = (bookings || []).filter(b => {
        const matchSearch = !search ||
            b.patientName?.toLowerCase().includes(search.toLowerCase()) ||
            String(b.tokenNumber).includes(search);
        
        const matchFilter = filter === 'all' ||
            (filter === 'completed' && b.status === 'completed') ||
            (filter === 'pending' && b.status !== 'completed' && b.status !== 'cancelled') ||
            (filter === 'cancelled' && b.status === 'cancelled');
            
        const matchViewType = viewType === 'all' ||
            (viewType === 'walk-in' && b.visitType === 'walk-in') ||
            (viewType === 'online' && b.visitType === 'online') ||
            (viewType === 'clinic' && (!b.visitType || b.visitType === 'clinic'));
            
        return matchSearch && matchFilter && matchViewType;
    });

    const getDoctor = (booking) => {
        const bId = (booking.doctorId?._id || booking.doctorId)?.toString();
        return (doctors || []).find(d => (d._id || d.id?.toString()) === bId);
    };

    const getVisitTypeIcon = (type) => {
        switch(type) {
            case 'walk-in': return '🚶';
            case 'online': return '📹';
            default: return '🏥';
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    return (
        <div className="appointment-tracking-view">
            <div className="tracking-filters">
                <div className="search-bar-premium">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search patient name or token..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-pills">
                    {['all', 'pending', 'completed', 'cancelled'].map(f => (
                        <button
                            key={f}
                            className={`pill ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="view-type-pills">
                    {['all', 'walk-in', 'online', 'clinic'].map(t => (
                        <button
                            key={t}
                            className={`pill ${viewType === t ? 'active' : ''}`}
                            onClick={() => setViewType(t)}
                        >
                            {t === 'all' ? 'All' : getVisitTypeIcon(t)} {t === 'all' ? 'All' : t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="premium-table-container">
                <table className="premium-appointments-table">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Patient Details</th>
                            <th>Type</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Session</th>
                            <th>Fee</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(book => {
                            const doc = getDoctor(book);
                            return (
                                <tr 
                                    key={book.tokenId || book.tokenNumber}
                                    className={selectedBooking === book ? 'selected' : ''}
                                    onClick={() => setSelectedBooking(selectedBooking === book ? null : book)}
                                >
                                    <td>
                                        <span className="token-badge">#{book.tokenNumber}</span>
                                    </td>
                                    <td>
                                        <div className="patient-cell">
                                            <strong>{book.patientName}</strong>
                                            <span>📞 {book.phone || book.patientPhone || 'No contact'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`type-pill ${book.visitType || 'clinic'}`}>
                                            {getVisitTypeIcon(book.visitType)} {book.visitType || 'clinic'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="doctor-cell">
                                            <span>{doc?.icon || '👨‍⚕️'}</span>
                                            <span>{doc?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {book.bookingDate ? new Date(book.bookingDate).toLocaleDateString('en-IN') : 'N/A'}
                                    </td>
                                    <td>
                                        <span className={`session-pill ${book.session}`}>
                                            {book.session === 'morning' ? '🌅' : '🌙'} {book.session}
                                        </span>
                                    </td>
                                    <td>₹{book.fee || 0}</td>
                                    <td>
                                        <span 
                                            className="status-indicator"
                                            style={{ background: getStatusColor(book.status) }}
                                        >
                                            {book.status || 'pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {book.status !== 'completed' && book.status !== 'cancelled' && (
                                                <>
                                                    <button 
                                                        className="action-btn complete"
                                                        title="Mark Completed"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const bookingId = book._id || book.id || book.tokenId;
                                                            if (onUpdateBookingStatus) {
                                                                onUpdateBookingStatus(bookingId, 'completed');
                                                                if (onStatusChange) onStatusChange();
                                                            }
                                                        }}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button 
                                                        className="action-btn cancel"
                                                        title="Cancel Booking"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const bookingId = book._id || book.id || book.tokenId;
                                                            if (confirm('Are you sure you want to cancel this booking?')) {
                                                                if (onUpdateBookingStatus) {
                                                                    onUpdateBookingStatus(bookingId, 'cancelled');
                                                                    if (onStatusChange) onStatusChange();
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                className="table-action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBooking(book);
                                                }}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="9" className="table-empty">
                                    {search ? `No results for "${search}"` : 'No bookings found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedBooking && (
                <div className="booking-detail-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>📋 Booking Details</h3>
                            <button onClick={() => setSelectedBooking(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Patient Name</label>
                                    <span>{selectedBooking.patientName}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Phone</label>
                                    <span>{selectedBooking.phone || selectedBooking.patientPhone || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Visit Type</label>
                                    <span className={`type-badge ${selectedBooking.visitType}`}>
                                        {getVisitTypeIcon(selectedBooking.visitType)} {selectedBooking.visitType || 'clinic'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Token Number</label>
                                    <span>#{selectedBooking.tokenNumber}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Doctor</label>
                                    <span>{getDoctor(selectedBooking)?.name || 'Unknown'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Date</label>
                                    <span>{selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Session</label>
                                    <span>{selectedBooking.session === 'morning' ? '🌅 Morning' : '🌙 Evening'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Fee</label>
                                    <span>₹{selectedBooking.fee || 0}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Status</label>
                                    <span className="status-badge" style={{ background: getStatusColor(selectedBooking.status) }}>
                                        {selectedBooking.status || 'pending'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Created At</label>
                                    <span>{selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString('en-IN') : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentView;
