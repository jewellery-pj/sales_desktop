import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import '../styles/Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>{t('nav.profile')}</h1>
        
        <div className="profile-section">
          <h2>User Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{user?.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Staff ID:</span>
              <span className="value">{user?.staff_id}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{user?.email || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Position:</span>
              <span className="value">{user?.position?.name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Department:</span>
              <span className="value">{user?.department?.name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Branch:</span>
              <span className="value">{user?.branch?.name || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Settings</h2>
          
          <div className="setting-item">
            <div className="setting-label">
              <span>Theme</span>
              <span className="setting-value">{t(`theme.${theme}`)}</span>
            </div>
            <button onClick={toggleTheme} className="btn-setting">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Language</span>
              <span className="setting-value">
                {i18n.language === 'en' ? t('language.english') : t('language.myanmar')}
              </span>
            </div>
            <div className="language-buttons">
              <button
                onClick={() => changeLanguage('en')}
                className={`btn-lang ${i18n.language === 'en' ? 'active' : ''}`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('mm')}
                className={`btn-lang ${i18n.language === 'mm' ? 'active' : ''}`}
              >
                မြန်မာ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
