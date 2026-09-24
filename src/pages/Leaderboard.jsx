import React, { useState } from 'react';
import { View, Text, Image } from '../ui/primitives';
import Screen from '../ui/Screen';
import MagicalTitle from '../ui/MagicalTitle';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import PillBadge from '../ui/PillBadge';
import EmptyState from '../ui/EmptyState';
import { SkeletonList } from '../ui/Skeleton';
import ErrorState from '../ui/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../router/navAdapter';
import useFocusedFetch from '../hooks/useFocusedFetch';
import api from '../api/client';
import { getCategory } from '../data/categories';

const TABS = [
  { id: 'readers', label: '📚 Readers' },
  { id: 'contributors', label: '✍️ Contributors' },
  { id: 'stories', label: '🔥 Stories' },
];

function RankRow({ index, avatarUrl, name, sub, trailing, onPress }) {
  const theme = useTheme();
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
  return (
    // display:flex + width:100% are required: Card renders a <button> (display:block,
    // shrink-to-fit) when clickable, which is what stacked the medal/avatar/name
    // vertically and made every row a different width.
    <Card
      onPress={onPress}
      accessibilityLabel={`Rank ${index + 1}, ${name}`}
      style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%',
        marginBottom: 10, padding: '12px 16px', textAlign: 'left',
        cursor: onPress ? 'pointer' : 'default',
      }}
    >
      <View style={{ width: 36, alignItems: 'center', flexShrink: 0 }}>
        <Text style={{ ...theme.typography.h3, fontSize: medal ? 22 : 17, textAlign: 'center' }}>{medal || index + 1}</Text>
      </View>
      <View style={{
        width: 44, height: 44, borderRadius: 22, marginLeft: 8, marginRight: 14,
        backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center',
        border: `${theme.border.width}px solid ${theme.colors.text}`, overflow: 'hidden', flexShrink: 0,
      }}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 44, height: 44 }} />
        ) : (
          <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{name?.[0]?.toUpperCase() || '?'}</Text>
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={theme.typography.h4} numberOfLines={1}>{name}</Text>
        {sub ? <Text style={{ ...theme.typography.caption, marginTop: 2 }} numberOfLines={1}>{sub}</Text> : null}
      </View>
      <View style={{ marginLeft: 12, flexShrink: 0 }}>{trailing}</View>
    </Card>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState('readers');
  const navigation = useNavigation();
  const { data, status, refreshing, refresh, reload } = useFocusedFetch(
    () => api.get('/leaderboard').then((r) => r.data.data || {}),
    []
  );

  const rows = tab === 'readers' ? data?.topReaders : tab === 'contributors' ? data?.topContributors : data?.topStories;

  return (
    <Screen titleNode={<MagicalTitle title="Leaderboard" subtitle="The most devoted seekers & storytellers" />} refreshing={refreshing} onRefresh={refresh}>
      <View style={{ flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <Chip key={t.id} label={t.label} active={tab === t.id} onPress={() => setTab(t.id)} />
        ))}
      </View>

      <View style={{ width: '100%', maxWidth: 900 }}>
      {status === 'loading' ? (
        <SkeletonList count={6} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : !rows || rows.length === 0 ? (
        <EmptyState icon="trophy-outline" title="Nothing to rank yet" subtitle="Read, write and share tales to appear here." />
      ) : tab === 'readers' ? (
        rows.map((u, i) => (
          <RankRow key={u._id} index={i} avatarUrl={u.avatar?.url} name={u.name}
            sub={`@${u.username} · ${u.countriesExplored?.length || 0} countries explored`}
            trailing={<PillBadge label={`${u.storiesRead || 0} read`} tone="accent" />}
            onPress={(u.role === 'contributor' || u.role === 'admin') ? () => navigation.navigate('PublicProfile', { username: u.username }) : undefined} />
        ))
      ) : tab === 'contributors' ? (
        rows.map((u, i) => (
          <RankRow key={u._id} index={i} avatarUrl={u.avatar?.url} name={u.name}
            sub={`@${u.username} · ${u.totalLikesReceived || 0} likes received`}
            trailing={<PillBadge label={`${u.storiesWritten || 0} tales`} tone="accent" />}
            onPress={() => navigation.navigate('PublicProfile', { username: u.username })} />
        ))
      ) : (
        rows.map((s, i) => (
          <RankRow key={s._id} index={i} avatarUrl={s.coverImage?.url} name={s.title}
            sub={`${getCategory(s.category)?.icon || ''} ${s.country}`}
            trailing={<PillBadge label={`👁 ${s.views?.toLocaleString() || 0}`} />}
            onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
        ))
      )}
      </View>
    </Screen>
  );
}