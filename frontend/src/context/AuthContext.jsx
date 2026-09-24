import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      localStorage.removeItem('skylounge_guest_orders');
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        showToast(res.data.message || 'Logged in successfully', 'success');
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      localStorage.removeItem('skylounge_guest_orders');
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        setUser(res.data.user);
        showToast('Registration successful! Welcome to Sky Lounge.', 'success');
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('skylounge_guest_orders');
      setUser(null);
      showToast('Logged out successfully', 'info');
    } catch (error) {
      localStorage.removeItem('skylounge_guest_orders');
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      if (res.data.success) {
        setUser(res.data.user);
        showToast(res.data.message, 'success');
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Update failed.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
