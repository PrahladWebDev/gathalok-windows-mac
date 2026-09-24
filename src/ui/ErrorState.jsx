import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import Button from './Button';

export default function ErrorState({ title = 'Could not load', message = 'Something went wrong.', onRetry, icon = 'cloud-offline-outline', style }) {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', textAlign: 'center', ...style }}>
      <Icon name={icon} size={40} color={theme.colors.textFaint} />
      <div style={{ ...theme.typography.h3, marginTop: 12 }}>{title}</div>
      <div style={{ ...theme.typography.bodyMuted, marginTop: 4, maxWidth: 420 }}>{message}</div>
      {onRetry ? <Button title="Try again" variant="outline" onPress={onRetry} style={{ marginTop: 16, paddingLeft: 28, paddingRight: 28 }} /> : null}
    </div>
  );
}
