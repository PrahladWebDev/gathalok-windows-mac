import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import Button from '../../ui/Button';
import FadeInUp from '../../ui/FadeInUp';
import Icon from '../../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation, useRoute } from '../../router/navAdapter';
import { haptic } from '../../utils/desktop';

// Reached via a "verify-email/:token" link from the verification email.
// Auto-verifies on mount.
export default function VerifyEmail() {
  const theme = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const { params } = useRoute();
  const { verifyEmail } = useAuth();
  const token = params?.token;

  const [status, setStatus] = useState(token ? 'verifying' : 'error');
  const [message, setMessage] = useState(token ? '' : 'This verification link is missing its token.');
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const data = await verifyEmail(token);
        setStatus('success');
        setMessage(data.message || 'Your email has been verified.');
        haptic.success();
        if (data.token) toast('Welcome to GathaLok!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'This verification link is invalid or has expired.');
        haptic.error();
      }
    })();
  }, [token, verifyEmail, toast]);

  const icon = status === 'verifying' ? 'hourglass-outline' : status === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline';

  return (
    <Screen>
      <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <FadeInUp distance={12}>
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Icon name={icon} size={44} color={status === 'error' ? theme.colors.danger : theme.colors.accent} />
            <Text style={{ ...theme.typography.h2, marginTop: 16 }}>
              {status === 'verifying' ? 'Verifying…' : status === 'success' ? 'Email Verified' : 'Verification Failed'}
            </Text>
            <Text style={{ ...theme.typography.bodyMuted, marginTop: 8, textAlign: 'center' }}>
              {status === 'verifying' ? 'Please wait while we confirm your email.' : message}
            </Text>

            {status === 'success' && (
              <Button title="Continue to GathaLok" onPress={() => navigation.getParent()?.goBack()} style={{ marginTop: 28, width: '100%' }} />
            )}
            {status === 'error' && (
              <Button title="Back to Sign In" onPress={() => navigation.navigate('Login')} style={{ marginTop: 28, width: '100%' }} />
            )}
          </View>
        </FadeInUp>
      </div>
    </Screen>
  );
}
