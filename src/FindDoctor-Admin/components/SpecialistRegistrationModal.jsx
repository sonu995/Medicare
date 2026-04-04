import { useState } from 'react'
import '../ClinicAdminDashboard.css'

const SPECIALTIES = [
    'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician',
    'Gynecologist', 'ENT Specialist', 'Ophthalmologist', 'Psychiatrist', 'General Physician',
    'Urologist', 'Nephrologist', 'Pulmonologist', 'Gastroenterologist', 'Endocrinologist',
    'Rheumatologist', 'Oncologist', 'Plastic Surgeon', 'Dentist', 'Physiotherapist'
]

const INITIAL_FORM = {
    // Personal Info
    firstName: '', lastName: '', gender: 'Male', dob: '',
    phone: '', email: '', whatsapp: '',
    // Professional Info
    specialty: '', experience: '', fee: '',
    bio: '', icon: '👨‍⚕️',
    // Clinic Info
    clinicName: '', clinicId: '',
    // Education
    qualifications: [], degree: '', college: '', passingYear: '',
    // Schedule
    schedule: {
        morning: { active: true, start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10 },
        evening: { active: true, start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10 }
    },
    // Additional
    languages: [], achievements: [],
    regNo: '', aadhaar: '', pan: '',
    address: '', city: '', state: '', pincode: '',
    // Status
    status: 'active', available: 'Today'
}

