import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const applyTheme = useCallback((isDark) => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        applyTheme(data.user.settings?.darkMode || false);
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, [applyTheme]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    applyTheme(data.user.settings?.darkMode || false);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    applyTheme(false);
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    applyTheme(newMode);
    if (user) {
      try { await api.patch('/user/settings', { darkMode: newMode }); } catch {}
      setUser(prev => ({ ...prev, settings: { ...prev.settings, darkMode: newMode } }));
    }
  };

  const updateStats = (newStats) => {
    setUser(prev => ({ ...prev, stats: { ...prev.stats, ...newStats } }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, darkMode, login, register, logout, toggleDarkMode, updateStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
