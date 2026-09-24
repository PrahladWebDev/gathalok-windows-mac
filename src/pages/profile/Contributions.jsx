import React from 'react';
import { View, Text } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import MagicalTitle from '../../ui/MagicalTitle';
import Card from '../../ui/Card';
import PillBadge from '../../ui/PillBadge';
import Button from '../../ui/Button';
import IconButton from '../../ui/IconButton';
import EmptyState from '../../ui/EmptyState';
import { SkeletonList } from '../../ui/Skeleton';
import ErrorState from '../../ui/ErrorState';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../router/navAdapter';
import useFocusedFetch from '../../hooks/useFocusedFetch';
import api from '../../api/client';

const STATUS_TONE = {
  approved: 'success',
  pending: 'info',
  draft: 'neutral',
  rejected: 'danger',
  changes_requested: 'danger',
};

export default function Contributions() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { data: stories, status, refreshing, refresh, reload } = useFocusedFetch(
    () => api.get('/stories', { params: { contributor: user._id, status: 'all', limit: 30 } }).then((r) => r.data.data || []),
    [user?._id]
  );

  return (
    <Screen
      titleNode={<MagicalTitle title="My Contributions" subtitle={status === 'ready' && stories.length ? `${stories.length} ${stories.length === 1 ? 'tale' : 'tales'}` : undefined} />}
      refreshing={refreshing}
      onRefresh={refresh}
      right={<IconButton name="add" label="Submit a new story" variant="filled" onPress={() => navigation.navigate('Contribute')} />}
    >
      {status === 'loading' ? (
        <SkeletonList count={5} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : stories.length === 0 ? (
        <EmptyState
          icon="create-outline"
          title="No stories submitted yet"
          subtitle="Share a legend from your part of the world."
          action={{ label: 'Submit Your First Story', onPress: () => navigation.navigate('Contribute') }}
        />
      ) : (
        stories.map((s) => (
          <Card
            key={s._id}
            onPress={() => (s.status === 'approved'
              ? navigation.navigate('StoryDetail', { slug: s.slug })
              : navigation.navigate('ContributeEdit', { id: s._id }))}
            accessibilityLabel={`${s.title}, ${String(s.status).replace('_', ' ')}`}
            style={{ marginBottom: 10 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ ...theme.typography.h4, flex: 1, marginRight: 8 }} numberOfLines={1}>{s.title}</Text>
              <PillBadge label={String(s.status).replace('_', ' ')} tone={STATUS_TONE[s.status] || 'neutral'} />
            </View>
            <Text style={{ ...theme.typography.caption, marginTop: 4 }}>📍 {s.country} · 👁 {s.views || 0} views</Text>
            {s.adminNote ? <Text style={{ ...theme.typography.caption, color: theme.colors.danger, marginTop: 4 }}>Note: {s.adminNote}</Text> : null}
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              {s.status !== 'approved' ? (
                <Button title="Edit" size="sm" variant="outline" icon="create-outline" onPress={() => navigation.navigate('ContributeEdit', { id: s._id })} />
              ) : (
                <Button title="View" size="sm" variant="outline" icon="book-outline" onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
              )}
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
