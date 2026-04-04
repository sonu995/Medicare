import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './DoctorDashboard.css'

function DoctorDashboard({ doctors, tokenBookings, tokenStates, onUpdateTokenState, onUpdateSchedule }) {
    const navigate = useNavigate()
    // For demo: the dashboard is for the first doctor (Dr. Sameer Shaw)
    const [activeDoctorId, setActiveDoctorId] = useState(doctors[0]?._id || doctors[0]?.id)
    const doctor = doctors.find(d => (d._id === activeDoctorId || d.id?.toString() === activeDoctorId?.toString()))

    const [activeSession, setActiveSession] = useState('morning')
    const [breakDuration, setBreakDuration] = useState(10)
    const [editingSchedule, setEditingSchedule] = useState(false)
    const [scheduleForm, setScheduleForm] = useState(null)

    if (!doctor) return <div>No doctor found</div>

    const docId = doctor._id || doctor.id?.toString()
    const state = tokenStates[docId] || { currentToken: 1, status: 'open', session: 'morning' }
    const sessionBookings = (tokenBookings || []).filter(b => {
        const bId = (b.doctorId?._id || b.doctorId)?.toString()
        return bId === docId && b.session === activeSession
    })
    const sessionData = doctor.schedule[activeSession]
    const tokensLeft = sessionData.totalTokens - sessionBookings.length

    const callNext = () => {
        if (state.currentToken < sessionBookings.length) {
            onUpdateTokenState(docId, { ...state, currentToken: state.currentToken + 1 })
        }
    }

    const togglePause = () => {
        const newStatus = state.status === 'paused' ? 'open' : 'paused'
        onUpdateTokenState(docId, { ...state, status: newStatus })
    }

    const closeOPD = () => {
        if (window.confirm('Are you sure you want to close OPD early?')) {
            onUpdateTokenState(docId, { ...state, status: 'closed' })
        }
    }

    const startEditSchedule = () => {
        setScheduleForm(JSON.parse(JSON.stringify(doctor.schedule)))
        setEditingSchedule(true)
    }

    const saveSchedule = () => {
        onUpdateSchedule(docId, scheduleForm)
        setEditingSchedule(false)
    }

    const getQueueStatusColor = (tokenNum) => {
        if (tokenNum < state.currentToken) return 'done'
        if (tokenNum === state.currentToken) return 'current'
        if (tokenNum === state.currentToken + 1) return 'next'
        return 'waiting'
    }

    const getStatusLabel = (status) => {
        if (status === 'open') return { label: '🟢 OPD Open', cls: 'st-open' }
        if (status === 'paused') return { label: '⏸ On Break', cls: 'st-paused' }
        if (status === 'closed') return { label: '🔴 OPD Closed', cls: 'st-closed' }
    }
    const statusInfo = getStatusLabel(state.status)

    return (
        <div className="doctor-dashboard">
            {/* Dashboard Header */}
            <div className="dd-header">
                <div className="dd-header-left">
                    <button className="dd-back" onClick={() => navigate('/')}>← Home</button>
                    <div className="dd-title-group">
                        <h1>Doctor Dashboard</h1>
                        <p>Manage your OPD & Token Queue</p>
                    </div>
                </div>
                {/* Doctor switcher (for demo purposes) */}
                <div className="dd-doctor-selector">
                    {doctors.map(d => {
                        const dId = d._id || d.id
                        return (
                            <button key={dId} className={`dd-doc-pill ${activeDoctorId === dId ? 'active' : ''}`} onClick={() => setActiveDoctorId(dId)}>
                                {d.icon} {d.name.split(' ')[1]}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="dd-body">
                {/* Left: OPD Controls */}
                <div className="dd-controls-panel">
                    {/* Active Doctor Card */}
                    <div className="dd-doc-card">
                        <span className="dd-doc-avatar">{doctor.icon}</span>
                        <div>
                            <h3>{doctor.name}</h3>
                            <p>{doctor.specialty} · {doctor.clinicName}</p>
                        </div>
                        <span className={`dd-status-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                    </div>

                    {/* Session Tabs */}
                    <div className="dd-session-tabs">
                        {['morning', 'evening'].map(s => (
                            <button key={s} className={`dd-session-tab ${activeSession === s ? 'active' : ''}`} onClick={() => setActiveSession(s)}>
                                {s === 'morning' ? '🌅 Morning' : '🌙 Evening'} OPD
                            </button>
                        ))}
                    </div>

                    {/* Current Token Display */}
                    <div className="dd-current-token-card">
                        <div className="ct-label">Currently Serving</div>
                        <div className="ct-number">#{state.currentToken}</div>
                        <div className="ct-meta">
                            <span>{sessionBookings.length} patients booked</span>
                            <span>{tokensLeft} tokens left</span>
                        </div>
                    </div>

                    {/* OPD Control Buttons */}
                    <div className="dd-opd-controls">
                        <button className="ctrl-btn call-next" onClick={callNext} disabled={state.status !== 'open' || state.currentToken >= sessionBookings.length}>
                            ⏭ Call Next Token (#{state.currentToken + 1})
                        </button>
                        <button className={`ctrl-btn ${state.status === 'paused' ? 'resume' : 'pause'}`} onClick={togglePause} disabled={state.status === 'closed'}>
                            {state.status === 'paused' ? '▶ Resume OPD' : '⏸ Pause OPD (Break)'}
                        </button>
                        <button className="ctrl-btn close-opd" onClick={closeOPD} disabled={state.status === 'closed'}>
                            🔴 Close OPD Early
                        </button>
                    </div>

                    {/* Break Timer */}
                    <div className="dd-break-panel">
                        <label>⏱ Break Duration</label>
                        <div className="break-selector">
                            {[5, 10, 15, 20, 30].map(min => (
                                <button key={min} className={`break-pill ${breakDuration === min ? 'active' : ''}`} onClick={() => setBreakDuration(min)}>{min} min</button>
                            ))}
                        </div>
                    </div>

                    {/* Emergency button */}
                    <button className="ctrl-btn emergency-ctrl">🚨 Mark Emergency</button>
                </div>

                {/* Right: Queue & Schedule */}
                <div className="dd-queue-panel">
                    {/* Token Queue Table */}
                    <div className="dd-queue-section">
                        <div className="dd-section-header">
                            <h3>Live Token Queue — {activeSession === 'morning' ? 'Morning' : 'Evening'} OPD</h3>
                            <span className="queue-count">{sessionBookings.length} patients</span>
                        </div>

                        {sessionBookings.length === 0 ? (
                            <div className="dd-empty-queue">
                                <span>🗓</span>
                                <p>No tokens booked yet for this session.</p>
                            </div>
                        ) : (
                            <div className="dd-queue-table">
                                <div className="qt-header">
                                    <span>Token</span>
                                    <span>Patient</span>
                                    <span>Type</span>
                                    <span>Est. Time</span>
                                    <span>Status</span>
                                </div>
                                {sessionBookings.map((b, idx) => {
                                    const tokenNum = idx + 1
                                    const qStatus = getQueueStatusColor(tokenNum)
                                    const estTime = new Date()
                                    estTime.setMinutes(estTime.getMinutes() + (tokenNum - state.currentToken) * sessionData.tokenDuration)
                                    return (
                                        <div key={b.tokenId} className={`qt-row qt-${qStatus}`}>
                                            <span className="qt-num">#{tokenNum}</span>
                                            <span className="qt-name">{b.patientName}</span>
                                            <span className={`qt-type qt-${b.visitType}`}>{b.visitType === 'clinic' ? '🏥' : '📹'} {b.visitType}</span>
                                            <span className="qt-time">{estTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className={`qt-status qt-status-${qStatus}`}>
                                                {qStatus === 'done' ? '✅ Done' : qStatus === 'current' ? '🔵 Now' : qStatus === 'next' ? '🟡 Next' : '⚪ Waiting'}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Schedule Setup */}
                    <div className="dd-schedule-section">
                        <div className="dd-section-header">
                            <h3>⚙️ Schedule Settings</h3>
                            {!editingSchedule && <button className="edit-schedule-btn" onClick={startEditSchedule}>Edit Schedule</button>}
                        </div>

                        {editingSchedule && scheduleForm ? (
                            <div className="schedule-editor">
                                {['morning', 'evening'].map(s => (
                                    <div key={s} className="se-session-block">
                                        <div className="se-session-header">
                                            <span>{s === 'morning' ? '🌅 Morning OPD' : '🌙 Evening OPD'}</span>
                                            <label className="se-toggle">
                                                <input type="checkbox" checked={scheduleForm[s].active}
                                                    onChange={e => setScheduleForm(prev => ({ ...prev, [s]: { ...prev[s], active: e.target.checked } }))} />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                        {scheduleForm[s].active && (
                                            <div className="se-fields">
                                                <div className="se-field"><label>Start</label><input type="time" value={scheduleForm[s].start} onChange={e => setScheduleForm(prev => ({ ...prev, [s]: { ...prev[s], start: e.target.value } }))} /></div>
                                                <div className="se-field"><label>End</label><input type="time" value={scheduleForm[s].end} onChange={e => setScheduleForm(prev => ({ ...prev, [s]: { ...prev[s], end: e.target.value } }))} /></div>
                                                <div className="se-field"><label>Total Tokens</label><input type="number" min="5" max="100" value={scheduleForm[s].totalTokens} onChange={e => setScheduleForm(prev => ({ ...prev, [s]: { ...prev[s], totalTokens: parseInt(e.target.value) } }))} /></div>
                                                <div className="se-field"><label>Min/Token</label><input type="number" min="3" max="30" value={scheduleForm[s].tokenDuration} onChange={e => setScheduleForm(prev => ({ ...prev, [s]: { ...prev[s], tokenDuration: parseInt(e.target.value) } }))} /></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="se-actions">
                                    <button className="se-save" onClick={saveSchedule}>💾 Save Schedule</button>
                                    <button className="se-cancel" onClick={() => setEditingSchedule(false)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="schedule-preview">
                                {['morning', 'evening'].map(s => (
                                    <div key={s} className={`sp-row ${!doctor.schedule[s].active ? 'sp-inactive' : ''}`}>
                                        <span>{s === 'morning' ? '🌅' : '🌙'} {s.charAt(0).toUpperCase() + s.slice(1)}</span>
                                        <span>{doctor.schedule[s].active ? `${doctor.schedule[s].start} – ${doctor.schedule[s].end}` : 'Off'}</span>
                                        <span>{doctor.schedule[s].active ? `${doctor.schedule[s].totalTokens} tokens · ${doctor.schedule[s].tokenDuration} min each` : ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorDashboard
