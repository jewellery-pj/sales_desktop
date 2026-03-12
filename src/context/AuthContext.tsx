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
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (staff_id: string, password: string) => {
    try {
      const response = await authAPI.employeeLogin({ staff_id, password });
      console.log('Login response:', response.data);
      
      // Backend returns: { success: true, data: { user: {...}, token: "..." } }
      const { token, user: userData } = response.data.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
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
