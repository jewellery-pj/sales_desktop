import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  login: (staff_id: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      const lastError = localStorage.getItem('last_login_error');
      
      console.log('AuthContext: Checking stored auth data', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        hasLastError: !!lastError,
        isElectron: typeof window !== 'undefined' && !!(window as any).electronAPI
      });
      
      // Show last error if exists
      if (lastError) {
        const errorData = JSON.parse(lastError);
        console.log('🔍 Last login error found:', errorData);
        console.log('🔍 Error time:', new Date(errorData.timestamp));
        console.log('🔍 Error message:', errorData.error);
        console.log('🔍 Error status:', errorData.status);
        console.log('🔍 Error data:', errorData.data);
        console.log('🔍 Full error object:', errorData);
      }
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          console.log('AuthContext: User restored from localStorage', user);
        } catch (error) {
          console.error('AuthContext: Failed to parse user data', error);
          // Clear invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
      setLoading(false);
    };

    // For Electron app, wait a bit for localStorage to be ready
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      console.log('🔧 Electron app detected, waiting for localStorage...');
      setTimeout(initAuth, 200);
    } else {
      console.log('🌐 Web app detected, initializing immediately...');
      initAuth();
    }
  }, []);

  const login = async (staff_id: string, password: string) => {
    try {
      console.log('Attempting login with:', { staff_id, password: '***' });
      const response = await authAPI.employeeLogin({ staff_id, password });
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        // Backend returns: { success: true, data: { user: {...}, token: "..." } }
        const { token, user: userData } = response.data.data;
        
        console.log('Login successful, storing data:', { 
          hasToken: !!token, 
          userData: userData 
        });
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        
        console.log('Data stored in localStorage:', {
          token: localStorage.getItem('auth_token') ? 'present' : 'missing',
          userData: localStorage.getItem('user_data') ? 'present' : 'missing'
        });
        
        console.log('Login successful, user set:', userData);
      } else {
        console.error('Login failed:', response.data.message);
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('=== LOGIN ERROR DEBUG ===');
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Show detailed error in console
      if (error.response?.status === 401) {
        console.error('🔴 Authentication failed - Invalid credentials');
        console.error('🔴 Please check your Staff ID and Password');
      } else if (error.response?.status === 422) {
        console.error('🔴 Validation error:', error.response?.data);
      } else if (error.code === 'ECONNREFUSED') {
        console.error('🔴 Connection refused - API server may be down');
        console.error('🔴 Check if API server is running');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('🔴 Network error - Check internet connection');
      } else if (error.response?.status === 500) {
        console.error('🔴 Server error - API server issue');
      }
      
      console.error('=== END LOGIN ERROR DEBUG ===');
      
      // Store error in localStorage for debugging
      localStorage.setItem('last_login_error', JSON.stringify({
        timestamp: new Date().toISOString(),
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      }));
      
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('last_login_error');
    setUser(null);
  };

  
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
