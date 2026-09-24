import React, { useState } from 'react';
import { View, Text } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import FadeInUp from '../../ui/FadeInUp';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../router/navAdapter';
import { haptic } from '../../utils/desktop';

export default function Login() {
  const theme = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const { login, resendVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [notVerifiedEmail, setNotVerifiedEmail] = useState(null);

  const submit = async () => {
    if (!email.trim() || !password) { haptic.warning(); setError('Enter your email and password.'); return; }
    setError('');
    setNotVerifiedEmail(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      haptic.success();
      toast('Welcome back, seeker of tales!');
      navigation.getParent()?.goBack();
    } catch (err) {
      haptic.error();
      setError(err.message || 'Login failed');
      if (err.notVerified) setNotVerifiedEmail(err.email || email.trim());
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!notVerifiedEmail) return;
    setResending(true);
    try {
      const data = await resendVerification(notVerifiedEmail);
      toast(data.message || 'Verification email sent!');
    } catch (err) {
      toast(err.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen>
      <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <FadeInUp distance={12}>
          <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 24 }}>
            <Text style={{ ...theme.typography.display, color: theme.colors.accent }}>॥ GathaLok ॥</Text>
            <Text style={{ ...theme.typography.h2, marginTop: 18 }}>Welcome Back</Text>
            <Text style={{ ...theme.typography.bodyMuted, marginTop: 4, textAlign: 'center' }}>
              Sign in to continue exploring world folklore
            </Text>
          </View>
        </FadeInUp>

        <FadeInUp delay={90} distance={16}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            leftIcon="mail-outline"
            onSubmitEditing={submit}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureToggle
            secureTextEntry
            leftIcon="lock-closed-outline"
            onSubmitEditing={submit}
          />

          <View style={{ alignItems: 'flex-end', marginTop: -6, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => navigation.navigate('ForgotPassword')}
              aria-label="Forgot password"
              style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 32 }}
            >
              <Text style={{ ...theme.typography.caption, color: theme.colors.accent, fontWeight: '600' }}>Forgot password?</Text>
            </button>
          </View>

          {error ? (
            <View style={{ marginBottom: 10 }}>
              <Text role="alert" style={{ color: theme.colors.danger }}>⚠ {error}</Text>
              {notVerifiedEmail ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  aria-label="Resend verification email"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 32, marginTop: 4, display: 'block' }}
                >
                  <Text style={{ ...theme.typography.caption, color: theme.colors.accent, fontWeight: '700', textDecoration: 'underline' }}>
                    {resending ? 'Sending…' : 'Resend verification email'}
                  </Text>
                </button>
              ) : null}
            </View>
          ) : null}

          <Button title={loading ? 'Please wait…' : 'Sign In'} onPress={submit} loading={loading} style={{ marginTop: 6, width: '100%' }} />
        </FadeInUp>

        <FadeInUp delay={180} distance={16}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
            <Text style={theme.typography.bodyMuted}>Don't have an account? </Text>
            <button
              type="button"
              onClick={() => navigation.navigate('Register')}
              aria-label="Create a free account"
              style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 44 }}
            >
              <Text style={{ ...theme.typography.body, color: theme.colors.accent, fontWeight: '700' }}>Join free</Text>
            </button>
          </View>
        </FadeInUp>
      </div>
    </Screen>
  );
}
