import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

export default function Chip({ label, active, onPress, onClick, icon, style, textStyle, small = false }) {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';
  const color = active ? theme.colors.onAccent : theme.colors.textMuted;
  return (
    <button
      type="button"
      onClick={onPress || onClick}
      aria-pressed={!!active}
      aria-label={label}
      className="gk-touchable"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        minHeight: small ? 36 : 44,
        padding: small ? '4px 12px' : '8px 14px',
        borderRadius: theme.radius.pill,
        backgroundColor: active ? theme.colors.accent : theme.colors.surface,
        border: `${elevated ? 1 : theme.border.width}px solid ${elevated ? theme.colors.border : theme.colors.text}`,
        marginRight: 8,
        cursor: 'pointer',
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        color,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={14} color={color} /> : null}
      <span style={textStyle}>{label}</span>
    </button>
  );
}
