import React from 'react';
import SpecialistRegistrationModal from './SpecialistRegistrationModal';

const DoctorManager = ({ doctors, onEditPanel, onAddDoctor, clinic }) => {
    const [showModal, setShowModal] = React.useState(false);

    const handleSubmitSpecialist = async (specialistData) => {
        await onAddDoctor(specialistData);
        setShowModal(false);
    };

    return (
        <div className="doctor-management-view">
            <div className="view-header">
                <h2>Specialist Directory</h2>
                <button className="premium-add-btn" onClick={() => setShowModal(true)}>
                    <span>➕</span> Register Specialist
                </button>
            </div>

            {doctors.length === 0 ? (
                <div className="empty-manager-state">
                    <div className="empty-icon">👨‍⚕️</div>
                    <h3>No specialists registered yet</h3>
                    <p>Click "Register Specialist" to add medical experts to this clinic.</p>
                </div>
            ) : (
                <div className="doctor-premium-grid">
                    {doctors.map((doc, idx) => {
                        const docId = doc._id || doc.id;
                        const hasMorning = doc.schedule?.morning?.active;
                        const hasEvening = doc.schedule?.evening?.active;

                        return (
                            <div key={docId || idx} className="doctor-premium-card">
                                <div className="doc-card-header">
                                    <span className="doc-icon-large">{doc.icon || '👨‍⚕️'}</span>
                                    <div className="doc-title-group">
                                        <h4>{doc.name}</h4>
                                        <span className="doc-tag">{doc.specialty || 'General'}</span>
                                    </div>
                                </div>

                                <div className="doc-card-body">
                                    <div className="card-stat-row">
                                        <span>Experience</span>
                                        <strong>{doc.experience || 'N/A'}</strong>
                                    </div>
                                    <div className="card-stat-row">
                                        <span>Rating</span>
                                        <strong className="rating-text">
                                            ⭐ {doc.rating || '4.5'}
                                        </strong>
                                    </div>
                                    <div className="card-stat-row">
                                        <span>Fee</span>
                                        <strong>₹{doc.fee || 'N/A'}</strong>
                                    </div>
                                </div>

                                <div className="doc-card-footer">
                                    <div className="schedule-preview">
                                        <span className={hasMorning ? 'active' : ''} title="Morning">🌅</span>
                                        <span className={hasEvening ? 'active' : ''} title="Evening">🌙</span>
                                    </div>
                                    <button
                                        className="manage-panel-btn"
                                        onClick={() => onEditPanel(docId)}
                                    >
                                        Control Panel →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <SpecialistRegistrationModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                onSubmit={handleSubmitSpecialist}
                clinic={clinic}
            />
        </div>
    );
};

export default DoctorManager;
