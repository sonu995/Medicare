import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ClinicPortal.css';

function ClinicPortal({ clinics, onAddDoctor }) {
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', 
        profilePhoto: '', 
        gender: '', 
        dob: '', 
        phone: '', 
        email: '', 
        address: '', 
        cityState: '', 
        languages: '', 
        experience: '', 
        fee: '', 
        bio: '', 
        degree: '', 
        specialty: '', 
        college: '', 
        passingYear: '', 
        regCertificate: '', 
        aadhaar: '', 
        pan: '',
        clinicId: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Find clinic name for the selected ID
        const selectedClinic = clinics.find(c => c._id === formData.clinicId || c.id?.toString() === formData.clinicId);
        
        const doctorData = {
            ...formData,
            clinicName: selectedClinic?.name || '',
            location: selectedClinic?.location || '',
            qualifications: formData.degree ? [formData.degree] : [],
            education: formData.college,
            icon: formData.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️',
            rating: "New",
            available: "Today",
            languages: formData.languages ? formData.languages.split(',').map(l => l.trim()) : ['English'],
            schedule: {
                morning: { start: "09:00", end: "13:00", totalTokens: 20, tokenDuration: 10, active: true },
                evening: { start: "17:00", end: "21:00", totalTokens: 15, tokenDuration: 10, active: true }
            }
        };

        onAddDoctor(doctorData);
        setShowRegisterModal(false);
        setFormData({
            name: '', profilePhoto: '', gender: '', dob: '', phone: '', email: '', 
            address: '', cityState: '', languages: '', experience: '', fee: '', 
            bio: '', degree: '', specialty: '', college: '', passingYear: '', 
            regCertificate: '', aadhaar: '', pan: '', clinicId: ''
        });
        alert('Doctor Registered Successfully!');
    };

    return (
        <div className="clinic-portal-page">
            <header className="portal-header">
                <div className="header-top">
                    <h1>Clinic Administration Portal</h1>
                </div>
                <p>Select your clinic to manage appointments, doctors, and live queues.</p>
            </header>

            <div className="portal-grid">
                {clinics.map(clinic => (
                    <div key={clinic._id || clinic.id} className="portal-card" style={{ borderTop: `4px solid ${clinic.themeColor}` }}>
                        <div className="portal-card-icon" style={{ color: clinic.themeColor }}>{clinic.icon}</div>
                        <div className="portal-card-content">
                            <h3>{clinic.name}</h3>
                            <p className="portal-location">📍 {clinic.location}</p>
                            <div className="portal-stats">
                                <span>👨‍⚕️ {clinic.doctors?.length || 0} Doctors</span>
                                <span>⭐ {clinic.rating}</span>
                            </div>
                            <Link 
                                to={`/clinic-admin/${clinic._id || clinic.id}`} 
                                className="enter-btn"
                                style={{ background: clinic.themeColor }}
                            >
                                Enter Admin Panel →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {showRegisterModal && (
                <div className="portal-modal-overlay">
                    <div className="portal-modal-content">
                        <div className="portal-modal-header">
                            <h2>Create Doctor Profile</h2>
                            <button className="close-btn" onClick={() => setShowRegisterModal(false)}>✕</button>
                        </div>
                        <form className="register-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-section">
                                <h3>Personal & Contact Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Dr. John Doe" />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender *</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Mobile Number *</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email ID</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="doctor@example.com" />
                                    </div>
                                    <div className="form-group">
                                        <label>City / State</label>
                                        <input type="text" name="cityState" value={formData.cityState} onChange={handleChange} placeholder="Mumbai, MH" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Full Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Clinic or Residential Address"></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Professional Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Specialization *</label>
                                        <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} required placeholder="e.g. Cardiologist" />
                                    </div>
                                    <div className="form-group">
                                        <label>Experience (Years)</label>
                                        <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 10" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Consultation Fee (₹)</label>
                                        <input type="number" name="fee" value={formData.fee} onChange={handleChange} placeholder="e.g. 500" />
                                    </div>
                                    <div className="form-group">
                                        <label>Languages Spoken</label>
                                        <input type="text" name="languages" value={formData.languages} onChange={handleChange} placeholder="Hindi, English, Marathi" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Assign to Clinic *</label>
                                    <select name="clinicId" value={formData.clinicId} onChange={handleChange} required>
                                        <option value="">Select Clinic</option>
                                        {clinics.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bio / About doctor</label>
                                    <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Brief description of the doctor's expertise..."></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Academic & Verification</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Medical Degree</label>
                                        <input type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g. MBBS, MD" />
                                    </div>
                                    <div className="form-group">
                                        <label>Medical College Name</label>
                                        <input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="Grant Medical College" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Passing Year</label>
                                        <input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} placeholder="2010" />
                                    </div>
                                    <div className="form-group">
                                        <label>Profile Photo URL</label>
                                        <input type="text" name="profilePhoto" value={formData.profilePhoto} onChange={handleChange} placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Medical Reg. Certificate #</label>
                                        <input type="text" name="regCertificate" value={formData.regCertificate} onChange={handleChange} placeholder="Reg Index Number" />
                                    </div>
                                    <div className="form-group">
                                        <label>Aadhaar Card Number</label>
                                        <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} placeholder="XXXX XXXX XXXX" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>PAN Card Number</label>
                                    <input type="text" name="pan" value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                                <button type="button" className="submit-btn" onClick={handleSubmit}>Register Doctor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="portal-footer">
                <p>Need help? Contact system support at support@medicareplus.com</p>
                <Link to="/admin" className="master-admin-link">Go to Master Admin Dashboard</Link>
            </div>
        </div>
    );
}

export default ClinicPortal;
