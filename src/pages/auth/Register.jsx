import React, { useState } from 'react';
import { View, Text } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import FadeInUp from '../../ui/FadeInUp';
import Icon from '../../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../router/navAdapter';
import { haptic } from '../../utils/desktop';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function Register() {
  const theme = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const { register, resendVerification } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));
  const fail = (message) => { haptic.warning(); setError(message); };

  const submit = async () => {
    if (!form.name.trim() || !form.username || !form.email.trim() || !form.password) {
      fail('Please fill in every field.');
      return;
    }
    if (!USERNAME_RE.test(form.username)) {
      fail('Username must be 3-20 chars: lowercase letters, numbers, underscores.');
      return;
    }
    if (form.password.length < 6) {
      fail('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      haptic.success();
      setRegisteredEmail(data.email || form.email.trim());
    } catch (err) {
      haptic.error();
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      const data = await resendVerification(registeredEmail);
      toast(data.message || 'Verification email sent!');
    } catch (err) {
      toast(err.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <Screen>
        <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <FadeInUp distance={12}>
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Icon name="mail-outline" size={44} color={theme.colors.accent} />
              <Text style={{ ...theme.typography.h2, marginTop: 16, textAlign: 'center' }}>Check Your Email</Text>
              <Text style={{ ...theme.typography.bodyMuted, marginTop: 8, textAlign: 'center' }}>
                We've sent a verification link to{'\n'}<span style={{ fontWeight: '700', color: theme.colors.text }}>{registeredEmail}</span>.{'\n'}
                Click it to activate your account, then sign in.
              </Text>

              <Button
                title={resending ? 'Sending…' : 'Resend Verification Email'}
                onPress={handleResend}
                loading={resending}
                style={{ marginTop: 28, width: '100%' }}
              />

              <button
                type="button"
                onClick={() => navigation.navigate('Login')}
                aria-label="Already verified, sign in"
                style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, marginTop: 16 }}
              >
                <Text style={{ ...theme.typography.body, color: theme.colors.accent, fontWeight: '700' }}>Already verified? Sign in</Text>
              </button>
            </View>
          </FadeInUp>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <FadeInUp distance={12}>
          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
            <Text style={{ ...theme.typography.display, color: theme.colors.accent }}>॥ GathaLok ॥</Text>
            <Text style={{ ...theme.typography.h2, marginTop: 18 }}>Begin Your Journey</Text>
            <Text style={{ ...theme.typography.bodyMuted, marginTop: 4, textAlign: 'center' }}>
              Join thousands discovering the world's mythological heritage
            </Text>
          </View>
        </FadeInUp>

        <FadeInUp delay={90} distance={16}>
          <Input label="Full Name" value={form.name} onChangeText={set('name')} placeholder="Arjun Sharma" leftIcon="person-outline" />
          <Input
            label="Username" value={form.username} onChangeText={(v) => set('username')(v.toLowerCase())}
            placeholder="arjunsharma" leftIcon="at-outline" helperText="3-20 chars: lowercase letters, numbers, underscores"
          />
          <Input label="Email" value={form.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" leftIcon="mail-outline" />
          <Input
            label="Password" value={form.password} onChangeText={set('password')} placeholder="Min 6 characters"
            secureToggle secureTextEntry leftIcon="lock-closed-outline" onSubmitEditing={submit}
          />

          {error ? (
            <Text role="alert" style={{ color: theme.colors.danger, marginBottom: 10 }}>⚠ {error}</Text>
          ) : null}

          <Button title={loading ? 'Please wait…' : 'Create Account'} onPress={submit} loading={loading} style={{ marginTop: 6, width: '100%' }} />

          <Text style={{ ...theme.typography.caption, textAlign: 'center', marginTop: 16 }}>
            By joining, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </FadeInUp>

        <FadeInUp delay={180} distance={16}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <Text style={theme.typography.bodyMuted}>Already a member? </Text>
            <button
              type="button"
              onClick={() => navigation.navigate('Login')}
              aria-label="Sign in to an existing account"
              style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 44 }}
            >
              <Text style={{ ...theme.typography.body, color: theme.colors.accent, fontWeight: '700' }}>Sign in</Text>
            </button>
          </View>
        </FadeInUp>
      </div>
    </Screen>
  );
}