function SpecialistRegistrationModal({ isOpen, onClose, onSubmit, clinic }) {
    const [formData, setFormData] = useState(INITIAL_FORM)
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newQualification, setNewQualification] = useState('')
    const [newLanguage, setNewLanguage] = useState('')
    const [newAchievement, setNewAchievement] = useState('')

    if (!isOpen) return null

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const updateSchedule = (session, field, value) => {
        setFormData(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [session]: { ...prev.schedule[session], [field]: value }
            }
        }))
    }

    const addArrayItem = (array, item, setItem) => {
        if (item.trim()) {
            setFormData(prev => ({ ...prev, [array]: [...prev[array], item.trim()] }))
            setItem('')
        }
    }

    const removeArrayItem = (array, index) => {
        setFormData(prev => ({
            ...prev,
            [array]: prev[array].filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const fullName = `${formData.firstName} ${formData.lastName}`.trim()
        
        const doctorData = {
            name: fullName || formData.firstName,
            ...formData,
            clinicName: clinic?.name || formData.clinicName,
            clinicId: clinic?._id || clinic?.id || formData.clinicId,
            experience: `${formData.experience}+ years`,
            rating: '4.5',
            location: clinic?.location || '',
            qualifications: formData.qualifications.length ? formData.qualifications : [formData.degree].filter(Boolean)
        }

        await onSubmit(doctorData)
        setIsSubmitting(false)
        setFormData(INITIAL_FORM)
        setCurrentStep(1)
        onClose()
    }

    const totalSteps = 4
    const steps = [
        { num: 1, label: 'Personal' },
        { num: 2, label: 'Professional' },
        { num: 3, label: 'Schedule' },
        { num: 4, label: 'Documents' }
    ]

    return (
        <div className="modal-overlay-premium" onClick={onClose}>
            <div className="specialist-modal-wrapper" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="specialist-modal-header">
                    <div className="header-gradient-overlay"></div>
                    <div className="header-content">
                        <div className="specialist-avatar-upload">
                            <span className="avatar-preview">{formData.icon}</span>
                            <div className="avatar-options">
                                {['👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🔬'].map(icon => (
                                    <button key={icon} type="button" onClick={() => updateField('icon', icon)} className={formData.icon === icon ? 'active' : ''}>
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="header-title-area">
                            <h2>Register New Specialist</h2>
                            <p>Add a medical expert to {clinic?.name || 'your clinic'}</p>
                        </div>
                        <button className="modal-close-btn" onClick={onClose}>✕</button>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="progress-steps">
                        {steps.map(step => (
                            <div key={step.num} className={`step-item ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {currentStep > step.num ? '✓' : step.num}
                                </div>
                                <span className="step-label">{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="specialist-modal-body">
                    {/* Step 1: Personal Info */}
                    {currentStep === 1 && (
                        <div className="form-step animate-fade">
                            <div className="step-header">
                                <span className="step-icon">👤</span>
                                <div>
                                    <h3>Personal Information</h3>
                                    <p>Basic details about the specialist</p>
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input type="text" placeholder="Dr. First Name" value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select value={formData.gender} onChange={e => updateField('gender', e.target.value)}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" value={formData.dob} onChange={e => updateField('dob', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>WhatsApp Number</label>
                                    <input type="tel" placeholder="+91 98765 43210" value={formData.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="doctor@clinic.com" value={formData.email} onChange={e => updateField('email', e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <textarea placeholder="Full clinic or residential address" value={formData.address} onChange={e => updateField('address', e.target.value)} rows={2} />
                            </div>

                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" placeholder="Mumbai" value={formData.city} onChange={e => updateField('city', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input type="text" placeholder="Maharashtra" value={formData.state} onChange={e => updateField('state', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Pincode</label>
                                    <input type="text" placeholder="400001" value={formData.pincode} onChange={e => updateField('pincode', e.target.value)} />
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="form-group">
                                <label>Languages Spoken</label>
                                <div className="chip-input-wrapper">
                                    <div className="chips-container">
                                        {formData.languages.map((lang, idx) => (
                                            <span key={idx} className="chip">
                                                {lang}
                                                <button type="button" onClick={() => removeArrayItem('languages', idx)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="input-with-addon">
                                        <input type="text" placeholder="Add language" value={newLanguage} onChange={e => setNewLanguage(e.target.value)} onKeyPress={e => e.key === 'Enter' && (addArrayItem('languages', newLanguage, setNewLanguage), e.preventDefault())} />
                                        <button type="button" className="addon-btn" onClick={() => addArrayItem('languages', newLanguage, setNewLanguage)}>Add</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Professional Info */}
                    {currentStep === 2 && (
                        <div className="form-step animate-fade">
                            <div className="step-header">
                                <span className="step-icon">💼</span>
                                <div>
                                    <h3>Professional Details</h3>
                                    <p>Specialization and experience</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Specialization *</label>
                                <select value={formData.specialty} onChange={e => updateField('specialty', e.target.value)}>
                                    <option value="">Select Specialty</option>
                                    {SPECIALTIES.map(spec => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Years of Experience *</label>
                                    <input type="number" placeholder="10" value={formData.experience} onChange={e => updateField('experience', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Consultation Fee (₹) *</label>
                                    <input type="number" placeholder="500" value={formData.fee} onChange={e => updateField('fee', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Professional Bio</label>
                                <textarea placeholder="Brief description about the doctor's expertise, approach to patient care..." value={formData.bio} onChange={e => updateField('bio', e.target.value)} rows={4} />
                            </div>

                            <div className="form-group">
                                <label>Qualifications / Degrees</label>
                                <div className="chip-input-wrapper">
                                    <div className="chips-container">
                                        {formData.qualifications.map((qual, idx) => (
                                            <span key={idx} className="chip">
                                                {qual}
                                                <button type="button" onClick={() => removeArrayItem('qualifications', idx)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="input-with-addon">
                                        <input type="text" placeholder="e.g. MBBS, MD, DM" value={newQualification} onChange={e => setNewQualification(e.target.value)} onKeyPress={e => e.key === 'Enter' && (addArrayItem('qualifications', newQualification, setNewQualification), e.preventDefault())} />
                                        <button type="button" className="addon-btn" onClick={() => addArrayItem('qualifications', newQualification, setNewQualification)}>Add</button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Medical College</label>
                                    <input type="text" placeholder="College/University Name" value={formData.college} onChange={e => updateField('college', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Passing Year</label>
                                    <input type="number" placeholder="2015" value={formData.passingYear} onChange={e => updateField('passingYear', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Achievements / Awards</label>
                                <div className="chip-input-wrapper">
                                    <div className="chips-container">
                                        {formData.achievements.map((ach, idx) => (
                                            <span key={idx} className="chip achievement">
                                                🏆 {ach}
                                                <button type="button" onClick={() => removeArrayItem('achievements', idx)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="input-with-addon">
                                        <input type="text" placeholder="Add achievement or award" value={newAchievement} onChange={e => setNewAchievement(e.target.value)} onKeyPress={e => e.key === 'Enter' && (addArrayItem('achievements', newAchievement, setNewAchievement), e.preventDefault())} />
                                        <button type="button" className="addon-btn" onClick={() => addArrayItem('achievements', newAchievement, setNewAchievement)}>Add</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Schedule */}
                    {currentStep === 3 && (
                        <div className="form-step animate-fade">
                            <div className="step-header">
                                <span className="step-icon">🕐</span>
                                <div>
                                    <h3>Schedule Configuration</h3>
                                    <p>Set up morning and evening sessions</p>
                                </div>
                            </div>

                            {/* Morning Session */}
                            <div className="schedule-card">
                                <div className="schedule-header">
                                    <div className="schedule-toggle">
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={formData.schedule.morning.active} onChange={e => updateSchedule('morning', 'active', e.target.checked)} />
                                            <span className="slider"></span>
                                        </label>
                                        <span className="schedule-title">🌅 Morning Session</span>
                                    </div>
                                    {formData.schedule.morning.active && <span className="active-badge">Active</span>}
                                </div>
                                {formData.schedule.morning.active && (
                                    <div className="schedule-fields">
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>Start Time</label>
                                                <input type="time" value={formData.schedule.morning.start} onChange={e => updateSchedule('morning', 'start', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>End Time</label>
                                                <input type="time" value={formData.schedule.morning.end} onChange={e => updateSchedule('morning', 'end', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>Total Tokens</label>
                                                <input type="number" value={formData.schedule.morning.totalTokens} onChange={e => updateSchedule('morning', 'totalTokens', parseInt(e.target.value))} />
                                            </div>
                                            <div className="form-group">
                                                <label>Token Duration (min)</label>
                                                <input type="number" value={formData.schedule.morning.tokenDuration} onChange={e => updateSchedule('morning', 'tokenDuration', parseInt(e.target.value))} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Evening Session */}
                            <div className="schedule-card">
                                <div className="schedule-header">
                                    <div className="schedule-toggle">
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={formData.schedule.evening.active} onChange={e => updateSchedule('evening', 'active', e.target.checked)} />
                                            <span className="slider"></span>
                                        </label>
                                        <span className="schedule-title">🌙 Evening Session</span>
                                    </div>
                                    {formData.schedule.evening.active && <span className="active-badge">Active</span>}
                                </div>
                                {formData.schedule.evening.active && (
                                    <div className="schedule-fields">
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>Start Time</label>
                                                <input type="time" value={formData.schedule.evening.start} onChange={e => updateSchedule('evening', 'start', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>End Time</label>
                                                <input type="time" value={formData.schedule.evening.end} onChange={e => updateSchedule('evening', 'end', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>Total Tokens</label>
                                                <input type="number" value={formData.schedule.evening.totalTokens} onChange={e => updateSchedule('evening', 'totalTokens', parseInt(e.target.value))} />
                                            </div>
                                            <div className="form-group">
                                                <label>Token Duration (min)</label>
                                                <input type="number" value={formData.schedule.evening.tokenDuration} onChange={e => updateSchedule('evening', 'tokenDuration', parseInt(e.target.value))} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="schedule-summary">
                                <h4>📊 Schedule Summary</h4>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="summary-label">Morning</span>
                                        <span className="summary-value">
                                            {formData.schedule.morning.active 
                                                ? `${formData.schedule.morning.start} - ${formData.schedule.morning.end}` 
                                                : 'Off'}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Evening</span>
                                        <span className="summary-value">
                                            {formData.schedule.evening.active 
                                                ? `${formData.schedule.evening.start} - ${formData.schedule.evening.end}` 
                                                : 'Off'}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Total/Day</span>
                                        <span className="summary-value">
                                            {formData.schedule.morning.totalTokens + (formData.schedule.morning.active ? 0 : 0) + 
                                             formData.schedule.evening.totalTokens + (formData.schedule.evening.active ? 0 : 0)} tokens
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Documents */}
                    {currentStep === 4 && (
                        <div className="form-step animate-fade">
                            <div className="step-header">
                                <span className="step-icon">📄</span>
                                <div>
                                    <h3>Documents & Verification</h3>
                                    <p>Identity and registration details</p>
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Medical Registration No. *</label>
                                    <input type="text" placeholder="MCI-2020-XXXXX" value={formData.regNo} onChange={e => updateField('regNo', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Aadhaar Card Number</label>
                                    <input type="text" placeholder="XXXX XXXX XXXX" value={formData.aadhaar} onChange={e => updateField('aadhaar', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>PAN Card Number</label>
                                <input type="text" placeholder="ABCDE1234F" value={formData.pan} onChange={e => updateField('pan', e.target.value)} />
                            </div>

                            <div className="verification-notice">
                                <span className="notice-icon">ℹ️</span>
                                <div>
                                    <strong>Verification Note</strong>
                                    <p>All documents are verified manually by our admin team. Please ensure all details are accurate.</p>
                                </div>
                            </div>

                            <div className="status-section">
                                <h4>🔧 Status Settings</h4>
                                <div className="status-options">
                                    <label className={`status-option ${formData.status === 'active' ? 'active' : ''}`}>
                                        <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={e => updateField('status', e.target.value)} />
                                        <span className="status-content">
                                            <span className="status-icon">✅</span>
                                            <span>Active</span>
                                        </span>
                                    </label>
                                    <label className={`status-option ${formData.status === 'inactive' ? 'active' : ''}`}>
                                        <input type="radio" name="status" value="inactive" checked={formData.status === 'inactive'} onChange={e => updateField('status', e.target.value)} />
                                        <span className="status-content">
                                            <span className="status-icon">⏸️</span>
                                            <span>Inactive</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="specialist-modal-footer">
                    {currentStep > 1 ? (
                        <button type="button" className="btn-back" onClick={() => setCurrentStep(prev => prev - 1)}>
                            ← Back
                        </button>
                    ) : (
                        <button type="button" className="btn-back" onClick={onClose}>
                            Cancel
                        </button>
                    )}
                    
                    <div className="step-indicator">
                        Step {currentStep} of {totalSteps}
                    </div>

                    {currentStep < totalSteps ? (
                        <button type="button" className="btn-next" onClick={() => setCurrentStep(prev => prev + 1)}>
                            Continue →
                        </button>
                    ) : (
                        <button type="button" className="btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Registering...' : '✓ Register Specialist'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SpecialistRegistrationModal
