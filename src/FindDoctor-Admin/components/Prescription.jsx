import React, { useState, useEffect, useMemo } from 'react';
import { fetchPrescriptions, createPrescription } from '../../api/prescriptionsApi';

const Prescription = ({ doctors, tokenBookings, clinic, refreshKey = 0 }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPrescriptionDetail, setShowPrescriptionDetail] = useState(false);
    const [createdPrescription, setCreatedPrescription] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('prescriptions');
    const [expandedPrescription, setExpandedPrescription] = useState(null);
    const [prescriptionForm, setPrescriptionForm] = useState({
        patientName: '',
        patientPhone: '',
        doctorId: '',
        doctorName: '',
        chiefComplaint: '',
        diagnosis: '',
        medicines: [{ name: '', dosage: '', frequency: '1-1-1', duration: '', instructions: '' }],
        advice: '',
        followUp: '',
        investigations: '',
        age: '',
        gender: ''
    });

    const doctorIds = doctors.map(d => d._id || d.id);

    useEffect(() => {
        loadPrescriptions()
    }, [clinic?._id, clinic?.id, refreshKey])

    const loadPrescriptions = async () => {
        try {
            setLoading(true)
            setError(null)
            const params = {}
            if (clinic?._id || clinic?.id) {
                params.clinicId = clinic._id || clinic.id
            }
            const response = await fetchPrescriptions(params)
            console.log('Prescriptions response:', response);
            setPrescriptions(response.data || response || [])
        } catch (err) {
            console.error('Error loading prescriptions:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const patients = useMemo(() => {
        const patientMap = new Map();
        
        tokenBookings
            .filter(b => doctorIds.includes(b.doctorId))
            .forEach(booking => {
                const patientName = booking.patientName || booking.name || 'Unknown';
                const phone = booking.phone || booking.patientPhone || 'N/A';
                const key = phone !== 'N/A' ? phone : patientName;
                
                if (!patientMap.has(key)) {
                    patientMap.set(key, {
                        name: patientName,
                        phone: phone,
                        doctorId: booking.doctorId,
                        doctorName: doctors.find(d => (d._id || d.id) === booking.doctorId)?.name || 'Unknown',
                        lastVisit: booking.createdAt || booking.bookingDate,
                        bookings: [],
                        age: booking.age || '',
                        gender: booking.gender || ''
                    });
                }
                patientMap.get(key).bookings.push(booking);
            });

        return Array.from(patientMap.values()).sort((a, b) => 
            new Date(b.lastVisit) - new Date(a.lastVisit)
        );
    }, [tokenBookings, doctorIds, doctors]);

    const filteredPatients = useMemo(() => {
        return patients.filter(p => {
            const matchesSearch = !searchTerm || 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.phone.includes(searchTerm);
            const matchesDoctor = selectedDoctor === 'all' || p.doctorId === selectedDoctor || p.doctorName === selectedDoctor;
            return matchesSearch && matchesDoctor;
        });
    }, [patients, searchTerm, selectedDoctor]);

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

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setPrescriptionForm(prev => ({
            ...prev,
            patientName: patient.name,
            patientPhone: patient.phone,
            doctorId: patient.doctorId,
            doctorName: patient.doctorName,
            age: patient.age || '',
            gender: patient.gender || ''
        }));
        setShowCreateModal(true);
    };

    const handleSavePrescription = async () => {
        try {
            const prescriptionData = {
                ...prescriptionForm,
                clinicId: clinic?._id || clinic?.id,
                clinicName: clinic?.name || '',
                prescriptionId: `RX-${Date.now()}`,
                date: new Date().toISOString(),
                medicines: prescriptionForm.medicines.filter(m => m.name.trim())
            };

            const response = await createPrescription(prescriptionData)
            
            if (response.success && response.data) {
                setPrescriptions(prev => [response.data, ...prev])
                setCreatedPrescription(response.data);
                setShowCreateModal(false);
                setShowPrescriptionDetail(true);
            }
            
            setSelectedPatient(null);
            setPrescriptionForm({
                patientName: '',
                patientPhone: '',
                doctorId: '',
                doctorName: '',
                chiefComplaint: '',
                diagnosis: '',
                medicines: [{ name: '', dosage: '', frequency: '1-1-1', duration: '', instructions: '' }],
                advice: '',
                followUp: '',
                investigations: '',
                age: '',
                gender: ''
            });
            alert('Prescription created successfully!');
        } catch (err) {
            alert('Error creating prescription: ' + err.message)
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
                            <div class="value small">${clinic?.specialties ? clinic.specialties.join(', ') : 'General Physician'}</div>
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

    return (
        <div className="prescription-manager">
            <div className="prescription-header">
                <div className="header-top">
                    <h2>💊 Doctor's Prescription</h2>
                    <button className="btn-primary-action" onClick={() => setShowCreateModal(true)}>
                        ➕ Add Prescription
                    </button>
                </div>
                <div className="prescription-filters">
                    <input
                        type="text"
                        placeholder="Search patient by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="doctor-filter"
                    >
                        <option value="all">All Doctors</option>
                        {doctors.map(doc => (
                            <option key={doc._id || doc.id} value={doc._id || doc.id}>{doc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="prescription-stats">
                <div className="stat-card">
                    <span className="stat-icon">📋</span>
                    <div className="stat-info">
                        <span className="stat-num">{patients.length}</span>
                        <span className="stat-label">Total Patients</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">💊</span>
                    <div className="stat-info">
                        <span className="stat-num">{prescriptions.length}</span>
                        <span className="stat-label">Prescriptions</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">👨‍⚕️</span>
                    <div className="stat-info">
                        <span className="stat-num">{doctors.length}</span>
                        <span className="stat-label">Active Doctors</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <span>Loading prescriptions...</span>
                </div>
            ) : error ? (
                <div className="error-fallback">
                    <p>Error: {error}</p>
                    <button onClick={loadPrescriptions}>Retry</button>
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="no-data">
                    <span className="no-icon">💊</span>
                    <p>No prescriptions found</p>
                </div>
            ) : (
                <div className="prescriptions-list">
                    {prescriptions.map((prescription, idx) => (
                        <div key={idx} className="prescription-card-full">
                            <div 
                                className="prescription-card-header"
                                onClick={() => setExpandedPrescription(expandedPrescription === prescription._id || expandedPrescription === prescription.id ? null : prescription._id || prescription.id)}
                            >
                                <div className="prescription-header-left">
                                    <div className="rx-icon">💊</div>
                                    <div className="prescription-header-info">
                                        <h4>{prescription.patientName}</h4>
                                        <div className="prescription-meta">
                                            <span>📅 {new Date(prescription.date).toLocaleDateString('en-IN')}</span>
                                            <span>👨‍⚕️ {prescription.doctorName}</span>
                                            <span className="rx-id">Rx: {prescription.prescriptionId}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="prescription-header-right">
                                    <span className="expand-icon">{expandedPrescription === prescription._id || expandedPrescription === prescription.id ? '▲' : '▼'}</span>
                                </div>
                            </div>
                            
                            {expandedPrescription === prescription._id || expandedPrescription === prescription.id ? (
                                <div className="prescription-card-body">
                                    <div className="prescription-detail-row">
                                        <span className="detail-label">📞 Phone:</span>
                                        <span className="detail-value">{prescription.patientPhone || 'N/A'}</span>
                                        <span className="detail-label">👤 Age/Gender:</span>
                                        <span className="detail-value">{prescription.age || '-'} / {prescription.gender || '-'}</span>
                                    </div>
                                    
                                    {prescription.chiefComplaint && (
                                        <div className="prescription-section">
                                            <span className="section-label">📋 Chief Complaint:</span>
                                            <span className="section-value">{prescription.chiefComplaint}</span>
                                        </div>
                                    )}
                                    
                                    {prescription.diagnosis && (
                                        <div className="prescription-section">
                                            <span className="section-label">🔬 Diagnosis:</span>
                                            <span className="section-value">{prescription.diagnosis}</span>
                                        </div>
                                    )}
                                    
                                    {prescription.medicines && prescription.medicines.length > 0 && (
                                        <div className="prescription-medicines">
                                            <span className="section-label">💊 Medicines:</span>
                                            <div className="medicines-list">
                                                {prescription.medicines.map((med, medIdx) => (
                                                    <div key={medIdx} className="medicine-item">
                                                        <span className="med-name">{med.name}</span>
                                                        <span className="med-dosage">{med.dosage}</span>
                                                        <span className="med-freq">{med.frequency}</span>
                                                        <span className="med-duration">{med.duration}</span>
                                                        {med.instructions && <span className="med-instructions">{med.instructions}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {prescription.advice && (
                                        <div className="prescription-section">
                                            <span className="section-label">💡 Advice:</span>
                                            <span className="section-value">{prescription.advice}</span>
                                        </div>
                                    )}
                                    
                                    {prescription.investigations && (
                                        <div className="prescription-section">
                                            <span className="section-label">🧪 Investigations:</span>
                                            <span className="section-value">{prescription.investigations}</span>
                                        </div>
                                    )}
                                    
                                    {prescription.followUp && (
                                        <div className="prescription-section followup">
                                            <span className="section-label">📅 Follow-up:</span>
                                            <span className="section-value">{prescription.followUp}</span>
                                        </div>
                                    )}
                                    
                                    <div className="prescription-actions">
                                        <button 
                                            className="btn-print"
                                            onClick={() => handlePrintPrescription(prescription)}
                                        >
                                            🖨️ Print
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="prescription-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="prescription-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📝 Create Prescription</h3>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Patient Name *</label>
                                    <input 
                                        type="text" 
                                        value={prescriptionForm.patientName}
                                        onChange={e => handleFormChange('patientName', e.target.value)}
                                        placeholder="Patient Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input 
                                        type="tel" 
                                        value={prescriptionForm.patientPhone}
                                        onChange={e => handleFormChange('patientPhone', e.target.value)}
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Doctor *</label>
                                    <select
                                        value={prescriptionForm.doctorId}
                                        onChange={e => {
                                            const doc = doctors.find(d => (d._id || d.id) === e.target.value);
                                            handleFormChange('doctorId', e.target.value);
                                            handleFormChange('doctorName', doc?.name || '');
                                        }}
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(doc => (
                                            <option key={doc._id || doc.id} value={doc._id || doc.id}>{doc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input 
                                        type="date" 
                                        value={new Date().toISOString().split('T')[0]}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Age</label>
                                    <input 
                                        type="text" 
                                        value={prescriptionForm.age}
                                        onChange={e => handleFormChange('age', e.target.value)}
                                        placeholder="e.g., 35"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        value={prescriptionForm.gender}
                                        onChange={e => handleFormChange('gender', e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Chief Complaint *</label>
                                <input 
                                    type="text" 
                                    value={prescriptionForm.chiefComplaint}
                                    onChange={e => handleFormChange('chiefComplaint', e.target.value)}
                                    placeholder="e.g., Fever, headache for 2 days"
                                />
                            </div>

                            <div className="form-group">
                                <label>Diagnosis</label>
                                <input 
                                    type="text" 
                                    value={prescriptionForm.diagnosis}
                                    onChange={e => handleFormChange('diagnosis', e.target.value)}
                                    placeholder="e.g., Acute Viral Fever"
                                />
                            </div>

                            <div className="medicines-section">
                                <div className="section-header">
                                    <h4>💊 Medicines</h4>
                                    <button type="button" className="btn-add-medicine" onClick={handleAddMedicine}>
                                        ➕ Add Medicine
                                    </button>
                                </div>
                                
                                {prescriptionForm.medicines.map((medicine, index) => (
                                    <div key={index} className="medicine-row">
                                        <div className="medicine-inputs">
                                            <input 
                                                type="text"
                                                placeholder="Medicine Name"
                                                value={medicine.name}
                                                onChange={e => handleMedicineChange(index, 'name', e.target.value)}
                                                className="med-name"
                                            />
                                            <input 
                                                type="text"
                                                placeholder="Dosage (e.g., 500mg)"
                                                value={medicine.dosage}
                                                onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                                                className="med-dosage"
                                            />
                                            <select
                                                value={medicine.frequency}
                                                onChange={e => handleMedicineChange(index, 'frequency', e.target.value)}
                                                className="med-frequency"
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
                                                className="med-duration"
                                            />
                                        </div>
                                        <input 
                                            type="text"
                                            placeholder="Instructions (optional)"
                                            value={medicine.instructions}
                                            onChange={e => handleMedicineChange(index, 'instructions', e.target.value)}
                                            className="med-instructions"
                                        />
                                        {prescriptionForm.medicines.length > 1 && (
                                            <button 
                                                type="button"
                                                className="btn-remove-medicine"
                                                onClick={() => handleRemoveMedicine(index)}
                                            >
                                                🗑
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="form-group">
                                <label>Investigations / Tests</label>
                                <textarea 
                                    value={prescriptionForm.investigations}
                                    onChange={e => handleFormChange('investigations', e.target.value)}
                                    placeholder="e.g., CBC, Urine Routine, X-Ray Chest"
                                    rows="2"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Advice</label>
                                    <textarea 
                                        value={prescriptionForm.advice}
                                        onChange={e => handleFormChange('advice', e.target.value)}
                                        placeholder="e.g., Complete bed rest, plenty of fluids"
                                        rows="2"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Follow-up</label>
                                    <input 
                                        type="text" 
                                        value={prescriptionForm.followUp}
                                        onChange={e => handleFormChange('followUp', e.target.value)}
                                        placeholder="e.g., After 3 days or if symptoms worsen"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="btn-save-prescription" onClick={handleSavePrescription}>
                                💾 Save Prescription
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

export default Prescription;
