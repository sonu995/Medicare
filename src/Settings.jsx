import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Settings.css';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: true,
      push: true,
      appointmentReminder: true,
      statusUpdates: true,
      promotional: false
    },
    privacy: {
      showProfile: true,
      showBookings: true,
      shareData: false
    },
    language: 'en',
    darkMode: false
  });

  const toggleSetting = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>⚙️ Settings</h1>
          <p>Manage your account and preferences</p>
        </div>

        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
          <button 
            className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            🔒 Privacy
          </button>
          <button 
            className={`settings-tab ${activeTab === 'app' ? 'active' : ''}`}
            onClick={() => setActiveTab('app')}
          >
            📱 App
          </button>
          <button 
            className={`settings-tab ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            💬 Support
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              
              <Link to="/profile" className="settings-card">
                <div className="card-icon">👤</div>
                <div className="card-content">
                  <h3>Edit Profile</h3>
                  <p>Update your personal information</p>
                </div>
                <span className="arrow">→</span>
              </Link>

              <div className="settings-card">
                <div className="card-icon">🔑</div>
                <div className="card-content">
                  <h3>Change Password</h3>
                  <p>Update your account password</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">📧</div>
                <div className="card-content">
                  <h3>Email Address</h3>
                  <p>Update your email address</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">📱</div>
                <div className="card-content">
                  <h3>Phone Number</h3>
                  <p>Update your phone number</p>
                </div>
                <span className="arrow">→</span>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              
              <div className="settings-card toggle-card">
                <div className="card-icon">📧</div>
                <div className="card-content">
                  <h3>Email Notifications</h3>
                  <p>Receive updates via email</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.email}
                    onChange={() => toggleSetting('notifications', 'email')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-card toggle-card">
                <div className="card-icon">💬</div>
                <div className="card-content">
                  <h3>SMS Notifications</h3>
                  <p>Receive updates via SMS</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.sms}
                    onChange={() => toggleSetting('notifications', 'sms')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-card toggle-card">
                <div className="card-icon">🔔</div>
                <div className="card-content">
                  <h3>Push Notifications</h3>
                  <p>Receive push notifications</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.push}
                    onChange={() => toggleSetting('notifications', 'push')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-card toggle-card">
                <div className="card-icon">📅</div>
                <div className="card-content">
                  <h3>Appointment Reminders</h3>
                  <p>Get reminded before appointments</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.appointmentReminder}
                    onChange={() => toggleSetting('notifications', 'appointmentReminder')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-card toggle-card">
                <div className="card-icon">🔄</div>
                <div className="card-content">
                  <h3>Status Updates</h3>
                  <p>Get notified about booking status changes</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.statusUpdates}
                    onChange={() => toggleSetting('notifications', 'statusUpdates')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-card toggle-card">
                <div className="card-icon">🎁</div>
                <div className="card-content">
                  <h3>Promotional Offers</h3>
                  <p>Receive deals and special offers</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.promotional}
                    onChange={() => toggleSetting('notifications', 'promotional')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Security</h2>
              
              <div className="settings-card toggle-card">
                <div className="card-icon">👁️</div>
                <div className="card-content">
                  <h3>Show Profile</h3>
                  <p>Let others see your profile</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.privacy.showProfile}
                    onChange={() => toggleSetting('privacy', 'showProfile')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-card toggle-card">
                <div className="card-icon">📋</div>
                <div className="card-content">
                  <h3>Show Bookings</h3>
                  <p>Display your bookings publicly</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.privacy.showBookings}
                    onChange={() => toggleSetting('privacy', 'showBookings')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-card">
                <div className="card-icon">🔐</div>
                <div className="card-content">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add extra security to your account</p>
                </div>
                <span className="badge">Coming Soon</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">📱</div>
                <div className="card-content">
                  <h3>Login Devices</h3>
                  <p>Manage your logged in devices</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card danger">
                <div className="card-icon">🗑️</div>
                <div className="card-content">
                  <h3>Delete Account</h3>
                  <p>Permanently delete your account and data</p>
                </div>
                <span className="arrow">→</span>
              </div>
            </div>
          )}

          {activeTab === 'app' && (
            <div className="settings-section">
              <h2>App Settings</h2>
              
              <div className="settings-card">
                <div className="card-icon">🌐</div>
                <div className="card-content">
                  <h3>Language</h3>
                  <p>Select your preferred language</p>
                </div>
                <select className="settings-select">
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="mr">मराठी</option>
                </select>
              </div>

              <div className="settings-card toggle-card">
                <div className="card-icon">🌙</div>
                <div className="card-content">
                  <h3>Dark Mode</h3>
                  <p>Switch to dark theme</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.darkMode}
                    onChange={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-card">
                <div className="card-icon">📍</div>
                <div className="card-content">
                  <h3>Location Services</h3>
                  <p>Allow access to your location</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">💾</div>
                <div className="card-content">
                  <h3>Clear Cache</h3>
                  <p>Free up storage space</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">📲</div>
                <div className="card-content">
                  <h3>App Version</h3>
                  <p>Version 1.0.0</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="settings-section">
              <h2>Help & Support</h2>
              
              <div className="settings-card">
                <div className="card-icon">❓</div>
                <div className="card-content">
                  <h3>FAQ</h3>
                  <p>Frequently asked questions</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">📧</div>
                <div className="card-content">
                  <h3>Contact Us</h3>
                  <p>support@medicareplus.com</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">📞</div>
                <div className="card-content">
                  <h3>Call Support</h3>
                  <p>1800-XXX-XXXX (Toll Free)</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">💬</div>
                <div className="card-content">
                  <h3>Live Chat</h3>
                  <p>Chat with our support team</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">📝</div>
                <div className="card-content">
                  <h3>Report a Problem</h3>
                  <p>Submit a bug report or feedback</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">⭐</div>
                <div className="card-content">
                  <h3>Rate Us</h3>
                  <p>Share your feedback on the app</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">📜</div>
                <div className="card-content">
                  <h3>Terms of Service</h3>
                  <p>Read our terms and conditions</p>
                </div>
                <span className="arrow">→</span>
              </div>

              <div className="settings-card">
                <div className="card-icon">🔒</div>
                <div className="card-content">
                  <h3>Privacy Policy</h3>
                  <p>Read our privacy policy</p>
                </div>
                <span className="arrow">→</span>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <p>Medicare+ v1.0.0</p>
          <p>Made with ❤️ in India</p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
