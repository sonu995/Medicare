import React, { useState, useEffect } from 'react';

const DoctorScheduleManager = ({ doctors, onUpdateDoctor, selectedDoctorId, onSelectDoctor }) => {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [schedule, setSchedule] = useState({
        morning: { active: true, start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10 },
        evening: { active: true, start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10 }
    });
    const [vacation, setVacation] = useState({
        isOnVacation: false,
        vacationStart: '',
        vacationEnd: '',
        vacationReason: ''
    });
    const [leave, setLeave] = useState([]);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [newLeave, setNewLeave] = useState({ date: '', type: 'full', reason: '' });
    const [customDates, setCustomDates] = useState([]);
    const [showCustomDateModal, setShowCustomDateModal] = useState(false);
    const [newCustomDate, setNewCustomDate] = useState({
        date: '',
        session: 'morning',
        start: '09:00',
        end: '13:00',
        totalTokens: 20,
        tokenDuration: 10,
        active: true
    });
    const [weeklySchedule, setWeeklySchedule] = useState({
        monday: { morning: { active: true, start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10 }, evening: { active: true, start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10 } },
        tuesday: { morning: { active: true, start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10 }, evening: { active: true, start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10 } },
        wednesday: { morning: { active: true, start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10 }, evening: { active: true, start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10 } },
        thursday: { morning: { active: true, start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10 }, evening: { active: true, start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10 } },
        friday: { morning: { active: true, start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10 }, evening: { active: true, start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10 } },
        saturday: { morning: { active: true, start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10 }, evening: { active: false, start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10 } },
        sunday: { morning: { active: false, start: '09:00', end: '13:00', totalTokens: 0, tokenDuration: 10 }, evening: { active: false, start: '17:00', end: '21:00', totalTokens: 0, tokenDuration: 10 } }
    });
    const [dateTokenLimits, setDateTokenLimits] = useState([]);
    const [showTokenLimitModal, setShowTokenLimitModal] = useState(false);
    const [newTokenLimit, setNewTokenLimit] = useState({ date: '', morningLimit: 20, eveningLimit: 15, reason: '' });

    useEffect(() => {
        if (selectedDoctorId) {
            const doc = doctors.find(d => (d._id || d.id) === selectedDoctorId);
            if (doc) {
                setSelectedDoc(doc);
                setSchedule(doc.schedule || {
                    morning: { active: true, start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10 },
                    evening: { active: true, start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10 }
                });
                setVacation(doc.vacation || {
                    isOnVacation: false,
                    vacationStart: '',
                    vacationEnd: '',
                    vacationReason: ''
                });
                setLeave(doc.leave || []);
                setCustomDates(doc.customDates || []);
                setWeeklySchedule(doc.weeklySchedule || weeklySchedule);
                setDateTokenLimits(doc.dateTokenLimits || []);
            }
        }
    }, [selectedDoctorId, doctors]);

    const handleScheduleChange = (session, field, value) => {
        setSchedule(prev => ({
            ...prev,
            [session]: { ...prev[session], [field]: field === 'active' ? value : value }
        }));
    };

    const handleSaveSchedule = async () => {
        if (selectedDoc) {
            await onUpdateDoctor({ ...selectedDoc, schedule });
        }
    };

    const handleVacationToggle = (e) => {
        const isOnVacation = e.target.checked;
        setVacation(prev => ({ ...prev, isOnVacation }));
    };

    const handleSaveVacation = async () => {
        if (selectedDoc) {
            await onUpdateDoctor({ ...selectedDoc, vacation });
        }
    };

    const handleAddLeave = async () => {
        if (newLeave.date) {
            const updatedLeave = [...leave, { ...newLeave, id: Date.now() }];
            setLeave(updatedLeave);
            if (selectedDoc) {
                await onUpdateDoctor({ ...selectedDoc, leave: updatedLeave });
            }
            setShowLeaveModal(false);
            setNewLeave({ date: '', type: 'full', reason: '' });
        }
    };

    const handleRemoveLeave = async (leaveId) => {
        const updatedLeave = leave.filter(l => l.id !== leaveId);
        setLeave(updatedLeave);
        if (selectedDoc) {
            await onUpdateDoctor({ ...selectedDoc, leave: updatedLeave });
        }
    };

    const isLeaveDay = (date) => {
        const today = new Date().toISOString().split('T')[0];
        return leave.some(l => l.date === date);
    };

    const isVacationDay = (date) => {
        if (!vacation.isOnVacation || !vacation.vacationStart || !vacation.vacationEnd) return false;
        return date >= vacation.vacationStart && date <= vacation.vacationEnd;
    };

    const handleAddCustomDate = async () => {
        if (newCustomDate.date) {
            const updatedCustomDates = [...customDates, { ...newCustomDate, id: Date.now() }];
            setCustomDates(updatedCustomDates);
            if (selectedDoc) {
                await onUpdateDoctor({ ...selectedDoc, customDates: updatedCustomDates });
            }
            setShowCustomDateModal(false);
            setNewCustomDate({ date: '', session: 'morning', start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10, active: true });
        }
    };

    const handleRemoveCustomDate = async (customDateId) => {
        const updatedCustomDates = customDates.filter(cd => cd.id !== customDateId);
        setCustomDates(updatedCustomDates);
        if (selectedDoc) {
            await onUpdateDoctor({ ...selectedDoc, customDates: updatedCustomDates });
        }
    };

    const handleWeeklyScheduleChange = async (day, session, field, value) => {
        const updatedWeekly = {
            ...weeklySchedule,
            [day]: {
                ...weeklySchedule[day],
                [session]: { ...weeklySchedule[day][session], [field]: value }
            }
        };
        setWeeklySchedule(updatedWeekly);
    };

    const handleSaveWeeklySchedule = async () => {
        if (selectedDoc) {
            await onUpdateDoctor({ ...selectedDoc, weeklySchedule });
        }
    };

    const handleAddTokenLimit = async () => {
        if (newTokenLimit.date) {
            const updatedTokenLimits = [...dateTokenLimits, { ...newTokenLimit, id: Date.now() }];
            setDateTokenLimits(updatedTokenLimits);
            if (selectedDoc) {
                await onUpdateDoctor({ ...selectedDoc, dateTokenLimits: updatedTokenLimits });
            }
            setShowTokenLimitModal(false);
            setNewTokenLimit({ date: '', morningLimit: 20, eveningLimit: 15, reason: '' });
        }
    };

    const handleRemoveTokenLimit = async (limitId) => {
        const updatedTokenLimits = dateTokenLimits.filter(tl => tl.id !== limitId);
        setDateTokenLimits(updatedTokenLimits);
        if (selectedDoc) {
            await onUpdateDoctor({ ...selectedDoc, dateTokenLimits: updatedTokenLimits });
        }
    };

    const getCustomDateSchedule = (date) => {
        return customDates.find(cd => cd.date === date);
    };

    const getTokenLimit = (date) => {
        return dateTokenLimits.find(tl => tl.date === date);
    };

    if (!selectedDoc) {
        return (
            <div className="schedule-manager-empty">
                <div className="empty-icon">📅</div>
                <h3>Select a Doctor</h3>
                <p>Choose a doctor from the list to manage their schedule and leave</p>
                <div className="doctor-select-list">
                    {doctors.map(doc => (
                        <button
                            key={doc._id || doc.id}
                            className="doctor-select-item"
                            onClick={() => onSelectDoctor(doc._id || doc.id)}
                        >
                            <span className="doc-icon">{doc.icon || '👨‍⚕️'}</span>
                            <div className="doc-info">
                                <strong>{doc.name}</strong>
                                <span>{doc.specialty}</span>
                            </div>
                            {doc.vacation?.isOnVacation && <span className="vacation-badge">🏖️ On Leave</span>}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="schedule-manager">
            <div className="schedule-header">
                <button className="back-btn" onClick={() => onSelectDoctor(null)}>← Back</button>
                <div className="selected-doc-info">
                    <span className="doc-icon-large">{selectedDoc.icon || '👨‍⚕️'}</span>
                    <div>
                        <h3>{selectedDoc.name}</h3>
                        <span className="doc-specialty">{selectedDoc.specialty}</span>
                    </div>
                </div>
                {vacation.isOnVacation && <span className="vacation-indicator">🏖️ On Vacation</span>}
            </div>

            <div className="schedule-sections">
                {/* Morning Schedule */}
                <div className="schedule-section-card">
                    <div className="section-header">
                        <h4>🌅 Morning Session</h4>
                        <label className="schedule-toggle-switch">
                            <input
                                type="checkbox"
                                checked={schedule.morning.active}
                                onChange={(e) => handleScheduleChange('morning', 'active', e.target.checked)}
                            />
                            <span className="schedule-toggle-slider"></span>
                            <span className="schedule-toggle-label">{schedule.morning.active ? 'Active' : 'Inactive'}</span>
                        </label>
                    </div>
                    {schedule.morning.active && (
                        <div className="schedule-fields">
                            <div className="schedule-field-group">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    value={schedule.morning.start}
                                    onChange={(e) => handleScheduleChange('morning', 'start', e.target.value)}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    value={schedule.morning.end}
                                    onChange={(e) => handleScheduleChange('morning', 'end', e.target.value)}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Total Tokens</label>
                                <input
                                    type="number"
                                    value={schedule.morning.totalTokens}
                                    onChange={(e) => handleScheduleChange('morning', 'totalTokens', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Token Duration (min)</label>
                                <input
                                    type="number"
                                    value={schedule.morning.tokenDuration}
                                    onChange={(e) => handleScheduleChange('morning', 'tokenDuration', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Evening Schedule */}
                <div className="schedule-section-card">
                    <div className="section-header">
                        <h4>🌙 Evening Session</h4>
                        <label className="schedule-toggle-switch">
                            <input
                                type="checkbox"
                                checked={schedule.evening.active}
                                onChange={(e) => handleScheduleChange('evening', 'active', e.target.checked)}
                            />
                            <span className="schedule-toggle-slider"></span>
                            <span className="schedule-toggle-label">{schedule.evening.active ? 'Active' : 'Inactive'}</span>
                        </label>
                    </div>
                    {schedule.evening.active && (
                        <div className="schedule-fields">
                            <div className="schedule-field-group">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    value={schedule.evening.start}
                                    onChange={(e) => handleScheduleChange('evening', 'start', e.target.value)}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    value={schedule.evening.end}
                                    onChange={(e) => handleScheduleChange('evening', 'end', e.target.value)}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Total Tokens</label>
                                <input
                                    type="number"
                                    value={schedule.evening.totalTokens}
                                    onChange={(e) => handleScheduleChange('evening', 'totalTokens', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Token Duration (min)</label>
                                <input
                                    type="number"
                                    value={schedule.evening.tokenDuration}
                                    onChange={(e) => handleScheduleChange('evening', 'tokenDuration', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button className="save-schedule-btn" onClick={handleSaveSchedule}>
                    💾 Save Schedule
                </button>

                {/* Vacation Management */}
                <div className="schedule-section-card vacation-section">
                    <div className="section-header">
                        <h4>🏖️ Vacation / Leave</h4>
                        <label className="schedule-toggle-switch">
                            <input
                                type="checkbox"
                                checked={vacation.isOnVacation}
                                onChange={handleVacationToggle}
                            />
                            <span className="schedule-toggle-slider"></span>
                            <span className="schedule-toggle-label">{vacation.isOnVacation ? 'On Leave' : 'Available'}</span>
                        </label>
                    </div>
                    {vacation.isOnVacation && (
                        <div className="vacation-fields">
                            <div className="schedule-field-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={vacation.vacationStart}
                                    onChange={(e) => setVacation(prev => ({ ...prev, vacationStart: e.target.value }))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={vacation.vacationEnd}
                                    onChange={(e) => setVacation(prev => ({ ...prev, vacationEnd: e.target.value }))}
                                />
                            </div>
                            <div className="schedule-field-group full-width">
                                <label>Reason</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Annual leave, Personal work..."
                                    value={vacation.vacationReason}
                                    onChange={(e) => setVacation(prev => ({ ...prev, vacationReason: e.target.value }))}
                                />
                            </div>
                            <button className="save-vacation-btn" onClick={handleSaveVacation}>
                                💾 Save Vacation
                            </button>
                        </div>
                    )}
                </div>

                {/* Single Day Leave */}
                <div className="schedule-section-card leave-section">
                    <div className="section-header">
                        <h4>📴 Single Day Leave</h4>
                        <button className="add-leave-btn" onClick={() => setShowLeaveModal(true)}>
                            + Add Leave Day
                        </button>
                    </div>
                    {leave.length > 0 ? (
                        <div className="leave-list">
                            {leave.map(leaveDay => (
                                <div key={leaveDay.id} className="leave-item">
                                    <div className="leave-date">
                                        <span className="date-icon">📅</span>
                                        <span>{leaveDay.date}</span>
                                        <span className="leave-type">{leaveDay.type === 'full' ? 'Full Day' : 'Half Day'}</span>
                                    </div>
                                    <span className="leave-reason">{leaveDay.reason}</span>
                                    <button className="remove-leave-btn" onClick={() => handleRemoveLeave(leaveDay.id)}>
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-leave">No leave days scheduled</p>
                    )}
                </div>

                {/* Custom Date Schedules */}
                <div className="schedule-section-card custom-date-section">
                    <div className="section-header">
                        <h4>📆 Custom Date Schedule</h4>
                        <button className="add-leave-btn" onClick={() => setShowCustomDateModal(true)}>
                            + Add Custom Schedule
                        </button>
                    </div>
                    {customDates.length > 0 ? (
                        <div className="leave-list">
                            {customDates.map(cd => (
                                <div key={cd.id} className="leave-item">
                                    <div className="leave-date">
                                        <span className="date-icon">📅</span>
                                        <span>{cd.date}</span>
                                        <span className="leave-type">{cd.session === 'morning' ? 'Morning' : 'Evening'}</span>
                                        <span className="leave-type">{cd.start} - {cd.end}</span>
                                    </div>
                                    <span className="leave-reason">{cd.totalTokens} tokens</span>
                                    <button className="remove-leave-btn" onClick={() => handleRemoveCustomDate(cd.id)}>
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-leave">No custom date schedules</p>
                    )}
                </div>

                {/* Weekly Schedule */}
                <div className="schedule-section-card weekly-section">
                    <div className="section-header">
                        <h4>📅 Weekly Schedule</h4>
                        <button className="save-schedule-btn" onClick={handleSaveWeeklySchedule} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                            Save Weekly
                        </button>
                    </div>
                    <div className="weekly-schedule-grid">
                        {Object.keys(weeklySchedule).map(day => (
                            <div key={day} className="weekly-day-card">
                                <h5>{day.charAt(0).toUpperCase() + day.slice(1)}</h5>
                                <div className="weekly-session">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={weeklySchedule[day].morning.active}
                                            onChange={(e) => handleWeeklyScheduleChange(day, 'morning', 'active', e.target.checked)}
                                        />
                                        Morning
                                    </label>
                                    {weeklySchedule[day].morning.active && (
                                        <div className="weekly-time-inputs">
                                            <input type="time" value={weeklySchedule[day].morning.start} onChange={(e) => handleWeeklyScheduleChange(day, 'morning', 'start', e.target.value)} />
                                            <span>to</span>
                                            <input type="time" value={weeklySchedule[day].morning.end} onChange={(e) => handleWeeklyScheduleChange(day, 'morning', 'end', e.target.value)} />
                                        </div>
                                    )}
                                </div>
                                <div className="weekly-session">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={weeklySchedule[day].evening.active}
                                            onChange={(e) => handleWeeklyScheduleChange(day, 'evening', 'active', e.target.checked)}
                                        />
                                        Evening
                                    </label>
                                    {weeklySchedule[day].evening.active && (
                                        <div className="weekly-time-inputs">
                                            <input type="time" value={weeklySchedule[day].evening.start} onChange={(e) => handleWeeklyScheduleChange(day, 'evening', 'start', e.target.value)} />
                                            <span>to</span>
                                            <input type="time" value={weeklySchedule[day].evening.end} onChange={(e) => handleWeeklyScheduleChange(day, 'evening', 'end', e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date-specific Token Limits */}
                <div className="schedule-section-card token-limit-section">
                    <div className="section-header">
                        <h4>🎫 Date-specific Token Limits</h4>
                        <button className="add-leave-btn" onClick={() => setShowTokenLimitModal(true)}>
                            + Add Token Limit
                        </button>
                    </div>
                    {dateTokenLimits.length > 0 ? (
                        <div className="leave-list">
                            {dateTokenLimits.map(tl => (
                                <div key={tl.id} className="leave-item">
                                    <div className="leave-date">
                                        <span className="date-icon">📅</span>
                                        <span>{tl.date}</span>
                                    </div>
                                    <span className="leave-reason">Morning: {tl.morningLimit} | Evening: {tl.eveningLimit}</span>
                                    <button className="remove-leave-btn" onClick={() => handleRemoveTokenLimit(tl.id)}>
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-leave">No custom token limits set</p>
                    )}
                </div>
            </div>

            {/* Leave Modal */}
            {showLeaveModal && (
                <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
                    <div className="leave-modal" onClick={e => e.stopPropagation()}>
                        <h3>Add Leave Day</h3>
                        <div className="modal-fields">
                            <div className="schedule-field-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={newLeave.date}
                                    onChange={(e) => setNewLeave(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Type</label>
                                <select
                                    value={newLeave.type}
                                    onChange={(e) => setNewLeave(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="full">Full Day</option>
                                    <option value="morning">Morning Only</option>
                                    <option value="evening">Evening Only</option>
                                </select>
                            </div>
                            <div className="schedule-field-group">
                                <label>Reason</label>
                                <input
                                    type="text"
                                    placeholder="Reason for leave"
                                    value={newLeave.reason}
                                    onChange={(e) => setNewLeave(prev => ({ ...prev, reason: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                            <button className="add-btn" onClick={handleAddLeave}>Add Leave</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Date Schedule Modal */}
            {showCustomDateModal && (
                <div className="modal-overlay" onClick={() => setShowCustomDateModal(false)}>
                    <div className="leave-modal" onClick={e => e.stopPropagation()}>
                        <h3>Add Custom Date Schedule</h3>
                        <div className="modal-fields">
                            <div className="schedule-field-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={newCustomDate.date}
                                    onChange={(e) => setNewCustomDate(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Session</label>
                                <select
                                    value={newCustomDate.session}
                                    onChange={(e) => setNewCustomDate(prev => ({ ...prev, session: e.target.value }))}
                                >
                                    <option value="morning">Morning</option>
                                    <option value="evening">Evening</option>
                                </select>
                            </div>
                            <div className="schedule-field-group">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    value={newCustomDate.start}
                                    onChange={(e) => setNewCustomDate(prev => ({ ...prev, start: e.target.value }))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    value={newCustomDate.end}
                                    onChange={(e) => setNewCustomDate(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Total Tokens</label>
                                <input
                                    type="number"
                                    value={newCustomDate.totalTokens}
                                    onChange={(e) => setNewCustomDate(prev => ({ ...prev, totalTokens: parseInt(e.target.value) }))}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowCustomDateModal(false)}>Cancel</button>
                            <button className="add-btn" onClick={handleAddCustomDate}>Add Schedule</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Token Limit Modal */}
            {showTokenLimitModal && (
                <div className="modal-overlay" onClick={() => setShowTokenLimitModal(false)}>
                    <div className="leave-modal" onClick={e => e.stopPropagation()}>
                        <h3>Set Date Token Limit</h3>
                        <div className="modal-fields">
                            <div className="schedule-field-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={newTokenLimit.date}
                                    onChange={(e) => setNewTokenLimit(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Morning Token Limit</label>
                                <input
                                    type="number"
                                    value={newTokenLimit.morningLimit}
                                    onChange={(e) => setNewTokenLimit(prev => ({ ...prev, morningLimit: parseInt(e.target.value) }))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Evening Token Limit</label>
                                <input
                                    type="number"
                                    value={newTokenLimit.eveningLimit}
                                    onChange={(e) => setNewTokenLimit(prev => ({ ...prev, eveningLimit: parseInt(e.target.value) }))}
                                />
                            </div>
                            <div className="schedule-field-group">
                                <label>Reason</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Festival, Special day..."
                                    value={newTokenLimit.reason}
                                    onChange={(e) => setNewTokenLimit(prev => ({ ...prev, reason: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowTokenLimitModal(false)}>Cancel</button>
                            <button className="add-btn" onClick={handleAddTokenLimit}>Add Token Limit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorScheduleManager;
