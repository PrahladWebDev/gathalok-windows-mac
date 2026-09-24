import React, { useState } from 'react';
import { View, Text } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import MagicalTitle from '../../ui/MagicalTitle';
import Card from '../../ui/Card';
import Chip from '../../ui/Chip';
import EmptyState from '../../ui/EmptyState';
import { SkeletonList } from '../../ui/Skeleton';
import ErrorState from '../../ui/ErrorState';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '../../router/navAdapter';
import useFocusedFetch from '../../hooks/useFocusedFetch';
import { haptic } from '../../utils/desktop';
import api from '../../api/client';

const TYPE_ICONS = {
  story_approved: '✅', story_rejected: '❌', story_changes: '✏️', story_resubmitted: '🔄',
  comment: '💬', reply: '↩️', like: '♥', follow: '👤', achievement: '🏆', feature: '⭐', announcement: '📢',
};

export default function Notifications() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [filter, setFilter] = useState('all');
  const { data, status, refreshing, refresh, reload, setData } = useFocusedFetch(
    () => api.get('/notifications', { params: filter === 'unread' ? { unreadOnly: true } : {} })
      .then((r) => ({ notifs: r.data.data || [], unreadCount: r.data.unreadCount || 0 })),
    [filter]
  );
  const notifs = data?.notifs || [];
  const unreadCount = data?.unreadCount || 0;

  const markRead = async (ids) => {
    setData((prev) => prev && {
      notifs: prev.notifs.map((n) => (ids === 'all' || ids.includes(n._id) ? { ...n, isRead: true } : n)),
      unreadCount: ids === 'all' ? 0 : Math.max(0, prev.unreadCount - ids.length),
    });
    try { await api.patch('/notifications/read', { ids }); } catch (err) {}
  };

  const markAllRead = () => { haptic.success(); markRead('all'); };

  const openNotif = async (n) => {
    if (!n.isRead) markRead([n._id]);
    const match = n.link?.match(/\/stories\/([^/?]+)/);
    if (match) return navigation.navigate('StoryDetail', { slug: match[1] });
    const profileMatch = n.link?.match(/\/u\/([^/?]+)/);
    if (profileMatch) navigation.navigate('PublicProfile', { username: profileMatch[1] });
  };

  return (
    <Screen
      titleNode={<MagicalTitle title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : undefined} />}
      refreshing={refreshing}
      onRefresh={refresh}
      right={unreadCount > 0 ? (
        <button
          type="button"
          onClick={markAllRead}
          aria-label="Mark all notifications as read"
          style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '0 4px' }}
        >
          <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>✓ Mark all read</Text>
        </button>
      ) : null}
    >
      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label={`Unread${unreadCount ? ` (${unreadCount})` : ''}`} active={filter === 'unread'} onPress={() => setFilter('unread')} />
      </View>

      {status === 'loading' ? (
        <SkeletonList count={6} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : notifs.length === 0 ? (
        <EmptyState
          icon={filter === 'unread' ? 'checkmark-done-outline' : 'notifications-outline'}
          title={filter === 'unread' ? "You're all caught up" : 'No notifications yet'}
          subtitle={filter === 'unread' ? undefined : "You'll be notified when your stories get approved, receive comments, or you earn achievements."}
          action={filter === 'unread' ? { label: 'Show all', onPress: () => setFilter('all') } : undefined}
        />
      ) : (
        notifs.map((n) => (
          <Card
            key={n._id}
            onPress={() => openNotif(n)}
            accessibilityLabel={`${n.isRead ? '' : 'Unread. '}${n.title}`}
            style={{
              flexDirection: 'row', marginBottom: 10,
              backgroundColor: n.isRead ? theme.colors.surface : theme.colors.accentSoft,
            }}
          >
            <Text style={{ fontSize: 22, marginRight: 12 }}>{TYPE_ICONS[n.type] || '🔔'}</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={theme.typography.h4}>{n.title}</Text>
              <Text style={{ ...theme.typography.bodyMuted, marginTop: 2 }} numberOfLines={2}>{n.message}</Text>
              <Text style={{ ...theme.typography.small, marginTop: 4 }}>{new Date(n.createdAt).toLocaleDateString()}</Text>
            </View>
            {!n.isRead ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.accent, marginLeft: 8, marginTop: 4, flexShrink: 0 }} /> : null}
          </Card>
        ))
      )}
    </Screen>
  );
}
