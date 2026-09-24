import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import Button from './Button';

export default function EmptyState({ icon = 'book-outline', title, subtitle, action, compact = false, style }) {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: compact ? '24px 30px' : '48px 30px', textAlign: 'center', ...style }}>
      <div style={{
        width: 64, height: 64, borderRadius: theme.radius.pill, backgroundColor: theme.colors.accentSoft,
        border: `${theme.border.width}px solid ${theme.colors.text}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={30} color={theme.colors.accent} />
      </div>
      <div style={{ ...theme.typography.h3, marginTop: 14 }}>{title}</div>
      {subtitle ? <div style={{ ...theme.typography.bodyMuted, marginTop: 4, maxWidth: 420 }}>{subtitle}</div> : null}
      {action ? <Button title={action.label} onPress={action.onPress} style={{ marginTop: 18, paddingLeft: 26, paddingRight: 26 }} /> : null}
    </div>
  );
}
