import React, { useState, useMemo, useEffect } from 'react';
import { bookToken, fetchBookings } from '../../api/bookingsApi';

const WalkInPatient = ({ doctors, onBookToken, clinic, tokenBookings = [] }) => {
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [session, setSession] = useState('morning');
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [showTokenGenerated, setShowTokenGenerated] = useState(false);
    const [generatedToken, setGeneratedToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dbBookings, setDbBookings] = useState([]);
    const [showTokenList, setShowTokenList] = useState(false);

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const response = await fetchBookings({ visitType: 'walk-in' });
                if (response.success) {
                    setDbBookings(response.data);
                }
            } catch (error) {
                console.error('Error fetching walk-in bookings:', error);
            }
        };
        loadBookings();
    }, []);

    const allBookings = useMemo(() => {
        return [...tokenBookings, ...dbBookings];
    }, [tokenBookings, dbBookings]);

    const clinicDoctors = doctors.filter(d => d.clinicName === clinic?.name);
    const selectedDoc = clinicDoctors.find(d => (d._id || d.id) === selectedDoctor);

    const nextTokenNumber = useMemo(() => {
        const doctorBookings = allBookings.filter(b => 
            (b.doctorId === selectedDoctor || b.doctorId?._id === selectedDoctor || b.doctorId === selectedDoc?._id) &&
            b.session === session &&
            (b.bookingDate === bookingDate || new Date(b.bookingDate).toISOString().split('T')[0] === bookingDate)
        );
        
        if (doctorBookings.length === 0) return 1;
        
        const maxToken = Math.max(...doctorBookings.map(b => b.tokenNumber || 0));
        return maxToken + 1;
    }, [selectedDoctor, session, allBookings, selectedDoc, bookingDate]);

    const todaySessionBookings = useMemo(() => {
        return allBookings.filter(b => 
            (b.doctorId === selectedDoctor || b.doctorId?._id === selectedDoctor || b.doctorId === selectedDoc?._id) &&
            b.session === session &&
            (b.bookingDate === bookingDate || new Date(b.bookingDate).toISOString().split('T')[0] === bookingDate)
        ).sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));
    }, [selectedDoctor, session, allBookings, selectedDoc, bookingDate]);

    const totalTokens = session === 'morning' 
        ? selectedDoc?.schedule?.morning?.totalTokens || 20 
        : selectedDoc?.schedule?.evening?.totalTokens || 15;

    const availableTokens = totalTokens - todaySessionBookings.length;

    const handleGenerateToken = async () => {
        if (!selectedDoctor || !patientName || !patientPhone) {
            alert('Please fill all fields');
            return;
        }

        if (availableTokens <= 0) {
            alert('No tokens available for this session. Please select another session.');
            return;
        }

        setLoading(true);
        try {
            const response = await bookToken({
                doctorId: selectedDoctor,
                session,
                visitType: 'walk-in',
                patientName,
                patientPhone,
                bookingDate
            });

            console.log('Token response:', response);

            if (response.success) {
                const booking = response.data;
                console.log('Booking saved:', booking);
                
                const tokenData = {
                    ...booking,
                    doctorName: selectedDoc?.name || 'Doctor',
                    time: session === 'morning' 
                        ? (selectedDoc?.schedule?.morning?.start || '09:00') 
                        : (selectedDoc?.schedule?.evening?.start || '17:00'),
                    specialty: selectedDoc?.specialty || 'General',
                    fee: selectedDoc?.fee || 500
                };
                
                console.log('Setting token data:', tokenData);
                setGeneratedToken(tokenData);
                setShowTokenGenerated(true);
                
                setDbBookings(prev => [...prev, booking]);
                
                if (onBookToken) {
                    onBookToken(booking);
                }
            } else {
                alert('Failed to generate token');
            }
        } catch (error) {
            console.error('Error booking token:', error);
            if (error.response?.data?.full) {
                alert(error.response.data.error);
            } else if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert('Failed to generate token. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setShowTokenGenerated(false);
        setGeneratedToken(null);
        setBookingDate(new Date().toISOString().split('T')[0]);
        setPatientName('');
        setPatientPhone('');
        setSelectedDoctor('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#22c55e';
            case 'serving': return '#3b82f6';
            case 'cancelled': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const handlePrint = () => {
        const tokenDate = new Date(generatedToken.bookingDate).toLocaleDateString('en-IN', { 
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
        });
        const docName = generatedToken.doctorName || selectedDoc?.name || 'Doctor';
        const specialty = generatedToken.specialty || selectedDoc?.specialty || 'General';
        const fee = generatedToken.fee || selectedDoc?.fee || 500;
        const sessionTime = generatedToken.session === 'morning' ? '🌅 Morning' : '🌙 Evening';
        const startTime = generatedToken.time || (generatedToken.session === 'morning' ? selectedDoc?.schedule?.morning?.start : selectedDoc?.schedule?.evening?.start) || 'N/A';
        const clinicName = clinic?.name || selectedDoc?.clinicName || 'Medicare+ Clinic';
        const clinicAddress = clinic?.address || selectedDoc?.location || '';
        
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Token - ${generatedToken.tokenNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; background: #fff; }
        .token-slip { width: 380px; margin: 0 auto; background: #fff; border: 2px solid #0066ff; }
        .header { background: #0066ff; color: white; padding: 20px; text-align: center; }
        .header-icon { font-size: 2rem; margin-bottom: 5px; }
        .header h1 { font-size: 1.3rem; margin-bottom: 5px; }
        .header p { font-size: 0.85rem; opacity: 0.9; }
        .token-main { background: #f0f9ff; padding: 25px; text-align: center; border-bottom: 2px dashed #0066ff; }
        .token-number { font-size: 4rem; font-weight: bold; color: #0066ff; line-height: 1; }
        .token-label { font-size: 0.9rem; color: #0066ff; font-weight: 600; margin-top: 5px; }
        .patient-info { padding: 15px; text-align: center; border-bottom: 1px solid #ddd; }
        .patient-name { font-size: 1.2rem; font-weight: 700; color: #1e293b; }
        .patient-phone { font-size: 0.85rem; color: #64748b; margin-top: 5px; }
        .details { padding: 15px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #64748b; font-size: 0.85rem; }
        .detail-value { color: #1e293b; font-weight: 600; font-size: 0.85rem; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #ddd; }
        .clinic-name { font-weight: bold; font-size: 0.95rem; color: #0066ff; }
        .clinic-address { font-size: 0.8rem; color: #64748b; margin-top: 3px; }
        .thank-you { font-size: 0.8rem; color: #475569; margin-top: 10px; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div class="token-slip">
        <div class="header">
            <div class="header-icon">🏥</div>
            <h1>${clinicName}</h1>
            <p>Appointment Token</p>
        </div>
        <div class="token-main">
            <div class="token-number">#${generatedToken.tokenNumber}</div>
            <div class="token-label">TOKEN NUMBER</div>
        </div>
        <div class="patient-info">
            <div class="patient-name">${generatedToken.patientName}</div>
            <div class="patient-phone">📱 ${generatedToken.patientPhone || 'N/A'}</div>
        </div>
        <div class="details">
            <div class="detail-row"><span class="detail-label">📅 Date</span><span class="detail-value">${tokenDate}</span></div>
            <div class="detail-row"><span class="detail-label">⏰ Session</span><span class="detail-value">${sessionTime}</span></div>
            <div class="detail-row"><span class="detail-label">👨‍⚕️ Doctor</span><span class="detail-value">${docName}</span></div>
            <div class="detail-row"><span class="detail-label">🏥 Specialty</span><span class="detail-value">${specialty}</span></div>
            <div class="detail-row"><span class="detail-label">🚶 Visit Type</span><span class="detail-value">Walk-in</span></div>
            <div class="detail-row"><span class="detail-label">💰 Consultation Fee</span><span class="detail-value">₹${fee}</span></div>
            <div class="detail-row"><span class="detail-label">🕐 Time</span><span class="detail-value">${startTime}</span></div>
        </div>
        <div class="footer">
            <div class="clinic-name">${clinicName}</div>
            <div class="clinic-address">${clinicAddress}</div>
            <div class="thank-you">Please carry this token. Thank you!</div>
        </div>
    </div>
</body>
</html>`;
        
        const printWindow = window.open('', '_blank', 'width=500,height=700');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); }, 300);
        } else {
            alert('Please allow popups to print');
        }
    };

    if (showTokenGenerated && generatedToken) {
        const tokenDate = new Date(generatedToken.bookingDate).toLocaleDateString('en-IN', { 
            weekday: 'short', 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
        const docName = generatedToken.doctorName || selectedDoc?.name || 'Doctor';
        const specialty = generatedToken.specialty || selectedDoc?.specialty || 'General';
        const fee = generatedToken.fee || selectedDoc?.fee || 500;
        const sessionTime = generatedToken.session === 'morning' ? '🌅 Morning' : '🌙 Evening';
        const startTime = generatedToken.time || (generatedToken.session === 'morning' ? selectedDoc?.schedule?.morning?.start : selectedDoc?.schedule?.evening?.start) || 'N/A';
        
        return (
            <div className="walkin-success">
                <div className="success-card" style={{ background: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '450px', margin: '0 auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', textAlign: 'center', color: '#1e293b' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                    <h2 style={{ margin: '0 0 25px 0', color: '#1e293b' }}>Token Generated!</h2>
                    
                    <div style={{ background: 'linear-gradient(135deg, #0066ff, #0044cc)', borderRadius: '16px', padding: '25px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'white' }}>#{generatedToken.tokenNumber}</div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>TOKEN NUMBER</div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '15px', marginBottom: '20px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>Patient:</span>
                            <strong style={{ color: '#1e293b' }}>{generatedToken.patientName}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>Phone:</span>
                            <strong style={{ color: '#1e293b' }}>{generatedToken.patientPhone || 'N/A'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>Date:</span>
                            <strong style={{ color: '#1e293b' }}>{tokenDate}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>Doctor:</span>
                            <strong style={{ color: '#1e293b' }}>{docName}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>Session:</span>
                            <strong style={{ color: '#1e293b' }}>{sessionTime}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>Time:</span>
                            <strong style={{ color: '#1e293b' }}>{startTime}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                            <span style={{ color: '#64748b' }}>Fee:</span>
                            <strong style={{ color: '#1e293b' }}>₹{fee}</strong>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handlePrint}
                        style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0066ff, #0044cc)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}
                    >
                        🖨️ Print Token
                    </button>
                    
                    <button 
                        onClick={handleReset}
                        style={{ width: '100%', padding: '14px', background: '#f1f5f9', border: '2px solid #e2e8f0', borderRadius: '10px', color: '#475569', fontSize: '1rem', cursor: 'pointer' }}
                    >
                        + Generate New Token
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="walkin-generator">
            <div className="walkin-header">
                <h2>🚶 Walk-in Patient</h2>
                <p>Generate tokens for patients who visit the clinic</p>
            </div>

            <div className="walkin-form">
                <div className="form-group">
                    <label>Select Doctor</label>
                    <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                        <option value="">-- Select Doctor --</option>
                        {clinicDoctors.map(doc => {
                            const docId = doc._id || doc.id;
                            const isAvailable = session === 'morning' 
                                ? doc.schedule?.morning?.active 
                                : doc.schedule?.evening?.active;
                            
                            return (
                                <option key={docId} value={docId} disabled={!isAvailable}>
                                    {doc.name} - {doc.specialty} {!isAvailable && '(Not Available)'}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="form-group">
                    <label>Appointment Date</label>
                    <input
                        type="date"
                        value={bookingDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="date-picker"
                    />
                </div>

                <div className="form-group">
                    <label>Session</label>
                    <div className="session-toggle">
                        <button
                            className={session === 'morning' ? 'active' : ''}
                            onClick={() => setSession('morning')}
                            disabled={!selectedDoc?.schedule?.morning?.active}
                        >
                            🌅 Morning
                        </button>
                        <button
                            className={session === 'evening' ? 'active' : ''}
                            onClick={() => setSession('evening')}
                            disabled={!selectedDoc?.schedule?.evening?.active}
                        >
                            🌙 Evening
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Patient Name</label>
                    <input
                        type="text"
                        placeholder="Enter patient name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                    />
                </div>

                {selectedDoc && (
                    <div className="fee-info">
                        <span>Consultation Fee:</span>
                        <strong>₹{selectedDoc.fee || 500}</strong>
                    </div>
                )}

                {selectedDoc && (
                    <div className="token-availability">
                        <div className="availability-info">
                            <span>Available Tokens:</span>
                            <strong className={availableTokens <= 5 ? 'low' : ''}>
                                {availableTokens} / {totalTokens}
                            </strong>
                        </div>
                        <div 
                            className="next-token-info clickable"
                            onClick={() => setShowTokenList(!showTokenList)}
                        >
                            <span>Next Token:</span>
                            <strong>#{nextTokenNumber}</strong>
                            <span className="toggle-arrow">{showTokenList ? '▲' : '▼'}</span>
                        </div>
                    </div>
                )}

                {selectedDoc && showTokenList && (
                    <div className="token-list-section">
                        <h4>📋 Booked Tokens</h4>
                        {todaySessionBookings.length > 0 ? (
                            <div className="token-list">
                                {todaySessionBookings.map((booking, idx) => (
                                    <div key={booking._id || booking.id || idx} className="token-list-item">
                                        <div className="token-list-left">
                                            <span className="token-list-number">#{booking.tokenNumber}</span>
                                            <span className="token-list-status" style={{ background: getStatusColor(booking.status) }}>
                                                {booking.status || 'pending'}
                                            </span>
                                        </div>
                                        <div className="token-list-info">
                                            <span className="token-list-name">{booking.patientName}</span>
                                            <span className="token-list-phone">{booking.patientPhone || booking.phone || 'N/A'}</span>
                                        </div>
                                        <div className="token-list-time">
                                            {booking.estimatedWait && booking.status === 'pending' && (
                                                <span className="wait-time">Wait: {booking.estimatedWait}m</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-tokens-msg">No tokens booked yet for this session</p>
                        )}
                    </div>
                )}

                <button 
                    className="generate-btn"
                    onClick={handleGenerateToken}
                    disabled={!selectedDoctor || !patientName || !patientPhone || availableTokens <= 0 || loading}
                >
                    {loading ? 'Generating...' : '🎫 Generate Token'}
                </button>
            </div>

            {selectedDoc && (
                <div className="doctor-schedule-info">
                    <h4>Doctor's Schedule</h4>
                    <div className="schedule-row">
                        <div className="schedule-session">
                            <span>🌅 Morning</span>
                            <span>{selectedDoc.schedule?.morning?.active 
                                ? `${selectedDoc.schedule.morning.start} - ${selectedDoc.schedule.morning.end}`
                                : 'Not Available'}
                            </span>
                        </div>
                        <div className="schedule-session">
                            <span>🌙 Evening</span>
                            <span>{selectedDoc.schedule?.evening?.active 
                                ? `${selectedDoc.schedule.evening.start} - ${selectedDoc.schedule.evening.end}`
                                : 'Not Available'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalkInPatient;
