import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(staffId, password);
    } catch (err) {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <div className="login-card" style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        width: '400px',
        maxWidth: '90%'
      }}>
        <div className="login-header" style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: '#ff6b35',
            fontSize: '2rem',
            marginBottom: '8px'
          }}>29 Jewellery</h1>
          <h2 style={{
            color: '#1a1a1a',
            fontSize: '1.25rem',
            fontWeight: '500'
          }}>{t('login.title')}</h2>
        </div>
        <form onSubmit={handleSubmit} className="login-form" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="form-group" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <label style={{
              color: '#1a1a1a',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>{t('login.staffId')}</label>
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              required
              autoFocus
              style={{
                padding: '12px 16px',
                border: '1px solid #d0d0d0',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: '#f5f5f5',
                color: '#1a1a1a',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
          <div className="form-group" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <label style={{
              color: '#1a1a1a',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>{t('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '12px 16px',
                border: '1px solid #d0d0d0',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: '#f5f5f5',
                color: '#1a1a1a',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
          {error && <div className="error-message" style={{
            color: '#f44336',
            fontSize: '0.875rem',
            padding: '8px',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            borderRadius: '4px',
            textAlign: 'center'
          }}>{error}</div>}
          <button type="submit" className="login-button" disabled={loading} style={{
            padding: '14px',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            {loading ? 'Logging in...' : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
