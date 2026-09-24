import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from '../ui/primitives';
import Screen from '../ui/Screen';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import PillBadge from '../ui/PillBadge';
import StoryCard from '../ui/StoryCard';
import FollowButton from '../ui/FollowButton';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import { SkeletonList } from '../ui/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '../router/navAdapter';
import useFocusedFetch from '../hooks/useFocusedFetch';
import api from '../api/client';

const EMPTY = () => ({ items: [], page: 0, pages: 1, loading: false });
const hasProfile = (u) => u?.role === 'contributor' || u?.role === 'admin';

function Avatar({ user, size }) {
  const theme = useTheme();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.accentSoft,
      alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
      border: `${theme.border.width}px solid ${theme.colors.text}`,
    }}>
      {user.avatar?.url ? (
        <Image source={{ uri: user.avatar.url }} style={{ width: size, height: size }} />
      ) : (
        <Text style={{ fontSize: size * 0.4, fontWeight: '700', color: theme.colors.accent }}>
          {user.name?.[0]?.toUpperCase() || '?'}
        </Text>
      )}
    </View>
  );
}

function UserRow({ u, onOpen, onToggle }) {
  const theme = useTheme();
  const linkable = hasProfile(u);
  const info = (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
      <Avatar user={u} size={44} />
      <View style={{ flex: 1, marginLeft: 12, marginRight: 8, minWidth: 0 }}>
        <Text style={theme.typography.h4} numberOfLines={1}>{u.name}</Text>
        <Text style={theme.typography.caption} numberOfLines={1}>@{u.username}</Text>
        {u.bio ? <Text style={{ ...theme.typography.small, marginTop: 2 }} numberOfLines={1}>{u.bio}</Text> : null}
      </View>
    </View>
  );
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      {linkable ? (
        <TouchableOpacity style={{ flex: 1, minWidth: 0 }} accessibilityLabel={`Open ${u.name}'s profile`} onPress={() => onOpen(u.username)}>
          {info}
        </TouchableOpacity>
      ) : info}
      {linkable && !u.isSelf ? (
        <FollowButton userId={u._id} initialFollowing={u.isFollowing} onChange={(f) => onToggle(u._id, f)} />
      ) : null}
    </Card>
  );
}

