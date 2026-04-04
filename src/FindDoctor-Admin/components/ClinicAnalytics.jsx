import React, { useState, useMemo } from 'react';

const ClinicAnalytics = ({ clinic, doctors, bookings, tokenBookings }) => {
    const [dateRange, setDateRange] = useState('7'); // days

    const clinicDoctors = doctors.filter(d => d.clinicName === clinic.name);
    const doctorIds = clinicDoctors.map(d => d._id || d.id);

    const filteredBookings = useMemo(() => {
        const days = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        return tokenBookings.filter(b => {
            const bookingDate = new Date(b.createdAt || Date.now());
            return bookingDate >= startDate && doctorIds.includes(b.doctorId);
        });
    }, [tokenBookings, doctorIds, dateRange]);

    const stats = useMemo(() => {
        const totalBookings = filteredBookings.length;
        const completedBookings = filteredBookings.filter(b => b.status === 'completed').length;
        const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled').length;
        
        const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.fee || 0), 0);
        const avgPerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

        const today = new Date().toDateString();
        const todayBookings = filteredBookings.filter(b => 
            new Date(b.createdAt || b.date).toDateString() === today
        ).length;

        // Doctor performance
        const doctorStats = clinicDoctors.map(doc => {
            const docId = doc._id || doc.id;
            const docBookings = filteredBookings.filter(b => b.doctorId === docId);
            return {
                id: docId,
                name: doc.name,
                icon: doc.icon,
                totalBookings: docBookings.length,
                completed: docBookings.filter(b => b.status === 'completed').length,
                revenue: docBookings.reduce((sum, b) => sum + (b.fee || 0), 0)
            };
        }).sort((a, b) => b.totalBookings - a.totalBookings);

        // Daily breakdown for chart
        const dailyData = [];
        for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayBookings = filteredBookings.filter(b => 
                new Date(b.createdAt || b.date).toDateString() === dateStr
            );
            
            dailyData.push({
                date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                bookings: dayBookings.length,
                revenue: dayBookings.reduce((sum, b) => sum + (b.fee || 0), 0)
            });
        }

        return {
            totalBookings,
            completedBookings,
            cancelledBookings,
            totalRevenue,
            avgPerBooking,
            todayBookings,
            doctorStats,
            dailyData,
            completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0
        };
    }, [filteredBookings, clinicDoctors, dateRange]);

    const maxDailyBookings = Math.max(...stats.dailyData.map(d => d.bookings), 1);

    return (
        <div className="analytics-dashboard">
            <div className="analytics-header">
                <h2>📊 Analytics Dashboard</h2>
                <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    className="date-range-select"
                >
                    <option value="7">Last 7 Days</option>
                    <option value="14">Last 14 Days</option>
                    <option value="30">Last 30 Days</option>
                </select>
            </div>

            {/* Key Metrics */}
            <div className="analytics-stats-grid">
                <div className="analytics-stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalBookings}</span>
                        <span className="stat-label">Total Bookings</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.completedBookings}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.cancelledBookings}</span>
                        <span className="stat-label">Cancelled</span>
                    </div>
                </div>
                <div className="analytics-stat-card highlight">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <span className="stat-value">₹{stats.totalRevenue.toLocaleString()}</span>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <span className="stat-value">₹{stats.avgPerBooking}</span>
                        <span className="stat-label">Avg. per Booking</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.todayBookings}</span>
                        <span className="stat-label">Today's Bookings</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="analytics-chart-card">
                <h3>📉 Booking Trends</h3>
                <div className="chart-container">
                    {stats.dailyData.map((day, idx) => (
                        <div key={idx} className="chart-bar-wrapper">
                            <div 
                                className="chart-bar" 
                                style={{ height: `${(day.bookings / maxDailyBookings) * 100}%` }}
                                title={`₹${day.revenue}`}
                            >
                                <span className="bar-value">{day.bookings}</span>
                            </div>
                            <span className="bar-label">{day.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Doctor Performance */}
            <div className="doctor-performance-card">
                <h3>👨‍⚕️ Doctor Performance</h3>
                <div className="performance-table">
                    <div className="table-header">
                        <span>Doctor</span>
                        <span>Bookings</span>
                        <span>Completed</span>
                        <span>Revenue</span>
                    </div>
                    {stats.doctorStats.map(doc => (
                        <div key={doc.id} className="table-row">
                            <div className="doc-cell">
                                <span className="doc-icon">{doc.icon}</span>
                                <span>{doc.name}</span>
                            </div>
                            <span>{doc.totalBookings}</span>
                            <span className="completed">{doc.completed}</span>
                            <span className="revenue">₹{doc.revenue.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completion Rate */}
            <div className="completion-rate-card">
                <h3>✅ Completion Rate</h3>
                <div className="rate-circle">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                        <path
                            className="circle-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="circle"
                            strokeDasharray={`${stats.completionRate}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <span className="rate-value">{stats.completionRate}%</span>
                </div>
            </div>
        </div>
    );
};

export default ClinicAnalytics;
