import { useState, useEffect, useCallback } from 'react';
import { fetchPrescriptions } from './api/prescriptionsApi';
import './BookingPrescriptionModal.css';

function BookingPrescriptionModal({ booking, doctor, clinic, onClose }) {
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadPrescription = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch prescriptions for this patient's phone number
            const params = {};
            if (booking?.patientPhone) {
                params.patientPhone = booking.patientPhone;
            }
            
            const response = await fetchPrescriptions(params);
            const prescriptions = response.data || response || [];
            
            // Find prescription for this booking
            const bookingPrescription = prescriptions.find(p => 
                p.bookingId === booking?.tokenId || 
                p.bookingId === booking?._id ||
                (p.patientPhone === booking?.patientPhone && 
                 new Date(p.date).toDateString() === new Date(booking?.bookingDate).toDateString())
            );
            
            setPrescription(bookingPrescription || null);
        } catch (err) {
            console.error('Error loading prescription:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [booking]);

    useEffect(() => {
        loadPrescription();
    }, [loadPrescription]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePrintPrescription = () => {
        if (!prescription) return;
        
        const currentDate = new Date(prescription.date || Date.now());
        const formattedDate = currentDate.toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'long', year: 'numeric' 
        });
        const formattedTime = currentDate.toLocaleTimeString('en-IN', { 
            hour: '2-digit', minute: '2-digit' 
        });
        
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
                .rx-meta-bar { background: #f1f5f9; padding: 12px 30px; display: flex; justify-content: space-between; font-size: 0.85rem; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; gap: 10px; }
                .rx-meta-item { display: flex; align-items: center; gap: 6px; }
                .rx-body { padding: 25px 30px; }
                .patient-doctor-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
                .info-card h4 { font-size: 0.7rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; }
                .info-card .value { font-size: 1rem; font-weight: 700; color: #1e293b; }
                .info-card .value.small { font-size: 0.85rem; font-weight: 500; margin-top: 6px; }
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
                            <div class="value small">${doctor?.specialty || 'General Physician'}</div>
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
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="booking-prescription-overlay" onClick={onClose}>
            <div className="booking-prescription-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>💊 Medical Prescription</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading prescription...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <span className="error-icon">⚠️</span>
                            <p>Error: {error}</p>
                        </div>
                    ) : !prescription ? (
                        <div className="no-prescription">
                            <span className="empty-icon">📋</span>
                            <h4>No Prescription Found</h4>
                            <p>No prescription has been issued for this visit yet. The doctor may have prescribed medication verbally or the prescription hasn't been uploaded.</p>
                            <div className="booking-summary">
                                <div className="summary-item">
                                    <span className="label">Token #:</span>
                                    <span className="value">#{booking?.tokenNumber}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Doctor:</span>
                                    <span className="value">{doctor?.name || 'N/A'}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Date:</span>
                                    <span className="value">{formatDate(booking?.bookingDate)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="prescription-content">
                            <div className="prescription-header-info">
                                <div className="rx-id-badge">
                                    <span className="rx-label">Rx ID:</span>
                                    <span className="rx-value">{prescription.prescriptionId}</span>
                                </div>
                                <div className="rx-date">
                                    <span className="date-label">📅</span>
                                    <span>{formatDate(prescription.date)} at {formatTime(prescription.date)}</span>
                                </div>
                            </div>

                            {prescription.clinicName && (
                                <div className="clinic-badge">
                                    <span className="clinic-icon">{clinic?.icon || '🏥'}</span>
                                    <span className="clinic-name">{prescription.clinicName}</span>
                                </div>
                            )}

                            {prescription.chiefComplaint && (
                                <div className="rx-section">
                                    <span className="section-label">📋 Chief Complaint</span>
                                    <p className="section-content">{prescription.chiefComplaint}</p>
                                </div>
                            )}

                            {prescription.diagnosis && (
                                <div className="rx-section">
                                    <span className="section-label">🔬 Diagnosis</span>
                                    <p className="section-content">{prescription.diagnosis}</p>
                                </div>
                            )}

                            {prescription.medicines && prescription.medicines.length > 0 && (
                                <div className="rx-medicines">
                                    <span className="section-label">💊 Prescribed Medicines</span>
                                    <div className="medicines-grid">
                                        {prescription.medicines.map((med, idx) => (
                                            <div key={idx} className="medicine-card">
                                                <div className="medicine-header">
                                                    <span className="medicine-num">{idx + 1}</span>
                                                    <span className="medicine-name">{med.name}</span>
                                                </div>
                                                <div className="medicine-details">
                                                    <span className="detail dosage">{med.dosage}</span>
                                                    <span className="detail frequency">{med.frequency}</span>
                                                    <span className="detail duration">{med.duration}</span>
                                                </div>
                                                {med.instructions && (
                                                    <div className="medicine-instructions">{med.instructions}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="rx-extra-sections">
                                {prescription.investigations && (
                                    <div className="extra-section">
                                        <span className="section-label">🧪 Investigations</span>
                                        <p className="section-content">{prescription.investigations}</p>
                                    </div>
                                )}
                                {prescription.advice && (
                                    <div className="extra-section">
                                        <span className="section-label">💡 Advice</span>
                                        <p className="section-content">{prescription.advice}</p>
                                    </div>
                                )}
                            </div>

                            {prescription.followUp && (
                                <div className="rx-followup">
                                    <span className="section-label">📅 Follow-up</span>
                                    <p className="section-content followup">{prescription.followUp}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {prescription && (
                    <div className="modal-footer">
                        <button className="btn-secondary" onClick={onClose}>Close</button>
                        <button className="btn-primary" onClick={handlePrintPrescription}>
                            🖨️ Print Prescription
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookingPrescriptionModal;