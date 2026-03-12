import React from 'react';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import Login from './pages/Login';
import Sales from './pages/Sales';
import SaleStatus from './pages/SaleStatus';
import Profile from './pages/Profile';
import './styles/App.css';

const App: React.FC = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = React.useState<'sales-list' | 'sale-status' | 'profile'>('sales-list');

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>29 Jewellery</h1>
          <p className="user-name">{user?.name}</p>
          <p className="user-role">{user?.position?.name || user?.role?.display_name || 'Employee'}</p>
        </div>

        <div className="sidebar-menu">
          <button
            className={`menu-item ${currentPage === 'sales-list' ? 'active' : ''}`}
            onClick={() => setCurrentPage('sales-list')}
          >
            <span className="icon">�</span>
            <span>Sales List</span>
          </button>
          <button
            className={`menu-item ${currentPage === 'sale-status' ? 'active' : ''}`}
            onClick={() => setCurrentPage('sale-status')}
          >
            <span className="icon">📊</span>
            <span>Sale Status</span>
          </button>
          <button
            className={`menu-item ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentPage('profile')}
          >
            <span className="icon">👤</span>
            <span>{t('nav.profile')}</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <span className="icon">🚪</span>
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'sales-list' && <Sales />}
        {currentPage === 'sale-status' && <SaleStatus />}
        {currentPage === 'profile' && <Profile />}
      </main>
    </div>
  );
};

export default App;