export default function PublicProfile() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute();
  const username = params.username;
  const [tab, setTab] = useState('stories');
  const [lists, setLists] = useState({ stories: EMPTY(), followers: EMPTY(), following: EMPTY() });
  const listsRef = useRef(lists);
  listsRef.current = lists;

  const { data: profile, status, refreshing, refresh, setData } = useFocusedFetch(
    () => api.get(`/users/${username}`).then((r) => r.data.data),
    [username]
  );

  const loadMore = useCallback(async (which) => {
    const cur = listsRef.current[which];
    if (cur.loading) return;
    setLists((p) => ({ ...p, [which]: { ...p[which], loading: true } }));
    try {
      const res = await api.get(`/users/${username}/${which}`, {
        params: { page: cur.page + 1, limit: which === 'stories' ? 12 : 20 },
      });
      setLists((p) => ({
        ...p,
        [which]: {
          items: [...p[which].items, ...res.data.data],
          page: res.data.pagination.page,
          pages: res.data.pagination.pages,
          loading: false,
        },
      }));
    } catch (err) {
      setLists((p) => ({ ...p, [which]: { ...p[which], loading: false } }));
    }
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    const l = listsRef.current[tab];
    if (l.page === 0 && !l.loading) loadMore(tab);
  }, [tab, profile, loadMore]);

  const openProfile = (name) => navigation.push('PublicProfile', { username: name });

  const onProfileFollow = (isFollowing, followersCount) => {
    setData((p) => p && {
      ...p,
      isFollowing,
      followersCount: followersCount ?? p.followersCount + (isFollowing ? 1 : -1),
    });
    setLists((p) => ({ ...p, followers: EMPTY() }));
  };

  const onRowToggle = (id, isFollowing) => {
    setLists((p) => {
      const patch = (arr) => arr.map((u) => (u._id === id ? { ...u, isFollowing } : u));
      return {
        ...p,
        followers: { ...p.followers, items: patch(p.followers.items) },
        following: { ...p.following, items: patch(p.following.items) },
      };
    });
    if (profile?.isSelf) {
      setData((p) => p && { ...p, followingCount: Math.max(0, p.followingCount + (isFollowing ? 1 : -1)) });
    }
  };

  const back = (
    <View style={{ marginBottom: 6, alignItems: 'flex-start' }}>
      <IconButton name="chevron-back" label="Back" variant="soft" onPress={() => navigation.goBack()} />
    </View>
  );

  if (status === 'loading') {
    return <Screen>{back}<SkeletonList count={4} /></Screen>;
  }

  if (status === 'error' || !profile) {
    return (
      <Screen>
        {back}
        <ErrorState title="Profile not found" message="This storyteller doesn't exist or is no longer active." icon="planet-outline" onRetry={() => window.location.reload()} />
      </Screen>
    );
  }

  const joined = new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const cur = lists[tab];
  const TABS = [
    { id: 'stories', label: `Stories (${profile.publishedCount})` },
    { id: 'followers', label: `Followers (${profile.followersCount})` },
    { id: 'following', label: `Following (${profile.followingCount})` },
  ];

  const Stat = ({ value, label, onPress }) => (
    <TouchableOpacity disabled={!onPress} onPress={onPress} style={{ flex: 1, alignItems: 'center' }}
      accessibilityLabel={`${value} ${label}`}>
      <Text style={theme.typography.h2}>{value}</Text>
      <Text style={theme.typography.caption}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setLists({ stories: EMPTY(), followers: EMPTY(), following: EMPTY() }); refresh(); }}>
      {back}

      <Card style={{ alignItems: 'center', padding: '22px 16px', marginBottom: 14 }}>
        <Avatar user={profile} size={84} />
        <Text style={{ ...theme.typography.h2, marginTop: 12, textAlign: 'center' }}>{profile.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={theme.typography.bodyMuted}>@{profile.username}</Text>
          <PillBadge label={profile.role === 'admin' ? 'Admin' : 'Contributor'} tone="accent" style={{ marginLeft: 8 }} />
        </View>
        {profile.bio ? <Text style={{ ...theme.typography.body, textAlign: 'center', marginTop: 10 }}>{profile.bio}</Text> : null}
        <Text style={{ ...theme.typography.caption, marginTop: 8 }}>
          {profile.country ? `📍 ${profile.country} · ` : ''}Joined {joined}
        </Text>

        <View style={{ flexDirection: 'row', width: '100%', marginTop: 18 }}>
          <Stat value={profile.publishedCount} label="Stories" onPress={() => setTab('stories')} />
          <Stat value={profile.followersCount} label="Followers" onPress={() => setTab('followers')} />
          <Stat value={profile.followingCount} label="Following" onPress={() => setTab('following')} />
          <Stat value={profile.likesReceived} label="Likes" />
        </View>

        <View style={{ marginTop: 18 }}>
          {profile.isSelf ? (
            <Button title="Back to my dashboard" variant="outline" size="sm" onPress={() => navigation.navigate('Main', { screen: 'ProfileTab' })} />
          ) : (
            <FollowButton userId={profile._id} initialFollowing={profile.isFollowing} onChange={onProfileFollow} />
          )}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
        {TABS.map((t) => (
          <Chip key={t.id} label={t.label} active={tab === t.id} onPress={() => setTab(t.id)} small />
        ))}
      </View>

      {tab === 'stories' ? (
        cur.items.length === 0 && !cur.loading ? (
          <EmptyState icon="book-outline" title="No published stories yet" compact />
        ) : (
          cur.items.map((s) => (
            <View key={s._id} style={{ marginBottom: 10 }}>
              <StoryCard story={s} size="compact" onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
            </View>
          ))
        )
      ) : cur.items.length === 0 && !cur.loading ? (
        <EmptyState icon="people-outline" compact
          title={tab === 'followers' ? 'No followers yet' : 'Not following anyone yet'} />
      ) : (
        cur.items.map((u) => <UserRow key={u._id} u={u} onOpen={openProfile} onToggle={onRowToggle} />)
      )}

      {cur.loading ? <SkeletonList count={2} /> : null}

      {!cur.loading && cur.page > 0 && cur.page < cur.pages ? (
        <Button title="Load more" variant="outline" onPress={() => loadMore(tab)} style={{ marginTop: 6 }} />
      ) : null}
    </Screen>
  );
}
