import React from 'react';
import { useTheme } from '../context/ThemeContext';

// Surface with the app's outline. Pass `onPress` to make the whole card a
// button with a proper hover/active state.
export default function Card({ children, style, onPress, onClick, accessibilityLabel }) {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';
  const base = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    border: `${theme.border.width}px solid ${elevated ? theme.colors.border : theme.colors.text}`,
    padding: 16,
    boxShadow: theme.shadow.card,
    boxSizing: 'border-box',
    minWidth: 0,
  };
  const handler = onPress || onClick;
  if (handler) {
    return (
      <button
        type="button"
        onClick={handler}
        aria-label={accessibilityLabel}
        className="gk-touchable"
        style={{ ...base, display: 'block', textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit', ...style }}
      >
        {children}
      </button>
    );
  }
  return <div style={{ ...base, ...style }}>{children}</div>;
}
