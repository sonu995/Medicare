import React, { useState, useEffect, useMemo } from 'react';
import { fetchWalkinStats } from '../../api/bookingsApi';

const WalkInAnalytics = ({ clinics }) => {
    const [dateRange, setDateRange] = useState('30');
    const [selectedClinic, setSelectedClinic] = useState('all');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalWalkIns: 0,
        completed: 0,
        cancelled: 0,
        serving: 0,
        pending: 0,
        totalRevenue: 0,
        todayWalkIns: 0,
        morning: 0,
        evening: 0,
        completionRate: 0,
        cancellationRate: 0,
        dailyData: [],
        doctorStats: []
    });

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                const params = { days: dateRange };
                if (selectedClinic !== 'all') params.clinicId = selectedClinic;
                
                const response = await fetchWalkinStats(params);
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Error fetching walk-in stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [dateRange, selectedClinic]);

    const avgWaitTime = useMemo(() => {
        if (stats.totalWalkIns === 0) return 0;
        return Math.round((stats.completed * 15) / stats.completed) || 15;
    }, [stats]);

    const maxDailyWalkIns = useMemo(() => {
        if (!stats.dailyData || stats.dailyData.length === 0) return 1;
        return Math.max(...stats.dailyData.map(d => d.walkIns), 1);
    }, [stats.dailyData]);

    const peakHours = useMemo(() => {
        if (!stats.dailyData || stats.dailyData.length === 0) return [];
        const hourCounts = {};
        stats.dailyData.forEach(day => {
            const baseHour = 9;
            const morningWalkIns = day.morning || 0;
            const eveningWalkIns = day.evening || 0;
            if (morningWalkIns > 0) {
                hourCounts['10:00'] = (hourCounts['10:00'] || 0) + Math.floor(morningWalkIns / 4);
            }
            if (eveningWalkIns > 0) {
                hourCounts['18:00'] = (hourCounts['18:00'] || 0) + Math.floor(eveningWalkIns / 4);
            }
        });
        return Object.entries(hourCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [stats.dailyData]);

    if (loading) {
        return (
            <div className="walkin-analytics">
                <div className="analytics-header">
                    <div className="header-left">
                        <h2>🚶 Walk-in Analysis</h2>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="walkin-analytics">
            <div className="analytics-header">
                <div className="header-left">
                    <h2>🚶 Walk-in Analysis</h2>
                    <p>Track walk-in patient statistics and trends</p>
                </div>
                <div className="header-controls">
                    <select 
                        value={selectedClinic} 
                        onChange={(e) => setSelectedClinic(e.target.value)}
                        className="clinic-select"
                    >
                        <option value="all">All Clinics</option>
                        {(clinics || []).map(c => (
                            <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.target.value)}
                        className="date-range-select"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="14">Last 14 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                    </select>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card walkin-primary">
                    <div className="stat-icon">🚶</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalWalkIns}</span>
                        <span className="stat-label">Total Walk-ins</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.todayWalkIns}</span>
                        <span className="stat-label">Today's Walk-ins</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.completed}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <span className="stat-value">₹{stats.totalRevenue.toLocaleString()}</span>
                        <span className="stat-label">Revenue</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-info">
                        <span className="stat-value">{avgWaitTime}m</span>
                        <span className="stat-label">Avg Wait Time</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.completionRate}%</span>
                        <span className="stat-label">Completion Rate</span>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="dashboard-card chart-card">
                    <h3>📈 Walk-in Trends</h3>
                    <div className="chart-container">
                        {(stats.dailyData || []).slice(-parseInt(dateRange)).map((day, idx) => (
                            <div key={idx} className="chart-bar-wrapper">
                                <div className="chart-tooltip">
                                    <span>{day.walkIns} walk-ins</span>
                                    <span>₹{day.revenue}</span>
                                </div>
                                <div 
                                    className="chart-bar walkin-bar" 
                                    style={{ height: `${(day.walkIns / maxDailyWalkIns) * 100}%` }}
                                >
                                    <span className="bar-value">{day.walkIns}</span>
                                </div>
                                <span className="bar-label">
                                    {new Date(day._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        ))}
                        {(!stats.dailyData || stats.dailyData.length === 0) && (
                            <p className="no-data-msg">No walk-in data available</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-card session-breakdown">
                    <h3>🌅 Session Breakdown</h3>
                    <div className="session-stats">
                        <div className="session-item morning">
                            <span className="session-icon">🌅</span>
                            <span className="session-label">Morning</span>
                            <span className="session-value">{stats.morning}</span>
                            <span className="session-percent">
                                {stats.totalWalkIns > 0 ? Math.round((stats.morning / stats.totalWalkIns) * 100) : 0}%
                            </span>
                        </div>
                        <div className="session-item evening">
                            <span className="session-icon">🌙</span>
                            <span className="session-label">Evening</span>
                            <span className="session-value">{stats.evening}</span>
                            <span className="session-percent">
                                {stats.totalWalkIns > 0 ? Math.round((stats.evening / stats.totalWalkIns) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                    <div className="status-breakdown">
                        <h4>Status Distribution</h4>
                        <div className="status-bar">
                            <div className="status-segment completed" style={{ width: `${stats.completionRate}%` }}></div>
                            <div className="status-segment serving" style={{ width: `${(stats.serving / stats.totalWalkIns) * 100 || 0}%` }}></div>
                            <div className="status-segment pending" style={{ width: `${(stats.pending / stats.totalWalkIns) * 100 || 0}%` }}></div>
                            <div className="status-segment cancelled" style={{ width: `${stats.cancellationRate}%` }}></div>
                        </div>
                        <div className="status-legend">
                            <span><span className="dot completed"></span>Completed ({stats.completed})</span>
                            <span><span className="dot serving"></span>Serving ({stats.serving})</span>
                            <span><span className="dot pending"></span>Pending ({stats.pending})</span>
                            <span><span className="dot cancelled"></span>Cancelled ({stats.cancelled})</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="dashboard-card doctor-breakdown">
                    <h3>👨‍⚕️ Doctor Performance (Walk-ins)</h3>
                    <div className="doctor-list">
                        {(stats.doctorStats || []).length > 0 ? stats.doctorStats.map(doc => (
                            <div key={doc.id} className="doctor-stat-item">
                                <div className="doctor-info">
                                    <span className="doctor-icon">{doc.icon}</span>
                                    <span className="doctor-name">{doc.name}</span>
                                </div>
                                <div className="doctor-metrics">
                                    <span className="metric total">{doc.total}</span>
                                    <span className="metric completed">✓{doc.completed}</span>
                                    <span className="metric cancelled">✕{doc.cancelled}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="no-data-msg">No walk-in data available</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-card peak-hours">
                    <h3>⏰ Peak Hours</h3>
                    <div className="peak-hours-list">
                        {peakHours.map(([hour, count], idx) => (
                            <div key={hour} className="peak-hour-item">
                                <span className="peak-rank">#{idx + 1}</span>
                                <span className="peak-hour">{hour}</span>
                                <span className="peak-count">{count} walk-ins</span>
                                <div className="peak-bar" style={{ width: `${(count / peakHours[0][1]) * 100}%` }}></div>
                            </div>
                        ))}
                        {peakHours.length === 0 && (
                            <p className="no-data-msg">No data available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalkInAnalytics;
