import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import logo from '../assets/icon.png';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home-outline', iconActive: 'home', end: true },
  { to: '/explore', label: 'Explore', icon: 'compass-outline', iconActive: 'compass' },
  { to: '/realms', label: 'Realms', icon: 'earth-outline', iconActive: 'earth' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'trophy-outline', iconActive: 'trophy' },
];

// Desktop replacement for the RN app's floating bottom tab bar: a fixed
// left sidebar with the same five destinations, plus the account/admin
// area at the bottom. Everything to its right is the routed page (Screen).
export default function AppShell({ children }) {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const elevated = theme.uiStyle === 'elevated';
  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw', backgroundColor: theme.colors.bg, overflow: 'hidden' }}>
      <nav
        style={{
          width: theme.layout.sidebarWidth, flexShrink: 0, display: 'flex', flexDirection: 'column',
          backgroundColor: theme.colors.surface, borderRight: `${theme.border.width}px solid ${elevated ? theme.colors.border : theme.colors.text}`,
          padding: '20px 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 22px' }}>
          <img
            src={logo}
            alt="GathaLok"
            style={{ width: 34, height: 34, borderRadius: theme.radius.pill, flexShrink: 0, objectFit: 'cover' }}
          />
          <span style={{ ...theme.typography.h3, fontSize: 18 }}>GathaLok</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div
                  className="gk-touchable"
                  style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: theme.radius.md, cursor: 'pointer',
                    backgroundColor: isActive ? theme.colors.accentSoft : 'transparent',
                  }}
                >
                  <Icon name={isActive ? item.iconActive : item.icon} size={20} color={isActive ? theme.colors.accent : theme.colors.textMuted} />
                  <span style={{ ...theme.typography.body, fontWeight: isActive ? 700 : 500, color: isActive ? theme.colors.text : theme.colors.textMuted }}>
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}

          {isAdmin ? (
            <NavLink to="/admin" style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div
                  className="gk-touchable"
                  style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: theme.radius.md, cursor: 'pointer',
                    backgroundColor: isActive ? theme.colors.accentSoft : 'transparent',
                  }}
                >
                  <Icon name={isActive ? 'shield-checkmark' : 'shield-checkmark-outline'} size={20} color={isActive ? theme.colors.accent : theme.colors.textMuted} />
                  <span style={{ ...theme.typography.body, fontWeight: isActive ? 700 : 500, color: isActive ? theme.colors.text : theme.colors.textMuted }}>
                    Admin
                  </span>
                </div>
              )}
            </NavLink>
          ) : null}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: 12 }}>
          {user ? (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="gk-touchable"
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: '8px 10px', borderRadius: theme.radius.md, textAlign: 'left',
              }}
            >
              <span style={{
                width: 34, height: 34, borderRadius: theme.radius.pill, overflow: 'hidden', flexShrink: 0,
                backgroundColor: theme.colors.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Icon name="person" size={18} color={theme.colors.accent} />
                )}
              </span>
              <span style={{ minWidth: 0 }}>
                <div style={{ ...theme.typography.body, fontWeight: 700 }} title={user.name}>
                  {(user.name || user.username || '').length > 16 ? `${(user.name || user.username).slice(0, 16)}…` : (user.name || user.username)}
                </div>
                <div style={theme.typography.caption}>@{user.username}</div>
              </span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 4px 0' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="gk-touchable"
                style={{
                  padding: '10px 14px', borderRadius: theme.radius.pill, cursor: 'pointer', textAlign: 'center',
                  backgroundColor: theme.colors.accent, border: 'none', ...theme.typography.button, color: theme.colors.onAccent,
                }}
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
