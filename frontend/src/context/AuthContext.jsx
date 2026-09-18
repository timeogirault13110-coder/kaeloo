import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORAGE_TOKEN = 'novashop_token_v1';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN));
  const [loading, setLoading] = useState(true);

  const authHeader = useCallback(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const fetchMe = useCallback(async (t) => {
    try {
      const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      setUser(res.data);
    } catch (e) {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_TOKEN);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (token) {
        await fetchMe(token);
      }
      setLoading(false);
    })();
  }, [token, fetchMe]);

  const register = async (email, password, name) => {
    const res = await axios.post(`${API}/auth/register`, { email, password, name });
    localStorage.setItem(STORAGE_TOKEN, res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem(STORAGE_TOKEN, res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const loginWithGoogleSession = async (sessionId) => {
    const res = await axios.post(`${API}/auth/google/session`, { session_id: sessionId });
    localStorage.setItem(STORAGE_TOKEN, res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const startGoogleLogin = (returnPath = '/account') => {
    const redirectUrl = window.location.origin + returnPath;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, authHeader, API, startGoogleLogin, loginWithGoogleSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
