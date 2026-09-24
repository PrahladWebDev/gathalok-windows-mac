import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { TOKEN_KEY, USER_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          api.get('/auth/me').then(({ data }) => {
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          }).catch(() => {});
        }
      } catch (err) {
        // ignore corrupt cache
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applySession = useCallback(async (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return applySession(data);
  }, [applySession]);

  const register = useCallback(async ({ name, username, email, password }) => {
    const { data } = await api.post('/auth/register', { name, username, email, password });
    return data;
  }, []);

  const verifyEmail = useCallback(async (token) => {
    const { data } = await api.get(`/auth/verify-email/${token}`);
    if (data.token) await applySession(data);
    return data;
  }, [applySession]);

  const resendVerification = useCallback(async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    if (data.token) await applySession(data);
    return data;
  }, [applySession]);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { data } = await api.put('/auth/profile', updates);
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  }, []);

  // Desktop equivalent of the RN two-step avatar upload: `file` here is a
  // real browser File object (from <input type="file">) instead of an
  // Expo ImagePicker asset — FormData accepts a File directly.
  const uploadAvatar = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('avatar', file, file.name || 'avatar.jpg');
    const { data } = await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return updateProfile({ avatar: data.data });
  }, [updateProfile]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/password', { currentPassword, newPassword });
    return data;
  }, []);

  const becomeContributor = useCallback(async () => {
    const { data } = await api.post('/auth/become-contributor');
    const next = { ...user, role: 'contributor' };
    setUser(next);
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    return data;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout, updateProfile, uploadAvatar, changePassword, becomeContributor,
      verifyEmail, resendVerification, forgotPassword, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
