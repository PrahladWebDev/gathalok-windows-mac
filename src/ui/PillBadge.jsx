import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function PillBadge({ label, tone = 'neutral', style, textStyle }) {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';
  const bg = {
    neutral: theme.colors.surfaceAlt,
    accent: theme.colors.accentSoft,
    success: theme.colors.successSoft,
    danger: theme.colors.dangerSoft,
    info: theme.colors.infoSoft,
  }[tone] || theme.colors.surfaceAlt;

  return (
    <span
      style={{
        display: 'inline-block', padding: '4px 10px', borderRadius: theme.radius.pill,
        border: `${elevated ? 1 : theme.border.width - 1}px solid ${elevated ? theme.colors.border : theme.colors.text}`,
        backgroundColor: bg, fontSize: 12, fontWeight: 700, color: theme.colors.text,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
        ...style,
      }}
    >
      <span style={textStyle}>{label}</span>
    </span>
  );
}
