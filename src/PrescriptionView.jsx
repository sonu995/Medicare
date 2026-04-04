import { useState, useEffect, useCallback } from 'react'
import { fetchPrescriptions, fetchPrescriptionByPatient } from './api/prescriptionsApi'
import './PrescriptionView.css'

function PrescriptionView({ patientPhone }) {
    const [prescriptions, setPrescriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedPrescription, setSelectedPrescription] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    const loadPrescriptions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            let response
            if (patientPhone) {
                response = await fetchPrescriptionByPatient(patientPhone)
            } else {
                response = await fetchPrescriptions()
            }
            let prescriptionsArray = []
            if (Array.isArray(response)) {
                prescriptionsArray = response
            } else if (response?.data && Array.isArray(response.data)) {
                prescriptionsArray = response.data
            } else if (response?.success && Array.isArray(response.data)) {
                prescriptionsArray = response.data
            }
            setPrescriptions(prescriptionsArray)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [patientPhone])

    useEffect(() => {
        loadPrescriptions()
    }, [loadPrescriptions])

    const filteredPrescriptions = prescriptions.filter(p => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
            p.doctorName?.toLowerCase().includes(search) ||
            p.diagnosis?.toLowerCase().includes(search) ||
            p.prescriptionId?.toLowerCase().includes(search) ||
            p.clinicName?.toLowerCase().includes(search)
        )
    })

    console.log('prescriptions:', prescriptions.length, 'filtered:', filteredPrescriptions.length)

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handlePrintPrescription = (prescription) => {
        const currentDate = new Date(prescription.date || Date.now())
        const formattedDate = currentDate.toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'long', year: 'numeric' 
        })
        const formattedTime = currentDate.toLocaleTimeString('en-IN', { 
            hour: '2-digit', minute: '2-digit' 
        })
        
        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Medical Prescription - ${prescription.prescriptionId}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1a1a1a; }
                .rx-container { max-width: 800px; margin: 0 auto; border: 3px solid #4f46e5; border-radius: 12px; overflow: hidden; }
                .rx-header { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 25px 30px; text-align: center; }
                .clinic-icon { font-size: 3rem; margin-bottom: 10px; }
                .clinic-name { font-size: 1.8rem; font-weight: 800; letter-spacing: 1px; }
                .clinic-details { font-size: 0.85rem; opacity: 0.9; margin-top: 8px; }
                .rx-meta-bar { background: #f1f5f9; padding: 12px 30px; display: flex; justify-content: space-between; font-size: 0.85rem; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; gap: 10px; }
                .rx-meta-item { display: flex; align-items: center; gap: 6px; }
                .rx-body { padding: 25px 30px; }
                .patient-doctor-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
                .info-card h4 { font-size: 0.7rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; }
                .info-card .value { font-size: 1rem; font-weight: 700; color: #1e293b; }
                .info-card .value.small { font-size: 0.85rem; font-weight: 500; margin-top: 6px; }
                .rx-title { font-size: 1.1rem; font-weight: 800; color: #4f46e5; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #4f46e5; }
                .rx-section { margin-bottom: 20px; }
                .rx-section h4 { font-size: 0.75rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; }
                .rx-section p { font-size: 0.95rem; color: #1e293b; line-height: 1.5; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #4f46e5; }
                .medicines-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .medicines-table th { background: #4f46e5; color: white; padding: 12px 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
                .medicines-table td { padding: 14px 15px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
                .medicines-table tr:nth-child(even) { background: #f8fafc; }
                .med-num { font-weight: 700; color: #4f46e5; }
                .med-name { font-weight: 700; font-size: 1rem; }
                .med-dosage { background: #e0e7ff; color: #4f46e5; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; margin-top: 4px; }
                .med-instructions { font-size: 0.8rem; color: #64748b; font-style: italic; margin-top: 4px; }
                .extra-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
                .extra-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
                .extra-card h4 { font-size: 0.7rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; }
                .extra-card p { font-size: 0.9rem; color: #1e293b; line-height: 1.5; }
                .followup-card { background: #fef3c7; border-color: #f59e0b; }
                .followup-card h4 { color: #92400e; }
                .rx-footer { background: #4f46e5; color: white; padding: 15px 30px; text-align: center; font-size: 0.8rem; }
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
                    <div class="clinic-icon">${prescription.clinicIcon || '🏥'}</div>
                    <div class="clinic-name">${prescription.clinicName || 'Medical Clinic'}</div>
                    <div class="clinic-details">${prescription.clinicAddress || ''} | Tel: ${prescription.clinicPhone || ''}</div>
                </div>
                
                <div class="rx-meta-bar">
                    <div class="rx-meta-item"><strong>Rx ID:</strong> ${prescription.prescriptionId}</div>
                    <div class="rx-meta-item"><strong>Date:</strong> ${formattedDate}</div>
                    <div class="rx-meta-item"><strong>Time:</strong> ${formattedTime}</div>
                    <div class="rx-meta-item"><span class="token-badge">🎫 Token #${prescription.bookingId ? prescription.bookingId.slice(-6) : 'N/A'}</span></div>
                </div>
                
                <div class="rx-body">
                    <div class="patient-doctor-row">
                        <div class="info-card">
                            <h4>👤 Patient Details</h4>
                            <div class="value">${prescription.patientName}</div>
                            <div class="value small">📞 ${prescription.patientPhone || 'N/A'}</div>
                            ${prescription.age || prescription.gender ? `<div class="value small">👤 ${[prescription.age, prescription.gender].filter(Boolean).join(' / ') || 'N/A'}</div>` : ''}
                        </div>
                        <div class="info-card">
                            <h4>👨‍⚕️ Attending Doctor</h4>
                            <div class="value">${prescription.doctorName}</div>
                            <div class="value small">General Physician</div>
                        </div>
                    </div>
                    
                    ${prescription.chiefComplaint ? `<div class="rx-section"><h4>📋 Chief Complaint</h4><p>${prescription.chiefComplaint}</p></div>` : ''}
                    ${prescription.diagnosis ? `<div class="rx-section"><h4>🔬 Diagnosis</h4><p>${prescription.diagnosis}</p></div>` : ''}
                    
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
                        ${prescription.investigations ? `<div class="extra-card"><h4>🧪 Investigations / Tests</h4><p>${prescription.investigations}</p></div>` : ''}
                        ${prescription.advice ? `<div class="extra-card"><h4>💡 Advice</h4><p>${prescription.advice}</p></div>` : ''}
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
                        <div class="signature-box"><div class="line">Patient's Signature</div></div>
                        <div class="signature-box"><div class="line">Doctor's Signature & Stamp</div></div>
                    </div>
                </div>
                
                <div class="rx-footer">
                    <strong>🙏 Thank you for choosing us!</strong> | Please follow the prescription as directed | Get well soon! ❤️
                </div>
            </div>
        </body>
        </html>
        `;
        
        const printWindow = window.open('', '_blank')
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
    }

    if (loading) {
        return (
            <div className="pv-loading">
                <div className="pv-spinner"></div>
                <p>Loading your prescriptions...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="pv-error">
                <span className="pv-error-icon">⚠️</span>
                <h3>Unable to load prescriptions</h3>
                <p>{error}</p>
                <button onClick={loadPrescriptions} className="pv-retry-btn">Try Again</button>
            </div>
        )
    }

    return (
        <div className="pv-container">
            <div className="pv-header">
                <div className="pv-header-left">
                    <h2>📋 Your Prescriptions</h2>
                    <p>{prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} found</p>
                </div>
                <div className="pv-search-box">
                    <span className="pv-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search prescriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredPrescriptions.length === 0 ? (
                <div className="pv-empty">
                    <span className="pv-empty-icon">📋</span>
                    <h3>No Prescriptions Found</h3>
                    {searchTerm ? (
                        <p>No prescriptions match "{searchTerm}"</p>
                    ) : (
                        <p>You don't have any prescriptions yet. Prescriptions will appear here after your doctor visits.</p>
                    )}
                </div>
            ) : (
                <div className="pv-list">
                    {filteredPrescriptions.map((prescription, index) => (
                        <div 
                            key={prescription._id || prescription.id || index} 
                            className={`pv-card ${selectedPrescription === (prescription._id || prescription.id) ? 'expanded' : ''}`}
                        >
                            <div 
                                className="pv-card-header"
                                onClick={() => setSelectedPrescription(
                                    selectedPrescription === (prescription._id || prescription.id) 
                                        ? null 
                                        : (prescription._id || prescription.id)
                                )}
                            >
                                <div className="pv-card-icon">💊</div>
                                <div className="pv-card-info">
                                    <h3>Dr. {prescription.doctorName}</h3>
                                    <div className="pv-card-meta">
                                        <span className="pv-date">📅 {formatDate(prescription.date)}</span>
                                        <span className="pv-time">🕐 {formatTime(prescription.date)}</span>
                                        <span className="pv-rx-id">Rx: {prescription.prescriptionId}</span>
                                    </div>
                                </div>
                                <div className="pv-card-actions">
                                    <button 
                                        className="pv-print-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePrintPrescription(prescription)
                                        }}
                                    >
                                        🖨️ Print
                                    </button>
                                    <span className="pv-expand-icon">
                                        {selectedPrescription === (prescription._id || prescription.id) ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {selectedPrescription === (prescription._id || prescription.id) && (
                                <div className="pv-card-body">
                                    {prescription.clinicName && (
                                        <div className="pv-clinic-info">
                                            <span className="pv-clinic-icon">{prescription.clinicIcon || '🏥'}</span>
                                            <span className="pv-clinic-name">{prescription.clinicName}</span>
                                        </div>
                                    )}

                                    {prescription.chiefComplaint && (
                                        <div className="pv-section">
                                            <span className="pv-section-label">📋 Chief Complaint</span>
                                            <p className="pv-section-content">{prescription.chiefComplaint}</p>
                                        </div>
                                    )}

                                    {prescription.diagnosis && (
                                        <div className="pv-section">
                                            <span className="pv-section-label">🔬 Diagnosis</span>
                                            <p className="pv-section-content">{prescription.diagnosis}</p>
                                        </div>
                                    )}

                                    {prescription.medicines && prescription.medicines.length > 0 && (
                                        <div className="pv-medicines">
                                            <span className="pv-section-label">💊 Prescribed Medicines</span>
                                            <div className="pv-medicines-list">
                                                {prescription.medicines.map((med, medIdx) => (
                                                    <div key={medIdx} className="pv-medicine-item">
                                                        <div className="pv-med-header">
                                                            <span className="pv-med-num">{medIdx + 1}</span>
                                                            <span className="pv-med-name">{med.name}</span>
                                                        </div>
                                                        <div className="pv-med-details">
                                                            {med.dosage && <span className="pv-med-tag dosage">{med.dosage}</span>}
                                                            {med.frequency && <span className="pv-med-tag frequency">{med.frequency}</span>}
                                                            {med.duration && <span className="pv-med-tag duration">{med.duration}</span>}
                                                        </div>
                                                        {med.instructions && (
                                                            <div className="pv-med-instructions">{med.instructions}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {prescription.advice && (
                                        <div className="pv-section">
                                            <span className="pv-section-label">💡 Advice</span>
                                            <p className="pv-section-content">{prescription.advice}</p>
                                        </div>
                                    )}

                                    {prescription.investigations && (
                                        <div className="pv-section">
                                            <span className="pv-section-label">🧪 Investigations</span>
                                            <p className="pv-section-content">{prescription.investigations}</p>
                                        </div>
                                    )}

                                    {prescription.followUp && (
                                        <div className="pv-section followup">
                                            <span className="pv-section-label">📅 Follow-up</span>
                                            <p className="pv-section-content">{prescription.followUp}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PrescriptionView