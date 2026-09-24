import React, { useState } from 'react';
import { View, Text } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import FadeInUp from '../../ui/FadeInUp';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation, useRoute } from '../../router/navAdapter';
import { haptic } from '../../utils/desktop';

// Reached via a "reset-password/:token" link from the reset email.
export default function ResetPassword() {
  const theme = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const { params } = useRoute();
  const { resetPassword } = useAuth();
  const token = params?.token;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!password || !confirm) { haptic.warning(); setError('Please fill in both fields.'); return; }
    if (password.length < 6) { haptic.warning(); setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { haptic.warning(); setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(token, password);
      haptic.success();
      toast('Password reset successfully! Welcome back.');
      navigation.getParent()?.goBack();
    } catch (err) {
      haptic.error();
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Screen>
        <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ ...theme.typography.h2, textAlign: 'center' }}>Invalid Link</Text>
            <Text style={{ ...theme.typography.bodyMuted, marginTop: 8, textAlign: 'center' }}>
              This password reset link is missing its token. Please request a new one.
            </Text>
            <Button title="Request New Link" onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 24, width: '100%' }} />
          </View>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <FadeInUp distance={12}>
          <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 24 }}>
            <Text style={{ ...theme.typography.display, color: theme.colors.accent }}>॥ GathaLok ॥</Text>
            <Text style={{ ...theme.typography.h2, marginTop: 18 }}>Reset Password</Text>
            <Text style={{ ...theme.typography.bodyMuted, marginTop: 4, textAlign: 'center' }}>Choose a new password for your account.</Text>
          </View>
        </FadeInUp>

        <FadeInUp delay={90} distance={16}>
          <Input label="New Password" value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureToggle secureTextEntry leftIcon="lock-closed-outline" />
          <Input label="Confirm New Password" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" secureToggle secureTextEntry leftIcon="lock-closed-outline" onSubmitEditing={submit} />
          {error ? <Text role="alert" style={{ color: theme.colors.danger, marginBottom: 10 }}>⚠ {error}</Text> : null}
          <Button title={loading ? 'Resetting…' : 'Reset Password'} onPress={submit} loading={loading} style={{ marginTop: 6, width: '100%' }} />
        </FadeInUp>
      </div>
    </Screen>
  );
}
