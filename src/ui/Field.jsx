import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Field({ label, hint, error, children, style, row = true }) {
  const theme = useTheme();
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label ? <div style={{ ...theme.typography.label, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div> : null}
      <div style={row ? { display: 'flex', flexDirection: 'row', flexWrap: 'wrap' } : undefined}>{children}</div>
      {error ? <div style={{ ...theme.typography.caption, color: theme.colors.danger, marginTop: 4 }}>{error}</div> : null}
      {!error && hint ? <div style={{ ...theme.typography.caption, marginTop: 4 }}>{hint}</div> : null}
    </div>
  );
}
