import React, { useState, useEffect } from 'react';

const SpecialHours = ({ clinic, onUpdateClinic }) => {
    const [specialHours, setSpecialHours] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newSpecialDay, setNewSpecialDay] = useState({
        date: '',
        type: 'holiday', // holiday, special
        name: '',
        openingTime: '09:00',
        closingTime: '17:00',
        isClosed: false
    });

    useEffect(() => {
        if (clinic.specialHours) {
            setSpecialHours(clinic.specialHours);
        }
    }, [clinic]);

    const handleAddSpecialDay = async () => {
        if (!newSpecialDay.date || !newSpecialDay.name) return;
        
        const updated = [...specialHours, { ...newSpecialDay, id: Date.now() }];
        setSpecialHours(updated);
        
        if (onUpdateClinic) {
            await onUpdateClinic({ ...clinic, specialHours: updated });
        }
        
        setShowModal(false);
        setNewSpecialDay({
            date: '',
            type: 'holiday',
            name: '',
            openingTime: '09:00',
            closingTime: '17:00',
            isClosed: false
        });
    };

    const handleRemoveSpecialDay = async (id) => {
        const updated = specialHours.filter(s => s.id !== id);
        setSpecialHours(updated);
        
        if (onUpdateClinic) {
            await onUpdateClinic({ ...clinic, specialHours: updated });
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const upcomingSpecialDays = specialHours
        .filter(s => s.date >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const pastSpecialDays = specialHours
        .filter(s => s.date < today)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="special-hours">
            <div className="special-hours-header">
                <h2>🎉 Special Hours & Holidays</h2>
                <button className="add-special-btn" onClick={() => setShowModal(true)}>
                    + Add Special Day
                </button>
            </div>

            <div className="special-hours-info">
                <p>Manage festival days, holidays, and special operating hours for your clinic.</p>
            </div>

            {upcomingSpecialDays.length > 0 && (
                <div className="special-hours-section">
                    <h3>📅 Upcoming</h3>
                    <div className="special-days-grid">
                        {upcomingSpecialDays.map(day => (
                            <div key={day.id} className={`special-day-card ${day.type}`}>
                                <div className="day-header">
                                    <span className={`day-badge ${day.type}`}>
                                        {day.type === 'holiday' ? '🎄 Holiday' : '⭐ Special'}
                                    </span>
                                    <button 
                                        className="remove-btn"
                                        onClick={() => handleRemoveSpecialDay(day.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <h4>{day.name}</h4>
                                <p className="day-date">
                                    {new Date(day.date).toLocaleDateString('en-IN', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                                {day.isClosed ? (
                                    <p className="day-closed">🚫 Closed</p>
                                ) : (
                                    <p className="day-time">
                                        🕐 {day.openingTime} - {day.closingTime}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pastSpecialDays.length > 0 && (
                <div className="special-hours-section past">
                    <h3>📜 Past</h3>
                    <div className="special-days-grid">
                        {pastSpecialDays.slice(0, 4).map(day => (
                            <div key={day.id} className={`special-day-card ${day.type} past`}>
                                <h4>{day.name}</h4>
                                <p className="day-date">
                                    {new Date(day.date).toLocaleDateString('en-IN', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {specialHours.length === 0 && (
                <div className="no-special-days">
                    <span>📅</span>
                    <p>No special days configured</p>
                    <p className="hint">Add festival days, holidays, or special hours</p>
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="special-modal" onClick={e => e.stopPropagation()}>
                        <h3>Add Special Day</h3>
                        
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={newSpecialDay.date}
                                    onChange={(e) => setNewSpecialDay({...newSpecialDay, date: e.target.value})}
                                    min={today}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Diwali, Christmas"
                                    value={newSpecialDay.name}
                                    onChange={(e) => setNewSpecialDay({...newSpecialDay, name: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={newSpecialDay.type}
                                    onChange={(e) => setNewSpecialDay({...newSpecialDay, type: e.target.value})}
                                >
                                    <option value="holiday">Holiday</option>
                                    <option value="special">Special Hours</option>
                                </select>
                            </div>
                            
                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={newSpecialDay.isClosed}
                                        onChange={(e) => setNewSpecialDay({...newSpecialDay, isClosed: e.target.checked})}
                                    />
                                    Clinic Closed
                                </label>
                            </div>
                            
                            {!newSpecialDay.isClosed && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Opening</label>
                                        <input
                                            type="time"
                                            value={newSpecialDay.openingTime}
                                            onChange={(e) => setNewSpecialDay({...newSpecialDay, openingTime: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Closing</label>
                                        <input
                                            type="time"
                                            value={newSpecialDay.closingTime}
                                            onChange={(e) => setNewSpecialDay({...newSpecialDay, closingTime: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="save-btn" onClick={handleAddSpecialDay}>
                                Add Day
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpecialHours;
