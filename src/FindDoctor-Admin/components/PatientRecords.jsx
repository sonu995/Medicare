import React, { useState, useMemo } from 'react';

const PatientRecords = ({ doctors, tokenBookings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('all');
    const [expandedPatient, setExpandedPatient] = useState(null);

    const doctorIds = doctors.map(d => d._id || d.id);

    const patients = useMemo(() => {
        const patientMap = new Map();
        
        tokenBookings
            .filter(b => doctorIds.includes(b.doctorId))
            .forEach(booking => {
                const patientName = booking.patientName || booking.name || 'Unknown';
                const phone = booking.phone || booking.patientPhone || 'N/A';
                const key = phone !== 'N/A' ? phone : patientName;
                
                if (!patientMap.has(key)) {
                    patientMap.set(key, {
                        name: patientName,
                        phone: phone,
                        email: booking.email || '',
                        visits: 0,
                        bookings: [],
                        totalSpent: 0,
                        lastVisit: null,
                        doctor: '',
                        visitTypes: { walkIn: 0, online: 0, clinic: 0 },
                        status: { pending: 0, completed: 0, cancelled: 0 }
                    });
                }
                
                const patient = patientMap.get(key);
                patient.visits++;
                patient.bookings.push(booking);
                patient.totalSpent += booking.fee || 0;
                
                const visitType = booking.visitType || 'clinic';
                patient.visitTypes[visitType] = (patient.visitTypes[visitType] || 0) + 1;
                
                const status = booking.status || 'pending';
                patient.status[status] = (patient.status[status] || 0) + 1;
                
                const bookingDate = new Date(booking.createdAt || booking.date || booking.bookingDate);
                if (!patient.lastVisit || bookingDate > new Date(patient.lastVisit)) {
                    patient.lastVisit = booking.createdAt || booking.date || booking.bookingDate;
                    patient.doctor = doctors.find(d => (d._id || d.id) === booking.doctorId)?.name || 'Unknown';
                }
            });

        return Array.from(patientMap.values()).sort((a, b) => 
            new Date(b.lastVisit) - new Date(a.lastVisit)
        );
    }, [tokenBookings, doctorIds, doctors]);

    const filteredPatients = useMemo(() => {
        return patients.filter(p => {
            const matchesSearch = !searchTerm || 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.phone.includes(searchTerm);
            const matchesDoctor = selectedDoctor === 'all' || p.doctor === selectedDoctor;
            return matchesSearch && matchesDoctor;
        });
    }, [patients, searchTerm, selectedDoctor]);

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
        <div className="patient-records">
            <div className="records-header">
                <h2>Patient Records</h2>
                <div className="records-filters">
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="doctor-filter"
                    >
                        <option value="all">All Doctors</option>
                        {doctors.map(doc => (
                            <option key={doc._id || doc.id} value={doc.name}>{doc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="records-stats">
                <div className="stat-item">
                    <span className="stat-num">{patients.length}</span>
                    <span className="stat-text">Total Patients</span>
                </div>
                <div className="stat-item">
                    <span className="stat-num">{patients.reduce((sum, p) => sum + p.visits, 0)}</span>
                    <span className="stat-text">Total Visits</span>
                </div>
                <div className="stat-item">
                    <span className="stat-num">₹{patients.reduce((sum, p) => sum + p.totalSpent, 0).toLocaleString()}</span>
                    <span className="stat-text">Total Revenue</span>
                </div>
            </div>

            <div className="patients-list">
                {filteredPatients.length === 0 ? (
                    <div className="no-patients">
                        <span className="no-icon">👥</span>
                        <p>No patients found</p>
                    </div>
                ) : (
                    filteredPatients.map((patient, idx) => (
                        <div key={idx} className="patient-card">
                            <div 
                                className="patient-card-main"
                                onClick={() => setExpandedPatient(expandedPatient === idx ? null : idx)}
                            >
                                <div className="patient-avatar">
                                    {patient.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="patient-info">
                                    <h4>{patient.name}</h4>
                                    <div className="patient-details">
                                        <span>📞 {patient.phone}</span>
                                        <span>👨‍⚕️ {patient.doctor}</span>
                                    </div>
                                    <div className="patient-badges">
                                        {patient.visitTypes.walkIn > 0 && (
                                            <span className="badge walk-in">🚶 {patient.visitTypes.walkIn}</span>
                                        )}
                                        {patient.visitTypes.online > 0 && (
                                            <span className="badge online">📹 {patient.visitTypes.online}</span>
                                        )}
                                        {patient.visitTypes.clinic > 0 && (
                                            <span className="badge clinic">🏥 {patient.visitTypes.clinic}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="patient-stats">
                                    <div className="stat">
                                        <span className="stat-value">{patient.visits}</span>
                                        <span className="stat-label">Visits</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">₹{patient.totalSpent.toLocaleString()}</span>
                                        <span className="stat-label">Spent</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">
                                            {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('en-IN') : 'N/A'}
                                        </span>
                                        <span className="stat-label">Last Visit</span>
                                    </div>
                                </div>
                                <div className="expand-icon">{expandedPatient === idx ? '▲' : '▼'}</div>
                            </div>
                            
                            {expandedPatient === idx && (
                                <div className="patient-bookings-detail">
                                    <h5>Booking History</h5>
                                    <div className="bookings-detail-table">
                                        <div className="detail-header">
                                            <span>Date</span>
                                            <span>Token</span>
                                            <span>Type</span>
                                            <span>Session</span>
                                            <span>Doctor</span>
                                            <span>Fee</span>
                                            <span>Status</span>
                                        </div>
                                        {patient.bookings.slice().reverse().map((booking, bIdx) => (
                                            <div key={bIdx} className="detail-row">
                                                <span>{new Date(booking.bookingDate || booking.createdAt).toLocaleDateString('en-IN')}</span>
                                                <span className="token-num">#{booking.tokenNumber}</span>
                                                <span className="type-badge">{getVisitTypeIcon(booking.visitType)} {booking.visitType || 'clinic'}</span>
                                                <span>{booking.session === 'morning' ? 'Morning' : 'Evening'}</span>
                                                <span>{doctors.find(d => (d._id || d.id) === booking.doctorId)?.name || 'N/A'}</span>
                                                <span>₹{booking.fee || 0}</span>
                                                <span className="status-badge" style={{ background: getStatusColor(booking.status) }}>
                                                    {booking.status || 'pending'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientRecords;
