import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import { haptic } from '../utils/desktop';

// Modal sheet of actions, centered on desktop instead of docked to the
// bottom edge (a bottom sheet is a mobile-gesture idiom). Same props/shape
// as the RN version: actions={[{ label, icon, onPress, destructive?, subtitle? }]}
export default function ActionSheet({ visible, title, subtitle, actions = [], onClose, cancelLabel = 'Cancel', children }) {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
      />
      <div
        style={{
          position: 'relative', width: 'min(440px, 92vw)', maxHeight: '80vh', overflowY: 'auto',
          backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg,
          border: `${elevated ? 1 : theme.border.width}px solid ${elevated ? theme.colors.border : theme.colors.text}`,
          padding: '18px 20px', boxShadow: theme.shadow.card,
        }}
      >
        {title ? <div style={{ ...theme.typography.h2, marginBottom: subtitle ? 2 : 8 }}>{title}</div> : null}
        {subtitle ? <div style={{ ...theme.typography.bodyMuted, marginBottom: 10 }}>{subtitle}</div> : null}
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => { haptic.select(); onClose && onClose(); a.onPress && a.onPress(); }}
            aria-label={a.label}
            className="gk-touchable"
            style={{
              display: 'flex', flexDirection: 'row', alignItems: 'center', minHeight: 52, width: '100%',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit',
            }}
          >
            <span style={{
              width: 38, height: 38, borderRadius: theme.radius.sm,
              backgroundColor: a.destructive ? theme.colors.dangerSoft : theme.colors.accentSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0,
            }}>
              <Icon name={a.icon || 'ellipse-outline'} size={20} color={a.destructive ? theme.colors.danger : theme.colors.accent} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...theme.typography.body, fontWeight: 600, color: a.destructive ? theme.colors.danger : theme.colors.text }}>{a.label}</div>
              {a.subtitle ? <div style={theme.typography.caption}>{a.subtitle}</div> : null}
            </span>
          </button>
        ))}
        {children}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            ...theme.typography.button, color: theme.colors.textMuted,
          }}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
