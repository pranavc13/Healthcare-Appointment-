import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = localStorage.getItem('jc_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await authService.me();
      setUser(profile);
    } catch (err) {
      localStorage.removeItem('jc_token');
      localStorage.removeItem('jc_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = async (email, password) => {
    const { token, user: loggedInUser } = await authService.login({ email, password });
    localStorage.setItem('jc_token', token);
    localStorage.setItem('jc_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (data) => {
    const { token, user: newUser } = await authService.register(data);
    localStorage.setItem('jc_token', token);
    localStorage.setItem('jc_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('jc_token');
    localStorage.removeItem('jc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, currentUser: user, role: user?.role ?? null, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
