import { useAuth } from './context/AuthContext'
import PrescriptionView from './PrescriptionView'
import './MyPrescriptions.css'

function MyPrescriptions() {
    const { user, loading } = useAuth()
    
    const patientPhone = user?.phone || user?.phoneNumber || ''
    const patientName = user?.name || ''

    if (loading) {
        return (
            <div className="mp-page">
                <div className="mp-container">
                    <div className="mp-hero">
                        <div className="mp-hero-bg">
                            <div className="mp-blob mp-blob-1"></div>
                            <div className="mp-blob mp-blob-2"></div>
                        </div>
                        <div className="mp-hero-content">
                            <div className="mp-icon-large">💊</div>
                            <h1>My Prescriptions</h1>
                            <p>Loading your health records...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mp-page">
            <div className="mp-container">
                <div className="mp-hero">
                    <div className="mp-hero-bg">
                        <div className="mp-blob mp-blob-1"></div>
                        <div className="mp-blob mp-blob-2"></div>
                        <div className="mp-blob mp-blob-3"></div>
                    </div>
                    <div className="mp-hero-content">
                        <div className="mp-badge">
                            <span className="mp-badge-dot"></span>
                            <span>Your Health Records</span>
                        </div>
                        <h1>My Prescriptions</h1>
                        <p>View, download, and manage your medical prescriptions</p>
                        
                        {patientName && (
                            <div className="mp-user-info">
                                <div className="mp-user-avatar">
                                    {patientName.charAt(0).toUpperCase()}
                                </div>
                                <div className="mp-user-details">
                                    <span className="mp-user-name">{patientName}</span>
                                    {patientPhone && <span className="mp-user-phone">📞 {patientPhone}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="mp-content">
                    <PrescriptionView 
                        patientPhone={patientPhone}
                    />
                </div>
            </div>
        </div>
    )
}

export default MyPrescriptions