import React, { useRef, useState } from 'react';
import { View, Text, Image } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import MagicalTitle from '../../ui/MagicalTitle';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Icon from '../../ui/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { haptic, openExternal, confirmDialog } from '../../utils/desktop';

function ThemeSwatch({ option, active, onPress, theme }) {
  return (
    <button
      type="button"
      onClick={onPress}
      role="radio"
      aria-checked={active}
      aria-label={`${option.name} theme`}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 74, minHeight: 44 }}
    >
      <div style={{
        position: 'relative', width: 56, height: 56, borderRadius: 18, backgroundColor: option.bg,
        border: `${active ? theme.border.width : 1.5}px solid ${active ? theme.colors.text : theme.colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6,
      }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: option.accent }} />
        {active && (
          <span style={{ position: 'absolute', top: -5, right: -5, backgroundColor: option.accent, borderRadius: 10, padding: 2, border: `1.5px solid ${theme.colors.text}`, display: 'flex' }}>
            <Icon name="checkmark" size={11} color={option.onAccent} />
          </span>
        )}
      </div>
      <Text numberOfLines={1} style={{ ...theme.typography.small, ...(active ? { color: theme.colors.text } : null) }}>{option.name}</Text>
    </button>
  );
}

export default function Settings() {
  const theme = useTheme();
  const toast = useToast();
  const { user, updateProfile, uploadAvatar, changePassword, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handlePickAvatar = () => fileInputRef.current?.click();

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast('Avatar updated.');
    } catch (err) {
      toast(err.message || 'Failed to upload avatar.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !username.trim()) {
      toast('Name and username are required.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), username: username.trim().toLowerCase(), bio: bio.trim() });
      toast('Profile updated.');
    } catch (err) {
      toast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!curPass || newPass.length < 6) {
      toast('Enter your current password and a new one (min 6 chars).', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      toast('New password and confirmation do not match.', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(curPass, newPass);
      setCurPass(''); setNewPass(''); setConfirmPass('');
      toast('Password updated.');
    } catch (err) {
      toast(err.message || 'Failed to update password.', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = await confirmDialog({
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This cannot be undone.',
      confirmLabel: 'Delete', destructive: true,
    });
    if (ok) toast('Account deletion requires contacting support.', 'error');
  };

  return (
    <Screen titleNode={<MagicalTitle title="Settings" />}>
      <div style={{ maxWidth: 640 }}>
        {user ? (
          <>
            <Text style={{ ...theme.typography.h2, marginBottom: 2 }}>Profile</Text>
            <Text style={{ ...theme.typography.bodyMuted, marginBottom: 14 }}>How other seekers see you.</Text>
            <Card style={{ marginBottom: 28 }}>
              <View style={{ alignItems: 'center', marginBottom: 18 }}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: 'none' }} />
                <button type="button" onClick={handlePickAvatar} disabled={uploadingAvatar} style={{ position: 'relative', background: 'none', border: 'none', cursor: uploadingAvatar ? 'default' : 'pointer', padding: 0 }}>
                  <View style={{
                    width: 84, height: 84, borderRadius: 42, backgroundColor: theme.colors.accentSoft,
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    border: `${theme.border.width}px solid ${theme.colors.text}`,
                  }}>
                    {user.avatar?.url ? (
                      <Image source={{ uri: user.avatar.url }} style={{ width: 84, height: 84 }} />
                    ) : (
                      <Text style={{ fontSize: 30, fontWeight: '700', color: theme.colors.accent }}>{user.name?.[0]?.toUpperCase()}</Text>
                    )}
                  </View>
                  <span style={{
                    position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.accent, borderRadius: 14,
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `${theme.border.width}px solid ${theme.colors.text}`,
                  }}>
                    <Icon name="camera" size={14} color={theme.colors.onAccent} />
                  </span>
                </button>
                {uploadingAvatar ? <Text style={{ ...theme.typography.small, marginTop: 8 }}>Uploading…</Text> : null}
              </View>

              <Input label="Full Name" value={name} onChangeText={setName} leftIcon="person-outline" />
              <Input label="Username" value={username} onChangeText={(v) => setUsername(v.toLowerCase())} leftIcon="at-outline" />
              <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Tell the community about yourself…" leftIcon="chatbox-ellipses-outline" />
              <Button title={savingProfile ? 'Saving…' : 'Save Profile'} onPress={handleSaveProfile} loading={savingProfile} style={{ width: '100%' }} />
            </Card>
          </>
        ) : null}

        <Text style={{ ...theme.typography.h2, marginBottom: 2 }}>Appearance</Text>
        <Text style={{ ...theme.typography.bodyMuted, marginBottom: 14 }}>Pick a look. It applies everywhere, instantly.</Text>
        <Card style={{ marginBottom: 28 }}>
          <View role="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {theme.themeList.map((option) => (
              <ThemeSwatch
                key={option.id}
                option={option}
                active={option.id === theme.themeId}
                onPress={() => { haptic.select(); theme.setTheme(option.id); }}
                theme={theme}
              />
            ))}
          </View>
        </Card>

        {user ? (
          <>
            <Text style={{ ...theme.typography.h2, marginBottom: 2 }}>Change Password</Text>
            <Text style={{ ...theme.typography.bodyMuted, marginBottom: 14 }}>Keep your account secure.</Text>
            <Card style={{ marginBottom: 28 }}>
              <Input label="Current Password" value={curPass} onChangeText={setCurPass} secureTextEntry secureToggle leftIcon="lock-closed-outline" />
              <Input label="New Password" value={newPass} onChangeText={setNewPass} secureTextEntry secureToggle leftIcon="key-outline" helperText="Minimum 6 characters" />
              <Input label="Confirm New Password" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry secureToggle leftIcon="key-outline" />
              <Button title={pwLoading ? 'Updating…' : 'Update Password'} onPress={handleChangePassword} loading={pwLoading} style={{ width: '100%' }} />
            </Card>

            <Text style={{ ...theme.typography.h2, marginBottom: 2 }}>Legal</Text>
            <Text style={{ ...theme.typography.bodyMuted, marginBottom: 14 }}>How we handle your data.</Text>
            <Card style={{ marginBottom: 28 }}>
              <button
                type="button"
                onClick={() => openExternal('https://prahladsingh.in/gathalok/privacy-policy/')}
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', width: '100%', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
              >
                <Text style={theme.typography.body}>Privacy Policy</Text>
                <Icon name="open-outline" size={18} color={theme.colors.accent} />
              </button>
            </Card>

            <Button title="Sign Out" variant="outline" onPress={logout} style={{ marginBottom: 16 }} />

            <Text style={{ ...theme.typography.h2, marginBottom: 2, color: theme.colors.danger }}>Danger Zone</Text>
            <Text style={{ ...theme.typography.bodyMuted, marginBottom: 14 }}>This action is permanent.</Text>
            <Button title="Delete My Account" variant="danger" onPress={handleDeleteAccount} style={{ marginBottom: 24 }} />
          </>
        ) : null}
      </div>
    </Screen>
  );
}
