import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ActivityIndicator } from './primitives';

// Route guard for pages that need a logged-in user (Bookmarks, Settings,
// Contribute, Admin, ...). Waits for AuthProvider's initial /auth/me check
// before deciding, so a refresh never flashes a login redirect for an
// already-signed-in user.
export default function RequireAuth({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <ActivityIndicator size={28} color={theme.colors.accent} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
