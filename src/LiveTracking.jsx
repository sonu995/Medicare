import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './LiveTracking.css';

function LiveTracking({ tokenStates, tokenBookings, doctors }) {
    const [searchParams] = useSearchParams();
    const tokenId = searchParams.get('id');
    const doctorId = searchParams.get('doctorId');
    const sessionParam = searchParams.get('session');
    const typeParam = searchParams.get('type');
    const isTokenMode = !!tokenId;
    const isQueueMode = !tokenId && !!doctorId && !!sessionParam;
    const [booking, setBooking] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [state, setState] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(0);
    const [remainingMinutes, setRemainingMinutes] = useState(0);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [lastUpdated, setLastUpdated] = useState(null);
    const timerRef = useRef(null);
    const isWaiting = remainingMinutes > 0;
    const [searchTerm, setSearchTerm] = useState('');
    const bookedDoctors = useMemo(() => {
        if (!tokenBookings || tokenBookings.length === 0) return [];
        const doctorIds = [...new Set(tokenBookings.map(b => b.doctorId?._id || b.doctorId))];
        return doctorIds.map(id => doctors.find(d => d._id === id || d.id === id)).filter(Boolean);
    }, [tokenBookings, doctors]);

    const filteredDoctors = bookedDoctors.filter(doc => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            doc.name?.toLowerCase().includes(term) ||
            doc.specialty?.toLowerCase().includes(term) ||
            doc.clinicName?.toLowerCase().includes(term) ||
            doc.location?.toLowerCase().includes(term)
        );
    });

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                setNotificationPermission(permission);
            });
        }
    }, []);

    // Update booking, doctor, state when props change
    useEffect(() => {
        if (isTokenMode && tokenId && tokenBookings.length > 0) {
            const b = tokenBookings.find(b => b.tokenId === tokenId);
            if (b) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setBooking(b);
                const d = doctors.find(doc => (doc._id === b.doctorId || doc.id?.toString() === b.doctorId?.toString()));
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setDoctor(d);
                const s = tokenStates[b.doctorId] || { currentToken: 1, status: 'open' };
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setState(s);
                setLastUpdated(new Date());
            }
        } else if (isQueueMode && doctorId && doctors.length > 0) {
            const d = doctors.find(doc => (doc._id === doctorId || doc.id?.toString() === doctorId));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDoctor(d);
            const s = tokenStates[doctorId] || { currentToken: 1, status: 'open' };
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState(s);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBooking(null);
            setLastUpdated(new Date());
        }
    }, [isTokenMode, isQueueMode, tokenId, doctorId, tokenBookings, tokenStates, doctors, autoRefresh]);

    // Calculate remaining minutes based on current token and token duration
    const calculateRemainingMinutes = useCallback(() => {
        if (!booking || !state || !doctor) return 0;
        const tokensToWait = booking.tokenNumber - (state.currentToken || 1);
        if (tokensToWait <= 0) return 0;
        const sessionSchedule = doctor.schedule?.[booking.session];
        const tokenDuration = sessionSchedule?.tokenDuration || 10;
        return tokensToWait * tokenDuration;
    }, [booking, state, doctor]);

    // Derived data for token mode
    const tokensToWait = isTokenMode && booking ? booking.tokenNumber - (state?.currentToken || 1) : 0;
    const progressPercent = isTokenMode && booking ? Math.min(100, ((state?.currentToken || 1) / booking.tokenNumber) * 100) : 0;

    // Derived data for queue mode
    const sessionData = isQueueMode && doctor?.schedule?.[sessionParam];
    const issuedCount = isQueueMode ? tokenBookings.filter(b => {
        const bDocId = (b.doctorId?._id || b.doctorId)?.toString();
        const bTargetId = doctorId;
        const bSession = b.session;
        const bDate = b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : '';
        const today = new Date().toISOString().split('T')[0];
        return bDocId === bTargetId && bSession === sessionParam && bDate === today;
    }).length : 0;
    const totalTokens = sessionData?.totalTokens || 0;
    const currentToken = state?.currentToken || 1;
    const tokensLeft = totalTokens - issuedCount;

    const queueTokens = useMemo(() => {
        if (isQueueMode && state) {
            const current = state.currentToken || 1;
            const tokens = [];
            const start = Math.max(1, current - 2);
            const end = Math.min(current + 10, totalTokens || current + 10);
            for (let i = start; i <= end; i++) {
                let type = 'between';
                if (i === current) type = 'current';
                tokens.push({ number: i, type });
            }
            return tokens;
        }
        if (!booking || !state) return [];
        const current = state.currentToken || 1;
        const user = booking.tokenNumber;
        const tokens = [];
        const start = Math.max(1, current - 2);
        const end = Math.min(current + 10, user + 5);
        for (let i = start; i <= end; i++) {
            let type = 'between';
            if (i === current) type = 'current';
            else if (i === user) type = 'your-token';
            tokens.push({ number: i, type });
        }
        return tokens;
    }, [booking, state, isQueueMode, totalTokens]);

    // Update remaining minutes when dependencies change
    useEffect(() => {
        const minutes = calculateRemainingMinutes();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRemainingMinutes(minutes);
    }, [calculateRemainingMinutes]);

    // Countdown timer that ticks every minute
    useEffect(() => {
        if (isWaiting) {
            timerRef.current = setInterval(() => {
                setRemainingMinutes(prev => Math.max(0, prev - 1));
            }, 60000); // every minute
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isWaiting]); // restart timer when waiting status changes

    // Show notification when token is about to be called (within 2 tokens)
    useEffect(() => {
        if (!booking || !state || notificationPermission !== 'granted') return;
        const tokensToWait = booking.tokenNumber - (state.currentToken || 1);
        if (tokensToWait === 2) {
            new Notification('Your token is almost up!', {
                body: `Token #${booking.tokenNumber} will be called in approximately ${remainingMinutes} minutes.`,
                icon: '/favicon.ico'
            });
        }
    }, [booking, state, notificationPermission, remainingMinutes]);

    // Auto-refresh every 30 seconds (keeping original behavior)
    useEffect(() => {
        const interval = setInterval(() => {
            setAutoRefresh(prev => prev + 1);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!tokenId && !isQueueMode) {
        return (
            <div className="tracking-container">
                <div className="tracking-wrapper">
                    <div className="tracking-header">
                        <div className="header-links">
                            <Link to="/" className="back-link">← Back to Home</Link>
                            <Link to="/my-bookings" className="back-link">My Bookings</Link>
                        </div>
                        <h1>Live Queue Tracking</h1>
                        <p>View queue status for your booked appointments</p>
                    </div>
                    
                    <div className="details-card">
                        {bookedDoctors.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="Search doctors by name, specialty, clinic..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        )}
                        {bookedDoctors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '20px' }}>You haven't booked any appointments yet.</p>
                                <Link to="/find-doctor" className="back-link" style={{ display: 'inline-block' }}>Find a Doctor</Link>
                            </div>
                        ) : (
                            <>
                                <h3>Your Booked Doctors ({filteredDoctors.length})</h3>
                                {filteredDoctors.length > 0 ? (
                                    filteredDoctors.map(doc => (
                                        <div key={doc._id || doc.id} className="detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                                <div className="detail-icon">👨‍⚕️</div>
                                                <div className="detail-content">
                                                    <Link 
                                                        to={`/live-tracking?doctorId=${doc._id || doc.id}&session=morning&type=clinic`} 
                                                        className="doctor-link"
                                                    >
                                                        <strong>{doc.name}</strong>
                                                    </Link>
                                                    <span>{doc.specialty}</span>
                                                </div>
                                            </div>
                                            <div style={{ marginLeft: '44px', marginTop: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                                🏥 {doc.clinicName} - {doc.location}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No doctors found matching your search.</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (isTokenMode && !booking) {
        return (
            <div className="tracking-container">
                <div className="tracking-wrapper">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <h2>Searching for booking...</h2>
                        <p>Token ID: {tokenId}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isQueueMode && !doctor) {
        return (
            <div className="tracking-container">
                <div className="tracking-wrapper">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <h2>Loading queue information...</h2>
                        <p>Doctor ID: {doctorId}</p>
                    </div>
                </div>
            </div>
        );
    }



    const getStatusClass = () => {
        if (tokensToWait < 0) return 'completed';
        if (tokensToWait === 0) return 'serving';
        return '';
    };

    const getTimeAgo = (date) => {
        if (!date) return '';
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return `${seconds} sec ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours} hr ago`;
    };

    if (isQueueMode && doctor && state) {
        return (
            <div className="tracking-container">
                <div className="tracking-wrapper">
                    <div className="tracking-header">
                        <div className="header-links">
                            <Link to="/" className="back-link">← Back to Home</Link>
                            <Link to="/my-bookings" className="back-link">My Bookings</Link>
                        </div>
                        <h1>Live Queue Tracking</h1>
                        <p>Queue status for Dr. {doctor?.name} ({sessionParam})</p>
                    </div>
                    <div className="token-display">
                        <div className="token-number">#{currentToken}</div>
                        <div className="token-label">Currently Serving Token</div>
                    </div>
                    <div className="status-card">
                        <div className="status-header">
                            <h3>Queue Status</h3>
                            <div className="live-badge">
                                <span className="dot"></span>
                                <span>Live</span>
                                {lastUpdated && (
                                    <span className="last-updated">Updated {getTimeAgo(lastUpdated)}</span>
                                )}
                            </div>
                        </div>
                        <div className="status-grid">
                            <div className="status-box current">
                                <div className="label">Currently Serving</div>
                                <div className="value">#{currentToken}</div>
                            </div>
                            <div className="status-box your-token">
                                <div className="label">Tokens Issued Today</div>
                                <div className="value">{issuedCount}</div>
                            </div>
                        </div>
                        <div className="wait-info">
                            <h4>{tokensLeft > 0 ? `${tokensLeft} tokens remaining` : 'All tokens issued for this session'}</h4>
                            <p>Session: {sessionParam === 'morning' ? 'Morning OPD' : 'Evening OPD'} ({sessionData?.start} – {sessionData?.end})</p>
                        </div>
                    </div>
                    <div className="refresh-section">
                        <button className="refresh-btn" onClick={() => setAutoRefresh(prev => prev + 1)}>
                            Refresh Status
                        </button>
                    </div>
                    <div className="queue-visualization">
                        <h4 className="queue-title">Queue Visualization</h4>
                        <div className="queue-tokens">
                            {queueTokens.map(token => (
                                <div key={token.number} className={`queue-token ${token.type}`}>
                                    {token.number}
                                </div>
                            ))}
                        </div>
                        <div className="queue-legend">
                            <div className="legend-item">
                                <div className="legend-dot current"></div>
                                <span>Currently Serving</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot between"></div>
                                <span>Other Tokens</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tracking-container">
            <div className="tracking-wrapper">
                <div className="tracking-header">
                    <div className="header-links">
                        <Link to="/" className="back-link">← Back to Home</Link>
                        <Link to="/my-bookings" className="back-link">My Bookings</Link>
                    </div>
                    <h1>Live Queue Tracking</h1>
                    <p>Track your token status in real-time</p>
                </div>

                <div className="token-display">
                    <div className="token-number">#{booking.tokenNumber}</div>
                    <div className="token-label">Your Token Number</div>
                </div>

                <div className="status-card">
                    <div className="status-header">
                        <h3>Queue Status</h3>
                        <div className="live-badge">
                            <span className="dot"></span>
                            <span>Live</span>
                            {lastUpdated && (
                                <span className="last-updated">Updated {getTimeAgo(lastUpdated)}</span>
                            )}
                        </div>
                    </div>

                    <div className="status-grid">
                        <div className="status-box current">
                            <div className="label">Currently Serving</div>
                            <div className="value">#{state?.currentToken || 1}</div>
                        </div>
                        <div className="status-box your-token">
                            <div className="label">Your Token</div>
                            <div className="value">#{booking.tokenNumber}</div>
                        </div>
                    </div>

                    <div className={`wait-info ${getStatusClass()}`}>
                        {tokensToWait > 0 ? (
                            <>
                                <h4>Estimated Wait Time</h4>
                                <span className="time">{remainingMinutes} min</span>
                                <p>{tokensToWait} patient(s) ahead of you</p>
                                <p className="countdown-text">Updates every minute</p>
                            </>
                        ) : tokensToWait === 0 ? (
                            <h4>You are being served now! Please proceed to the counter.</h4>
                        ) : (
                            <h4>Your appointment is completed. Thank you for visiting!</h4>
                        )}
                    </div>
                    
                    <div className="queue-actions">
                        {'Notification' in window && notificationPermission !== 'granted' && (
                            <button 
                                className="action-btn notification-btn"
                                onClick={() => {
                                    Notification.requestPermission().then(permission => {
                                        setNotificationPermission(permission);
                                    });
                                }}
                            >
                                🔔 Enable Notifications
                            </button>
                        )}
                        <button 
                            className="action-btn share-btn"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'My Queue Status',
                                        text: `Token #${booking.tokenNumber} at ${doctor?.name || 'Clinic'}`,
                                        url: window.location.href
                                    });
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                        >
                            📤 Share Queue Status
                        </button>
                    </div>

                    <div className="progress-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <div className="progress-labels">
                            <span>Token #{state?.currentToken || 1}</span>
                            <span>Your Token #{booking.tokenNumber}</span>
                        </div>
                    </div>
                </div>

                <div className="details-card">
                    <h3>Appointment Details</h3>
                    
                    <div className="detail-item">
                        <div className="detail-icon">👨‍⚕️</div>
                        <div className="detail-content">
                            {doctor ? (
                                <Link to={`/doctor/${doctor._id || doctor.id}`} className="doctor-link">
                                    <strong>{doctor.name}</strong>
                                </Link>
                            ) : (
                                <strong>Doctor</strong>
                            )}
                            <span>{doctor?.specialty || 'General Physician'}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon">🏥</div>
                        <div className="detail-content">
                            <strong>{doctor?.clinicName || 'Clinic'}</strong>
                            <span>{doctor?.location || 'Location'}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon">👤</div>
                        <div className="detail-content">
                            <strong>{booking.patientName}</strong>
                            <span>Token ID: {booking.tokenId}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon">📅</div>
                        <div className="detail-content">
                            <strong>{booking.session} Session</strong>
                            <span>{new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                <div className="refresh-section">
                    <button className="refresh-btn" onClick={() => setAutoRefresh(prev => prev + 1)}>
                        Refresh Status
                    </button>
                </div>
                    
                    <div className="queue-visualization">
                        <h4 className="queue-title">Queue Visualization</h4>
                        <div className="queue-tokens">
                            {queueTokens.map(token => (
                                <div key={token.number} className={`queue-token ${token.type}`}>
                                    {token.number}
                                </div>
                            ))}
                        </div>
                        <div className="queue-legend">
                            <div className="legend-item">
                                <div className="legend-dot current"></div>
                                <span>Currently Serving</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot your-token"></div>
                                <span>Your Token</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot between"></div>
                                <span>Other Tokens</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default LiveTracking;
