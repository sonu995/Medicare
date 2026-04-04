import React, { useState, useMemo } from 'react';

const Earnings = ({ doctors, tokenBookings, clinic }) => {
    const [period, setPeriod] = useState('month');
    const [showBreakdown, setShowBreakdown] = useState(false);

    const clinicDoctors = doctors.filter(d => d.clinicName === clinic?.name);
    const doctorIds = clinicDoctors.map(d => d._id || d.id);

    const earningsData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        
        if (period === 'week') {
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        } else {
            startDate.setFullYear(now.getFullYear() - 1);
        }

        const filtered = tokenBookings.filter(b => {
            if (!doctorIds.includes(b.doctorId)) return false;
            const bookingDate = new Date(b.createdAt || b.date);
            return bookingDate >= startDate;
        });

        const totalEarnings = filtered.reduce((sum, b) => sum + (b.fee || 0), 0);
        const completedBookings = filtered.filter(b => b.status === 'completed').length;
        const pendingBookings = filtered.filter(b => b.status === 'pending').length;
        
        // Doctor breakdown
        const doctorEarnings = clinicDoctors.map(doc => {
            const docId = doc._id || doc.id;
            const docBookings = filtered.filter(b => b.doctorId === docId);
            return {
                id: docId,
                name: doc.name,
                icon: doc.icon,
                bookings: docBookings.length,
                earnings: docBookings.reduce((sum, b) => sum + (b.fee || 0), 0)
            };
        }).sort((a, b) => b.earnings - a.earnings);

        // Monthly breakdown for chart
        const monthlyData = [];
        const months = period === 'week' ? [] : 
            period === 'month' ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        months.forEach(monthOffset => {
            const monthDate = new Date();
            monthDate.setMonth(now.getMonth() - monthOffset);
            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            
            const monthBookings = tokenBookings.filter(b => {
                if (!doctorIds.includes(b.doctorId)) return false;
                const bookingDate = new Date(b.createdAt || b.date);
                return bookingDate >= monthStart && bookingDate <= monthEnd;
            });

            monthlyData.unshift({
                month: monthDate.toLocaleDateString('en-IN', { month: 'short' }),
                earnings: monthBookings.reduce((sum, b) => sum + (b.fee || 0), 0),
                bookings: monthBookings.length
            });
        });

        return {
            totalEarnings,
            completedBookings,
            pendingBookings,
            doctorEarnings,
            monthlyData,
            avgPerBooking: filtered.length > 0 ? Math.round(totalEarnings / filtered.length) : 0
        };
    }, [tokenBookings, doctorIds, clinicDoctors, period]);

    const maxEarnings = Math.max(...earningsData.monthlyData.map(m => m.earnings), 1);

    return (
        <div className="earnings-dashboard">
            <div className="earnings-header">
                <h2>💰 Earnings & Revenue</h2>
                <div className="period-tabs">
                    <button 
                        className={period === 'week' ? 'active' : ''}
                        onClick={() => setPeriod('week')}
                    >
                        Week
                    </button>
                    <button 
                        className={period === 'month' ? 'active' : ''}
                        onClick={() => setPeriod('month')}
                    >
                        Month
                    </button>
                    <button 
                        className={period === 'year' ? 'active' : ''}
                        onClick={() => setPeriod('year')}
                    >
                        Year
                    </button>
                </div>
            </div>

            {/* Main Stats */}
            <div className="earnings-stats">
                <div className="earning-card main">
                    <div className="earning-icon">💵</div>
                    <div className="earning-content">
                        <span className="earning-amount">
                            ₹{earningsData.totalEarnings.toLocaleString()}
                        </span>
                        <span className="earning-label">Total Earnings</span>
                    </div>
                </div>
                <div className="earning-card">
                    <div className="earning-icon">✅</div>
                    <div className="earning-content">
                        <span className="earning-amount">{earningsData.completedBookings}</span>
                        <span className="earning-label">Completed</span>
                    </div>
                </div>
                <div className="earning-card">
                    <div className="earning-icon">⏳</div>
                    <div className="earning-content">
                        <span className="earning-amount">{earningsData.pendingBookings}</span>
                        <span className="earning-label">Pending</span>
                    </div>
                </div>
                <div className="earning-card">
                    <div className="earning-icon">📊</div>
                    <div className="earning-content">
                        <span className="earning-amount">₹{earningsData.avgPerBooking}</span>
                        <span className="earning-label">Avg. per Booking</span>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            {period !== 'week' && earningsData.monthlyData.length > 0 && (
                <div className="revenue-chart">
                    <h3>📈 Revenue Trend</h3>
                    <div className="chart-bars">
                        {earningsData.monthlyData.map((month, idx) => (
                            <div key={idx} className="chart-item">
                                <div 
                                    className="bar"
                                    style={{ height: `${(month.earnings / maxEarnings) * 100}%` }}
                                >
                                    <span className="bar-tooltip">₹{month.earnings.toLocaleString()}</span>
                                </div>
                                <span className="bar-label">{month.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Doctor Breakdown */}
            <div className="doctor-earnings-section">
                <div className="section-header">
                    <h3>👨‍⚕️ Doctor-wise Earnings</h3>
                    <button 
                        className="toggle-breakdown"
                        onClick={() => setShowBreakdown(!showBreakdown)}
                    >
                        {showBreakdown ? 'Hide' : 'Show'} Details
                    </button>
                </div>
                
                <div className="doctor-earnings-list">
                    {earningsData.doctorEarnings.map(doc => (
                        <div key={doc.id} className="doctor-earning-card">
                            <div className="doc-info">
                                <span className="doc-icon">{doc.icon}</span>
                                <span className="doc-name">{doc.name}</span>
                            </div>
                            <div className="doc-stats">
                                <span className="doc-bookings">{doc.bookings} bookings</span>
                                <span className="doc-earning">₹{doc.earnings.toLocaleString()}</span>
                            </div>
                            <div 
                                className="earning-bar"
                                style={{ width: `${(doc.earnings / earningsData.totalEarnings) * 100}%` }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-earnings-stats">
                <div className="quick-stat">
                    <span className="qs-label">Clinic Commission (10%)</span>
                    <span className="qs-value">₹{Math.round(earningsData.totalEarnings * 0.1).toLocaleString()}</span>
                </div>
                <div className="quick-stat">
                    <span className="qs-label">Doctor Share (90%)</span>
                    <span className="qs-value">₹{Math.round(earningsData.totalEarnings * 0.9).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default Earnings;
