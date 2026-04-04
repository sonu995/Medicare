import React from 'react';

const DashboardStats = ({ stats }) => {
    return (
        <div className="premium-stats-grid">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="premium-stat-card"
                    style={{ '--brand-color': stat.color }}
                >
                    <div className="stat-glass-effect" />
                    <div className="stat-content">
                        <div className="stat-icon-wrapper" style={{ boxShadow: `0 6px 20px ${stat.color}30` }}>
                            <span className="stat-icon">{stat.icon}</span>
                        </div>
                        <div className="stat-details">
                            <span className="stat-label">{stat.label}</span>
                            <p className="stat-value">{stat.value ?? '—'}</p>
                        </div>
                    </div>
                    <div className="stat-progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: '72%', background: stat.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
