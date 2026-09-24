import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import { ActivityIndicator } from './primitives';
import { hexToRgba } from '../theme/themes';

// variant: primary | outline | ghost | danger
// size: md (default) | sm
export default function Button({ title, onPress, onClick, variant = 'primary', size = 'md', icon, loading = false, disabled = false, style, textStyle, type = 'button', accessibilityLabel }) {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const fg = isPrimary || isDanger ? theme.colors.onAccent : theme.colors.accent;

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    minHeight: size === 'sm' ? 40 : 48,
    padding: size === 'sm' ? '8px 14px' : '12px 20px',
    borderRadius: elevated ? theme.radius.md : theme.radius.pill,
    border: elevated ? 'none' : `${theme.border.width}px solid ${theme.colors.text}`,
    cursor: disabled || loading ? 'default' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    fontFamily: theme.typography.button.fontFamily,
    fontSize: size === 'sm' ? 13 : theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    letterSpacing: theme.typography.button.letterSpacing,
    textTransform: theme.typography.button.textTransform,
    whiteSpace: 'nowrap',
  };

  let variantStyle = {};
  if (elevated && isPrimary) {
    variantStyle = {
      background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
      border: 'none',
      boxShadow: theme.shadow.glow,
    };
  } else if (isPrimary) {
    variantStyle = { backgroundColor: theme.colors.accent };
  } else if (variant === 'outline') {
    variantStyle = elevated
      ? { backgroundColor: 'transparent', border: `1px solid ${theme.colors.border}` }
      : { backgroundColor: 'transparent', border: `${theme.border.width}px solid ${theme.colors.text}` };
  } else if (variant === 'ghost') {
    variantStyle = elevated
      ? { backgroundColor: theme.colors.accentSoft, border: 'none' }
      : { backgroundColor: theme.colors.accentSoft, border: 'none' };
  } else if (isDanger) {
    variantStyle = { backgroundColor: theme.colors.danger, border: 'none' };
  }

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : (onPress || onClick)}
      disabled={disabled || loading}
      aria-label={accessibilityLabel || title}
      aria-busy={loading}
      className="gk-touchable"
      style={{ ...base, ...variantStyle, ...style }}
    >
      {loading ? (
        <ActivityIndicator size={16} color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} color={fg} /> : null}
          <span style={{ color: fg, ...textStyle }}>{title}</span>
        </>
      )}
    </button>
  );
}
