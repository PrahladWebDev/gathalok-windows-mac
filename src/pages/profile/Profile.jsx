import React from 'react';
import { View, Text, Image } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import MagicalTitle from '../../ui/MagicalTitle';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../router/navAdapter';
import { haptic } from '../../utils/desktop';

function Row({ icon, label, onPress, danger }) {
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={() => { haptic.select(); onPress && onPress(); }}
      aria-label={label}
      className="gk-touchable"
      style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', minHeight: 48, padding: '12px 0', width: '100%',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit',
      }}
    >
      <span style={{ width: 28, display: 'flex' }}><Icon name={icon} size={20} color={danger ? theme.colors.danger : theme.colors.accent} /></span>
      <Text style={{ ...theme.typography.body, flex: 1, ...(danger ? { color: theme.colors.danger } : null) }}>{label}</Text>
      <Icon name="chevron-forward" size={18} color={theme.colors.textFaint} />
    </button>
  );
}

export default function Profile() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, logout, becomeContributor } = useAuth();
  const toast = useToast();

  if (!user) {
    return (
      <Screen titleNode={<MagicalTitle title="Profile" />}>
        <Card style={{ alignItems: 'center', padding: '36px 20px' }}>
          <Icon name="person-circle-outline" size={56} color={theme.colors.accent} />
          <Text style={{ ...theme.typography.h2, marginTop: 12 }}>Sign in to GathaLok</Text>
          <Text style={{ ...theme.typography.bodyMuted, textAlign: 'center', marginTop: 6, marginBottom: 18 }}>
            Track your reading journey, bookmark stories, and contribute legends of your own.
          </Text>
          <Button title="Sign In" onPress={() => navigation.navigate('Auth', { screen: 'Login' })} />
        </Card>
      </Screen>
    );
  }

  const handleBecomeContributor = async () => {
    try {
      await becomeContributor();
      haptic.success();
      toast('You are now a Contributor!');
    } catch (err) {
      haptic.error();
      toast(err.message || 'Failed to upgrade.', 'error');
    }
  };

  return (
    <Screen titleNode={<MagicalTitle title="Profile" />}>
      <Card style={{ alignItems: 'center', padding: '24px 20px', marginBottom: 18 }}>
        <View style={{
          width: 76, height: 76, borderRadius: 38, backgroundColor: theme.colors.accentSoft,
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          border: `${theme.border.width}px solid ${theme.colors.text}`,
        }}>
          {user.avatar?.url ? (
            <Image source={{ uri: user.avatar.url }} style={{ width: 76, height: 76 }} />
          ) : (
            <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.accent }}>{user.name?.[0]?.toUpperCase()}</Text>
          )}
        </View>
        <Text style={{ ...theme.typography.h2, marginTop: 12 }}>{user.name}</Text>
        <Text style={theme.typography.bodyMuted}>@{user.username} · {user.role}</Text>
        {user.bio ? <Text style={{ ...theme.typography.body, textAlign: 'center', marginTop: 8 }}>{user.bio}</Text> : null}
      </Card>

      <View style={{ flexDirection: 'row', marginBottom: 18 }}>
        <Card style={{ flex: 1, alignItems: 'center', marginRight: 8 }}>
          <Text style={theme.typography.h2}>{user.storiesRead || 0}</Text>
          <Text style={theme.typography.caption}>Read</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', marginRight: 8 }}>
          <Text style={theme.typography.h2}>{user.countriesExplored?.length || 0}</Text>
          <Text style={theme.typography.caption}>Countries</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <Text style={theme.typography.h2}>{user.likesReceived || 0}</Text>
          <Text style={theme.typography.caption}>Likes</Text>
        </Card>
      </View>

      <Card style={{ marginBottom: 18, padding: '4px 16px' }}>
        <Row icon="bookmark-outline" label="Bookmarks" onPress={() => navigation.navigate('Bookmarks')} />
        <Row icon="time-outline" label="Reading History" onPress={() => navigation.navigate('History')} />
        <Row icon="people-outline" label="Following" onPress={() => navigation.navigate('Following')} />
        <Row icon="trophy-outline" label="Achievements" onPress={() => navigation.navigate('Achievements')} />
        {(user.role === 'contributor' || user.role === 'admin') ? (
          <>
            <Row icon="person-circle-outline" label="View Public Profile" onPress={() => navigation.navigate('PublicProfile', { username: user.username })} />
            <Row icon="create-outline" label="My Contributions" onPress={() => navigation.navigate('Contributions')} />
            <Row icon="add-circle-outline" label="Submit a Story" onPress={() => navigation.navigate('Contribute')} />
          </>
        ) : null}
        <Row icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
      </Card>

      {user.role === 'user' ? (
        <Card style={{ marginBottom: 18, alignItems: 'center', padding: '22px 20px' }}>
          <Text style={{ fontSize: 24 }}>📜</Text>
          <Text style={{ ...theme.typography.h3, marginTop: 8, textAlign: 'center' }}>Become a Contributor</Text>
          <Text style={{ ...theme.typography.bodyMuted, textAlign: 'center', marginTop: 4, marginBottom: 14 }}>
            It's free and takes just one tap — start submitting stories today.
          </Text>
          <Button title="Become a Contributor" onPress={handleBecomeContributor} />
        </Card>
      ) : null}

      <Card style={{ padding: '4px 16px', marginBottom: 24 }}>
        {user.role === 'admin' ? (
          <Row icon="shield-checkmark-outline" label="Admin Dashboard" onPress={() => navigation.navigate('AdminDashboard')} />
        ) : null}
        <Row icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} />
        <Row icon="log-out-outline" label="Sign Out" danger onPress={logout} />
      </Card>
    </Screen>
  );
}
