import React, { useState } from 'react';
import { createPrescription } from '../../api/prescriptionsApi';

const QueueManager = ({
    selectedDoctor,
    activeSession,
    onSessionChange,
    state,
    sessionBookings,
    onCallNext,
    onTogglePause,
    onCloseOPD,
    onWalkIn,
    clinic,
    onPrescriptionSaved
}) => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showPrescriptionDetail, setShowPrescriptionDetail] = useState(false);
    const [createdPrescription, setCreatedPrescription] = useState(null);
    const [savingPrescription, setSavingPrescription] = useState(false);
    const [prescriptionForm, setPrescriptionForm] = useState({
        chiefComplaint: '',
        diagnosis: '',
        medicines: [{ name: '', dosage: '', frequency: '1-1-1', duration: '', instructions: '' }],
        advice: '',
        followUp: '',
        investigations: ''
    });

    const frequencyOptions = [
        { value: '1-0-0', label: 'Morning (1-0-0)' },
        { value: '0-1-0', label: 'Afternoon (0-1-0)' },
        { value: '0-0-1', label: 'Night (0-0-1)' },
        { value: '1-0-1', label: 'Morning + Night' },
        { value: '1-1-0', label: 'Morning + Afternoon' },
        { value: '0-1-1', label: 'Afternoon + Night' },
        { value: '1-1-1', label: 'Three times a day' },
        { value: '1-1-1-1', label: 'Four times a day' },
        { value: 'SOS', label: 'SOS (as needed)' }
    ];

    const handleOpenPrescription = (patient) => {
        setSelectedPatient(patient);
        setPrescriptionForm({
            chiefComplaint: '',
            diagnosis: '',
            medicines: [{ name: '', dosage: '', frequency: '1-1-1', duration: '', instructions: '' }],
            advice: '',
            followUp: '',
            investigations: ''
        });
        setShowPrescriptionModal(true);
    };

    const handleAddMedicine = () => {
        setPrescriptionForm(prev => ({
            ...prev,
            medicines: [...prev.medicines, { name: '', dosage: '', frequency: '1-1-1', duration: '', instructions: '' }]
        }));
    };

    const handleRemoveMedicine = (index) => {
        setPrescriptionForm(prev => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index)
        }));
    };

    const handleMedicineChange = (index, field, value) => {
        setPrescriptionForm(prev => ({
            ...prev,
            medicines: prev.medicines.map((med, i) => 
                i === index ? { ...med, [field]: value } : med
            )
        }));
    };

    const handleFormChange = (field, value) => {
        setPrescriptionForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSavePrescription = async () => {
        try {
            setSavingPrescription(true);
            
            const prescriptionData = {
                ...prescriptionForm,
                clinicId: clinic?._id || clinic?.id,
                clinicName: clinic?.name || '',
                patientName: selectedPatient.patientName,
                patientPhone: selectedPatient.phone || selectedPatient.patientPhone,
                doctorId: selectedDoctor._id || selectedDoctor.id,
                doctorName: selectedDoctor.name,
                bookingId: selectedPatient._id || selectedPatient.id || selectedPatient.tokenId,
                age: selectedPatient.age || '',
                gender: selectedPatient.gender || '',
                medicines: prescriptionForm.medicines.filter(m => m.name.trim())
            };

            const response = await createPrescription(prescriptionData);
            
            if (response.success) {
                setCreatedPrescription(response.data);
                setShowPrescriptionModal(false);
                setShowPrescriptionDetail(true);
                if (onPrescriptionSaved) onPrescriptionSaved();
            } else {
                alert('Prescription saved (ID: ' + (response.data?.prescriptionId || 'Generated') + ')');
                setShowPrescriptionModal(false);
                if (onPrescriptionSaved) onPrescriptionSaved();
            }
            
            setSelectedPatient(null);
            setPrescriptionForm({
                chiefComplaint: '',
                diagnosis: '',
                medicines: [{ name: '', dosage: '', frequency: '1-1-1', duration: '', instructions: '' }],
                advice: '',
                followUp: '',
                investigations: ''
            });
        } catch (err) {
            alert('Error creating prescription: ' + err.message);
        } finally {
            setSavingPrescription(false);
        }
    };

    const handlePrintPrescription = (prescription) => {
        const currentDate = new Date(prescription.date || Date.now());
        const formattedDate = currentDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = currentDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Medical Prescription - ${prescription.prescriptionId}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1a1a1a; }
                .rx-container { max-width: 800px; margin: 0 auto; border: 3px solid #1e40af; border-radius: 12px; overflow: hidden; }
                .rx-header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 25px 30px; text-align: center; }
                .clinic-icon { font-size: 3rem; margin-bottom: 10px; }
                .clinic-name { font-size: 1.8rem; font-weight: 800; letter-spacing: 1px; }
                .clinic-details { font-size: 0.85rem; opacity: 0.9; margin-top: 8px; }
                .rx-meta-bar { background: #f1f5f9; padding: 12px 30px; display: flex; justify-content: space-between; font-size: 0.85rem; border-bottom: 1px solid #e2e8f0; }
                .rx-meta-item { display: flex; align-items: center; gap: 6px; }
                .rx-body { padding: 25px 30px; }
                .patient-doctor-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
                .info-card h4 { font-size: 0.7rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; }
                .info-card .value { font-size: 1rem; font-weight: 700; color: #1e293b; }
                .info-card .value.small { font-size: 0.85rem; font-weight: 500; }
                .rx-title { font-size: 1.1rem; font-weight: 800; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #1e40af; }
                .rx-section { margin-bottom: 20px; }
                .rx-section h4 { font-size: 0.75rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; }
                .rx-section p { font-size: 0.95rem; color: #1e293b; line-height: 1.5; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #1e40af; }
                .medicines-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .medicines-table th { background: #1e40af; color: white; padding: 12px 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
                .medicines-table td { padding: 14px 15px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
                .medicines-table tr:nth-child(even) { background: #f8fafc; }
                .med-num { font-weight: 700; color: #1e40af; }
                .med-name { font-weight: 700; font-size: 1rem; }
                .med-dosage { background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; margin-top: 4px; }
                .med-instructions { font-size: 0.8rem; color: #64748b; font-style: italic; margin-top: 4px; }
                .extra-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
                .extra-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
                .extra-card h4 { font-size: 0.7rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; }
                .extra-card p { font-size: 0.9rem; color: #1e293b; line-height: 1.5; }
                .followup-card { background: #fef3c7; border-color: #f59e0b; }
                .followup-card h4 { color: #92400e; }
                .rx-footer { background: #1e40af; color: white; padding: 15px 30px; text-align: center; font-size: 0.8rem; }
                .signature-row { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
                .signature-box { text-align: center; width: 200px; }
                .signature-box .line { border-top: 1px solid #1a1a1a; margin-top: 40px; padding-top: 5px; font-size: 0.8rem; color: #64748b; }
                .token-badge { background: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 6px; font-weight: 700; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 5px; }
                @media print { body { padding: 0; } .rx-container { border: 2px solid #000; } }
            </style>
        </head>
        <body>
            <div class="rx-container">
                <div class="rx-header">
                    <div class="clinic-icon">${clinic?.icon || '🏥'}</div>
                    <div class="clinic-name">${clinic?.name || 'Medical Clinic'}</div>
                    <div class="clinic-details">${clinic?.address || ''} | Tel: ${clinic?.phone || ''}</div>
                </div>
                
                <div class="rx-meta-bar">
                    <div class="rx-meta-item">
                        <strong>Rx ID:</strong> ${prescription.prescriptionId}
                    </div>
                    <div class="rx-meta-item">
                        <strong>Date:</strong> ${formattedDate}
                    </div>
                    <div class="rx-meta-item">
                        <strong>Time:</strong> ${formattedTime}
                    </div>
                    <div class="rx-meta-item">
                        <span class="token-badge">🎫 Token #${prescription.bookingId ? prescription.bookingId.slice(-6) : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="rx-body">
                    <div class="patient-doctor-row">
                        <div class="info-card">
                            <h4>👤 Patient Details</h4>
                            <div class="value">${prescription.patientName}</div>
                            <div class="value small" style="margin-top: 6px;">📞 ${prescription.patientPhone || 'N/A'}</div>
                            ${prescription.age || prescription.gender ? `<div class="value small" style="margin-top: 4px;">👤 ${[prescription.age, prescription.gender].filter(Boolean).join(' / ') || 'N/A'}</div>` : ''}
                        </div>
                        <div class="info-card">
                            <h4>👨‍⚕️ Attending Doctor</h4>
                            <div class="value">${prescription.doctorName}</div>
                            <div class="value small" style="margin-top: 6px;">${clinic?.specialties ? clinic.specialties.join(', ') : 'General Physician'}</div>
                        </div>
                    </div>
                    
                    ${prescription.chiefComplaint ? `
                    <div class="rx-section">
                        <h4>📋 Chief Complaint</h4>
                        <p>${prescription.chiefComplaint}</p>
                    </div>
                    ` : ''}
                    
                    ${prescription.diagnosis ? `
                    <div class="rx-section">
                        <h4>🔬 Diagnosis</h4>
                        <p>${prescription.diagnosis}</p>
                    </div>
                    ` : ''}
                    
                    ${prescription.medicines && prescription.medicines.length > 0 ? `
                    <div class="rx-section">
                        <div class="rx-title">💊 Rx Medications</div>
                        <table class="medicines-table">
                            <thead>
                                <tr>
                                    <th style="width: 40px;">#</th>
                                    <th>Medicine</th>
                                    <th style="width: 150px;">Dosage</th>
                                    <th style="width: 140px;">Frequency</th>
                                    <th style="width: 120px;">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${prescription.medicines.map((med, i) => `
                                <tr>
                                    <td><span class="med-num">${i + 1}</span></td>
                                    <td>
                                        <div class="med-name">${med.name}</div>
                                        ${med.dosage ? `<span class="med-dosage">${med.dosage}</span>` : ''}
                                        ${med.instructions ? `<div class="med-instructions">${med.instructions}</div>` : ''}
                                    </td>
                                    <td>${med.dosage || '-'}</td>
                                    <td>${med.frequency || '-'}</td>
                                    <td>${med.duration || '-'}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : ''}
                    
                    <div class="extra-sections">
                        ${prescription.investigations ? `
                        <div class="extra-card">
                            <h4>🧪 Investigations / Tests</h4>
                            <p>${prescription.investigations}</p>
                        </div>
                        ` : ''}
                        ${prescription.advice ? `
                        <div class="extra-card">
                            <h4>💡 Advice</h4>
                            <p>${prescription.advice}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${prescription.followUp ? `
                    <div class="extra-sections" style="margin-top: 0;">
                        <div class="extra-card followup-card">
                            <h4>📅 Follow-up Advice</h4>
                            <p>${prescription.followUp}</p>
                        </div>
                        <div class="extra-card">
                            <h4>⚠️ Important Note</h4>
                            <p>Please complete the full course of medication as prescribed. Consult doctor if symptoms persist or worsen.</p>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="signature-row">
                        <div class="signature-box">
                            <div class="line">Patient's Signature</div>
                        </div>
                        <div class="signature-box">
                            <div class="line">Doctor's Signature & Stamp</div>
                        </div>
                    </div>
                </div>
                
                <div class="rx-footer">
                    <strong>🙏 Thank you for choosing us!</strong> | Please follow the prescription as directed | Get well soon! ❤️
                </div>
            </div>
        </body>
        </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    const currentPatient = sessionBookings.find(b => b.tokenNumber === state.currentToken);

    if (!selectedDoctor) return (
        <div className="empty-manager-state">
            <div className="empty-icon">🩺</div>
            <h3>No doctor selected</h3>
            <p>Select a doctor from the dropdown above to manage the live queue.</p>
        </div>
    );

    const totalTokens = selectedDoctor.schedule?.[activeSession]?.totalTokens || 20;
    const tokensLeft = totalTokens - sessionBookings.length;
    const progress = sessionBookings.length > 0
        ? Math.min((state.currentToken / sessionBookings.length) * 100, 100)
        : 0;

    // SVG ring calculation
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="premium-queue-manager">
            {/* Session Switcher */}
            <div className="session-switcher-bar">
                <span className="session-label">Session:</span>
                <div className="session-toggle">
                    <button 
                        className={activeSession === 'morning' ? 'active' : ''}
                        onClick={() => onSessionChange && onSessionChange('morning')}
                        disabled={!selectedDoctor.schedule?.morning?.active}
                    >
                        🌅 Morning
                    </button>
                    <button 
                        className={activeSession === 'evening' ? 'active' : ''}
                        onClick={() => onSessionChange && onSessionChange('evening')}
                        disabled={!selectedDoctor.schedule?.evening?.active}
                    >
                        🌙 Evening
                    </button>
                </div>
            </div>

            {/* Left: Main control card */}
            <div className="queue-hero-card">
                <div className="hero-header">
                    <div className="doc-meta">
                        <span className="doc-avatar">{selectedDoctor.icon || '👨‍⚕️'}</span>
                        <div>
                            <h2>{selectedDoctor.name}</h2>
                            <p>{activeSession.toUpperCase()} SESSION</p>
                        </div>
                    </div>
                    <div className={`session-status-pill ${state.status || 'open'}`}>
                        {state.status === 'open' ? '🟢 Live'
                            : state.status === 'paused' ? '⏸ Paused'
                            : '🔴 Closed'}
                    </div>
                </div>

                <div className="token-main-display">
                    {/* Circular SVG Progress */}
                    <div className="token-circle">
                        <svg className="progress-ring" width="180" height="180" viewBox="0 0 180 180">
                            <defs>
                                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                            <circle className="ring-bg" cx="90" cy="90" r={radius} />
                            <circle
                                className="ring-fill"
                                cx="90" cy="90" r={radius}
                                stroke="url(#ringGrad)"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                            />
                        </svg>
                        <div className="token-data">
                            <span className="token-label">Serving</span>
                            <span className="token-number">#{state.currentToken || 1}</span>
                        </div>
                    </div>

                    <div className="queue-quick-stats">
                        <div className="q-stat">
                            <span className="q-val">{sessionBookings.length}</span>
                            <span className="q-lab">Booked</span>
                        </div>
                        <div className="q-stat">
                            <span className="q-val" style={{ color: tokensLeft > 5 ? '#10b981' : '#f59e0b' }}>
                                {tokensLeft}
                            </span>
                            <span className="q-lab">Available</span>
                        </div>
                    </div>
                </div>

                <div className="manager-actions">
                    <button
                        className="btn-primary-action"
                        onClick={onCallNext}
                        disabled={state.status !== 'open' || state.currentToken >= sessionBookings.length}
                        style={{
                            background: state.status !== 'open' || state.currentToken >= sessionBookings.length
                                ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            opacity: 1,
                            boxShadow: state.status !== 'open' || state.currentToken >= sessionBookings.length
                                ? '0 4px 12px rgba(0,0,0,0.1)'
                                : '0 8px 24px rgba(99,102,241,0.35)'
                        }}
                    >
                        {state.currentToken >= sessionBookings.length && sessionBookings.length > 0 ? (
                            <>
                                <span>✅</span> All Patients Served
                            </>
                        ) : sessionBookings.length === 0 ? (
                            <>
                                <span>📋</span> No Patients Booked
                            </>
                        ) : (
                            <>
                                <span>⏭</span> Call Next Patient
                            </>
                        )}
                    </button>
                    <div className="secondary-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <button
                            className={`btn-icon-action ${state.status === 'paused' ? 'active' : ''}`}
                            onClick={onTogglePause}
                            style={{ padding: '12px 8px', fontSize: '0.78rem' }}
                        >
                            {state.status === 'paused' ? '▶ Resume' : '⏸ Pause'}
                        </button>
                        <button 
                            className="btn-icon-action danger" 
                            onClick={onCloseOPD}
                            style={{ padding: '12px 8px', fontSize: '0.78rem' }}
                        >
                            🔴 Close OPD
                        </button>
                        <button 
                            className="btn-icon-action success" 
                            onClick={onWalkIn}
                            style={{ padding: '12px 8px', fontSize: '0.78rem' }}
                        >
                            ➕ Walk-in
                        </button>
                    </div>
                    {currentPatient && state.status === 'open' && (
                        <button
                            className="btn-prescription-action"
                            onClick={() => handleOpenPrescription(currentPatient)}
                        >
                            💊 Create Prescription
                        </button>
                    )}
                </div>
            </div>

            {/* Right: Live queue list */}
            <div className="live-queue-list-card">
                <div className="card-title">
                    <h3>Up Next</h3>
                    <span>
                        {Math.max(0, sessionBookings.length - (state.currentToken || 1))} remaining
                    </span>
                </div>
                <div className="patient-scroll-area">
                    {sessionBookings.length === 0 ? (
                        <p className="empty-queue-text">No patients booked for this session yet.</p>
                    ) : (
                        [...sessionBookings]
                            .sort((a, b) => a.tokenNumber - b.tokenNumber)
                            .map(b => (
                                <div
                                    key={b.tokenId || b.tokenNumber}
                                    className={`patient-queue-item ${b.tokenNumber === state.currentToken ? 'current' : ''} ${b.status === 'completed' ? 'completed-item' : ''} ${b.status === 'cancelled' ? 'cancelled-item' : ''}`}
                                    onClick={() => setSelectedPatient(b)}
                                >
                                    <span className="p-token">#{b.tokenNumber}</span>
                                    <div className="p-info">
                                        <strong>{b.patientName}</strong>
                                        <span className={`visit-type ${b.visitType}`}>
                                            {b.visitType === 'online' ? '📹 Online' : b.visitType === 'walk-in' ? '🚶 Walk-in' : '🏥 Clinic'}
                                        </span>
                                    </div>
                                    <span className={`p-wait ${b.status || 'pending'}`}>
                                        {b.status === 'completed' ? '✅ DONE' : 
                                         b.status === 'cancelled' ? '❌ CANCELLED' :
                                         b.tokenNumber === state.currentToken ? '🔔 NOW' : '⏳ WAITING'}
                                    </span>
                                </div>
                            ))
                    )}
                </div>
            </div>

            {/* Patient Detail Modal - Premium Theme */}
            {selectedPatient && (
                <div className="patient-detail-overlay" onClick={() => setSelectedPatient(null)}>
                    <div className="patient-detail-modal" onClick={e => e.stopPropagation()}>
                        {/* Premium Header with Gradient */}
                        <div className="pd-modal-header">
                            <div className="pd-header-bg"></div>
                            <div className="pd-header-content">
                                <div className="pd-avatar-ring">
                                    <div className="pd-avatar">
                                        {selectedPatient.patientName?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                    <span className={`pd-status-dot ${selectedPatient.status || 'pending'}`}></span>
                                </div>
                                <div className="pd-header-info">
                                    <h3>{selectedPatient.patientName}</h3>
                                    <div className="pd-badges">
                                        <span className={`pd-badge ${selectedPatient.visitType}`}>
                                            {selectedPatient.visitType === 'online' ? '📹 Online' : 
                                             selectedPatient.visitType === 'walk-in' ? '🚶 Walk-in' : '🏥 Clinic'}
                                        </span>
                                        <span className={`pd-badge status ${selectedPatient.status || 'pending'}`}>
                                            {selectedPatient.status === 'completed' ? '✅ Completed' : 
                                             selectedPatient.status === 'cancelled' ? '❌ Cancelled' :
                                             selectedPatient.tokenNumber === state.currentToken ? '🔔 Serving Now' : '⏳ In Queue'}
                                        </span>
                                    </div>
                                </div>
                                <button className="pd-close-btn" onClick={() => setSelectedPatient(null)}>
                                    <span>✕</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="pd-quick-stats">
                            <div className="pd-stat-card">
                                <span className="pd-stat-icon">🎫</span>
                                <div className="pd-stat-content">
                                    <span className="pd-stat-value">#{selectedPatient.tokenNumber}</span>
                                    <span className="pd-stat-label">Token</span>
                                </div>
                            </div>
                            <div className="pd-stat-card">
                                <span className="pd-stat-icon">⏰</span>
                                <div className="pd-stat-content">
                                    <span className="pd-stat-value">{selectedPatient.session === 'morning' ? 'Morning' : 'Evening'}</span>
                                    <span className="pd-stat-label">Session</span>
                                </div>
                            </div>
                            <div className="pd-stat-card">
                                <span className="pd-stat-icon">💰</span>
                                <div className="pd-stat-content">
                                    <span className="pd-stat-value">₹{selectedPatient.fee || 0}</span>
                                    <span className="pd-stat-label">Fee</span>
                                </div>
                            </div>
                            <div className="pd-stat-card">
                                <span className="pd-stat-icon">📅</span>
                                <div className="pd-stat-content">
                                    <span className="pd-stat-value">{selectedPatient.bookingDate ? new Date(selectedPatient.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}</span>
                                    <span className="pd-stat-label">Date</span>
                                </div>
                            </div>
                        </div>

                        {/* Details Sections */}
                        <div className="pd-body">
                            <div className="pd-section">
                                <div className="pd-section-header">
                                    <span className="pd-section-icon">👤</span>
                                    <h4>Patient Information</h4>
                                </div>
                                <div className="pd-info-grid">
                                    <div className="pd-info-card">
                                        <label>Full Name</label>
                                        <span>{selectedPatient.patientName}</span>
                                    </div>
                                    <div className="pd-info-card">
                                        <label>Phone Number</label>
                                        <span>{selectedPatient.phone || selectedPatient.patientPhone || 'Not Provided'}</span>
                                    </div>
                                    <div className="pd-info-card">
                                        <label>Email</label>
                                        <span>{selectedPatient.email || 'Not Provided'}</span>
                                    </div>
                                    <div className="pd-info-card">
                                        <label>Age / Gender</label>
                                        <span>{selectedPatient.age || selectedPatient.gender || 'Not Provided'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pd-section">
                                <div className="pd-section-header">
                                    <span className="pd-section-icon">🏥</span>
                                    <h4>Visit Details</h4>
                                </div>
                                <div className="pd-info-grid">
                                    <div className="pd-info-card">
                                        <label>Doctor</label>
                                        <span>{selectedDoctor?.name || 'Not Assigned'}</span>
                                    </div>
                                    <div className="pd-info-card">
                                        <label>Visit Type</label>
                                        <span className={`pd-visit-type ${selectedPatient.visitType}`}>
                                            {selectedPatient.visitType === 'online' ? '📹 Online Consultation' : 
                                             selectedPatient.visitType === 'walk-in' ? '🚶 Walk-in Visit' : '🏥 Clinic Visit'}
                                        </span>
                                    </div>
                                    <div className="pd-info-card">
                                        <label>Booking Time</label>
                                        <span>{selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                    </div>
                                    <div className="pd-info-card">
                                        <label>Payment Status</label>
                                        <span className={`pd-payment ${selectedPatient.paymentStatus || 'pending'}`}>
                                            {selectedPatient.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedPatient.notes && (
                                <div className="pd-section">
                                    <div className="pd-section-header">
                                        <span className="pd-section-icon">📝</span>
                                        <h4>Notes</h4>
                                    </div>
                                    <div className="pd-notes">
                                        <p>{selectedPatient.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Footer */}
                        <div className="pd-footer">
                            <button className="pd-action-btn secondary" onClick={() => setSelectedPatient(null)}>
                                ← Back to Queue
                            </button>
                            <button
                                className="pd-action-btn primary"
                                onClick={() => {
                                    setShowPrescriptionModal(true);
                                    setPrescriptionForm({
                                        chiefComplaint: '',
                                        diagnosis: '',
                                        medicines: [{ name: '', dosage: '', frequency: '1-1-1', duration: '', instructions: '' }],
                                        advice: '',
                                        followUp: '',
                                        investigations: ''
                                    });
                                }}
                            >
                                💊 Create Prescription
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prescription Modal */}
            {showPrescriptionModal && selectedPatient && (
                <div className="rx-modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
                    <div className="rx-modal" onClick={e => e.stopPropagation()}>
                        <div className="rx-modal-header">
                            <h3>💊 Create Prescription</h3>
                            <div className="rx-patient-info">
                                <span>Patient: <strong>{selectedPatient.patientName}</strong></span>
                                <span>Doctor: <strong>{selectedDoctor.name}</strong></span>
                            </div>
                            <button className="rx-close-btn" onClick={() => setShowPrescriptionModal(false)}>✕</button>
                        </div>
                        
                        <div className="rx-modal-body">
                            <div className="rx-form-row">
                                <div className="rx-form-group">
                                    <label>Chief Complaint *</label>
                                    <input 
                                        type="text" 
                                        value={prescriptionForm.chiefComplaint}
                                        onChange={e => handleFormChange('chiefComplaint', e.target.value)}
                                        placeholder="e.g., Fever, headache for 2 days"
                                    />
                                </div>
                                <div className="rx-form-group">
                                    <label>Diagnosis</label>
                                    <input 
                                        type="text" 
                                        value={prescriptionForm.diagnosis}
                                        onChange={e => handleFormChange('diagnosis', e.target.value)}
                                        placeholder="e.g., Acute Viral Fever"
                                    />
                                </div>
                            </div>

                            <div className="rx-medicines-section">
                                <div className="rx-section-header">
                                    <h4>💊 Medicines</h4>
                                    <button type="button" className="rx-add-btn" onClick={handleAddMedicine}>
                                        ➕ Add Medicine
                                    </button>
                                </div>
                                
                                {prescriptionForm.medicines.map((medicine, index) => (
                                    <div key={index} className="rx-medicine-row">
                                        <div className="rx-medicine-inputs">
                                            <input 
                                                type="text"
                                                placeholder="Medicine Name"
                                                value={medicine.name}
                                                onChange={e => handleMedicineChange(index, 'name', e.target.value)}
                                                className="rx-med-name"
                                            />
                                            <input 
                                                type="text"
                                                placeholder="Dosage (e.g., 500mg)"
                                                value={medicine.dosage}
                                                onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                                                className="rx-med-dosage"
                                            />
                                            <select
                                                value={medicine.frequency}
                                                onChange={e => handleMedicineChange(index, 'frequency', e.target.value)}
                                                className="rx-med-frequency"
                                            >
                                                {frequencyOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <input 
                                                type="text"
                                                placeholder="Duration (e.g., 5 days)"
                                                value={medicine.duration}
                                                onChange={e => handleMedicineChange(index, 'duration', e.target.value)}
                                                className="rx-med-duration"
                                            />
                                        </div>
                                        <input 
                                            type="text"
                                            placeholder="Instructions (optional)"
                                            value={medicine.instructions}
                                            onChange={e => handleMedicineChange(index, 'instructions', e.target.value)}
                                            className="rx-med-instructions"
                                        />
                                        {prescriptionForm.medicines.length > 1 && (
                                            <button 
                                                type="button"
                                                className="rx-remove-btn"
                                                onClick={() => handleRemoveMedicine(index)}
                                            >
                                                🗑
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="rx-form-row">
                                <div className="rx-form-group">
                                    <label>Investigations / Tests</label>
                                    <textarea 
                                        value={prescriptionForm.investigations}
                                        onChange={e => handleFormChange('investigations', e.target.value)}
                                        placeholder="e.g., CBC, Urine Routine, X-Ray Chest"
                                        rows="2"
                                    />
                                </div>
                                <div className="rx-form-group">
                                    <label>Advice</label>
                                    <textarea 
                                        value={prescriptionForm.advice}
                                        onChange={e => handleFormChange('advice', e.target.value)}
                                        placeholder="e.g., Complete bed rest, plenty of fluids"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div className="rx-form-group full">
                                <label>Follow-up</label>
                                <input 
                                    type="text" 
                                    value={prescriptionForm.followUp}
                                    onChange={e => handleFormChange('followUp', e.target.value)}
                                    placeholder="e.g., After 3 days or if symptoms worsen"
                                />
                            </div>
                        </div>

                        <div className="rx-modal-footer">
                            <button className="rx-cancel-btn" onClick={() => setShowPrescriptionModal(false)} disabled={savingPrescription}>Cancel</button>
                            <button className="rx-save-btn" onClick={handleSavePrescription} disabled={savingPrescription}>
                                {savingPrescription ? '⏳ Saving...' : '💾 Save Prescription'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prescription Detail Modal - Professional Clinic Style */}
            {showPrescriptionDetail && createdPrescription && (
                <div className="rx-pro-overlay" onClick={() => setShowPrescriptionDetail(false)}>
                    <div className="rx-pro-modal" onClick={e => e.stopPropagation()}>
                        {/* Clinic Header */}
                        <div className="rx-pro-header">
                            <div className="rx-pro-clinic-icon">{clinic?.icon || '🏥'}</div>
                            <div className="rx-pro-clinic-info">
                                <h2>{clinic?.name || 'Medical Clinic'}</h2>
                                <p>{clinic?.address || ''} | {clinic?.phone || ''}</p>
                            </div>
                            <button className="rx-pro-close" onClick={() => setShowPrescriptionDetail(false)}>✕</button>
                        </div>
                        
                        {/* Rx Meta Bar */}
                        <div className="rx-pro-meta">
                            <div className="rx-pro-meta-item">
                                <span className="rx-pro-label">Rx ID</span>
                                <span className="rx-pro-value mono">{createdPrescription.prescriptionId}</span>
                            </div>
                            <div className="rx-pro-meta-item">
                                <span className="rx-pro-label">Date</span>
                                <span className="rx-pro-value">{new Date(createdPrescription.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="rx-pro-meta-item">
                                <span className="rx-pro-label">Time</span>
                                <span className="rx-pro-value">{new Date(createdPrescription.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="rx-pro-meta-item token">
                                <span className="rx-pro-label">Token</span>
                                <span className="rx-pro-value">#{createdPrescription.bookingId ? createdPrescription.bookingId.slice(-6) : 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div className="rx-pro-body">
                            {/* Patient & Doctor Cards */}
                            <div className="rx-pro-info-grid">
                                <div className="rx-pro-info-card patient">
                                    <div className="rx-pro-info-icon">👤</div>
                                    <div className="rx-pro-info-content">
                                        <span className="rx-pro-info-label">Patient Details</span>
                                        <span className="rx-pro-info-value">{createdPrescription.patientName}</span>
                                        <span className="rx-pro-info-sub">📞 {createdPrescription.patientPhone || 'N/A'}</span>
                                        {(createdPrescription.age || createdPrescription.gender) && (
                                            <span className="rx-pro-info-sub">👤 {[createdPrescription.age, createdPrescription.gender].filter(Boolean).join(' / ')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="rx-pro-info-card doctor">
                                    <div className="rx-pro-info-icon">👨‍⚕️</div>
                                    <div className="rx-pro-info-content">
                                        <span className="rx-pro-info-label">Attending Doctor</span>
                                        <span className="rx-pro-info-value">{createdPrescription.doctorName}</span>
                                        <span className="rx-pro-info-sub">{clinic?.specialties ? clinic.specialties[0] : 'General Physician'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Complaint & Diagnosis */}
                            {(createdPrescription.chiefComplaint || createdPrescription.diagnosis) && (
                                <div className="rx-pro-diagnosis-row">
                                    {createdPrescription.chiefComplaint && (
                                        <div className="rx-pro-diagnosis-card">
                                            <span className="rx-pro-diagnosis-label">📋 Chief Complaint</span>
                                            <span className="rx-pro-diagnosis-value">{createdPrescription.chiefComplaint}</span>
                                        </div>
                                    )}
                                    {createdPrescription.diagnosis && (
                                        <div className="rx-pro-diagnosis-card">
                                            <span className="rx-pro-diagnosis-label">🔬 Diagnosis</span>
                                            <span className="rx-pro-diagnosis-value">{createdPrescription.diagnosis}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Medicines */}
                            {createdPrescription.medicines && createdPrescription.medicines.length > 0 && (
                                <div className="rx-pro-medicines">
                                    <div className="rx-pro-section-title">
                                        <span>💊</span> Rx Medications
                                    </div>
                                    <div className="rx-pro-medicines-table">
                                        <div className="rx-pro-med-header">
                                            <span className="rx-pro-col-num">#</span>
                                            <span className="rx-pro-col-med">Medicine</span>
                                            <span className="rx-pro-col-dose">Dosage</span>
                                            <span className="rx-pro-col-freq">Frequency</span>
                                            <span className="rx-pro-col-dur">Duration</span>
                                        </div>
                                        {createdPrescription.medicines.map((med, index) => (
                                            <div key={index} className="rx-pro-med-row">
                                                <span className="rx-pro-col-num rx-pro-med-num">{index + 1}</span>
                                                <div className="rx-pro-col-med">
                                                    <span className="rx-pro-med-name">{med.name}</span>
                                                    {med.instructions && <span className="rx-pro-med-instructions">{med.instructions}</span>}
                                                </div>
                                                <span className="rx-pro-col-dose">{med.dosage || '-'}</span>
                                                <span className="rx-pro-col-freq rx-pro-freq-badge">{med.frequency || '-'}</span>
                                                <span className="rx-pro-col-dur">{med.duration || '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Extra Sections */}
                            <div className="rx-pro-extra-grid">
                                {createdPrescription.investigations && (
                                    <div className="rx-pro-extra-card">
                                        <span className="rx-pro-extra-label">🧪 Investigations</span>
                                        <span className="rx-pro-extra-value">{createdPrescription.investigations}</span>
                                    </div>
                                )}
                                {createdPrescription.advice && (
                                    <div className="rx-pro-extra-card">
                                        <span className="rx-pro-extra-label">💡 Advice</span>
                                        <span className="rx-pro-extra-value">{createdPrescription.advice}</span>
                                    </div>
                                )}
                            </div>

                            {createdPrescription.followUp && (
                                <div className="rx-pro-followup">
                                    <div className="rx-pro-followup-icon">📅</div>
                                    <div className="rx-pro-followup-content">
                                        <span className="rx-pro-followup-label">Follow-up Advice</span>
                                        <span className="rx-pro-followup-value">{createdPrescription.followUp}</span>
                                    </div>
                                </div>
                            )}

                            {/* Signature Rows */}
                            <div className="rx-pro-signatures">
                                <div className="rx-pro-sig-box">
                                    <div className="rx-pro-sig-line"></div>
                                    <span>Patient's Signature</span>
                                </div>
                                <div className="rx-pro-sig-box">
                                    <div className="rx-pro-sig-line"></div>
                                    <span>Doctor's Signature & Stamp</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="rx-pro-footer">
                            <span>🙏 Thank you for choosing us! | Get well soon! ❤️</span>
                            <button className="rx-pro-print-btn" onClick={() => handlePrintPrescription(createdPrescription)}>
                                🖨 Print Prescription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueueManager;
