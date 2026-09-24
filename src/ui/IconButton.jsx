import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

// 44x44 icon-only button. variant: 'plain' | 'soft' (tinted disc) | 'filled' (accent disc).
export default function IconButton({ name, label, onPress, onClick, size = 22, color, variant = 'plain', disabled = false, style }) {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';
  const iconColor = color || (variant === 'filled' ? theme.colors.onAccent : theme.colors.accent);

  let variantStyle = {};
  if (variant === 'soft') {
    variantStyle = { backgroundColor: theme.colors.accentSoft, border: `${elevated ? 1 : theme.border.width}px solid ${elevated ? theme.colors.border : theme.colors.text}` };
  } else if (variant === 'filled') {
    variantStyle = { backgroundColor: theme.colors.accent, border: elevated ? 'none' : `${theme.border.width}px solid ${theme.colors.text}`, boxShadow: elevated ? theme.shadow.glow : undefined };
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : (onPress || onClick)}
      disabled={disabled}
      aria-label={label}
      className="gk-touchable"
      style={{
        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: theme.radius.pill, border: 'none', background: 'none', cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1, flexShrink: 0,
        ...variantStyle, ...style,
      }}
    >
      <Icon name={name} size={size} color={iconColor} />
    </button>
  );
}
