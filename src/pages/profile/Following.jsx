import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import MagicalTitle from '../../ui/MagicalTitle';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import PillBadge from '../../ui/PillBadge';
import FollowButton from '../../ui/FollowButton';
import EmptyState from '../../ui/EmptyState';
import ErrorState from '../../ui/ErrorState';
import { SkeletonList } from '../../ui/Skeleton';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '../../router/navAdapter';
import api from '../../api/client';

// Everyone the signed-in user follows.
export default function Following() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [state, setState] = useState({ items: [], page: 0, pages: 1, status: 'loading', loadingMore: false });
  const [refreshing, setRefreshing] = useState(false);
  const reqId = useRef(0);

  const fetchPage = useCallback(async (page, replace) => {
    const id = ++reqId.current;
    try {
      const res = await api.get('/users/me/following', { params: { page, limit: 20 } });
      if (id !== reqId.current) return;
      setState((p) => ({
        items: replace ? res.data.data : [...p.items, ...res.data.data],
        page: res.data.pagination.page,
        pages: res.data.pagination.pages,
        status: 'ready',
        loadingMore: false,
      }));
    } catch (err) {
      if (id !== reqId.current) return;
      setState((p) => ({ ...p, status: p.items.length ? 'ready' : 'error', loadingMore: false }));
    }
  }, []);

  useEffect(() => { fetchPage(1, true); }, [fetchPage]);

  const refresh = async () => { setRefreshing(true); await fetchPage(1, true); setRefreshing(false); };
  const loadMore = () => { setState((p) => ({ ...p, loadingMore: true })); fetchPage(state.page + 1, false); };

  return (
    <Screen titleNode={<MagicalTitle title="Following" subtitle="Storytellers you follow" />} refreshing={refreshing} onRefresh={refresh}>
      {state.status === 'loading' ? (
        <SkeletonList count={4} />
      ) : state.status === 'error' ? (
        <ErrorState onRetry={() => { setState((p) => ({ ...p, status: 'loading' })); fetchPage(1, true); }} />
      ) : state.items.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="You're not following anyone yet"
          subtitle="Follow contributors from a story page or the Leaderboard to see them here."
          action={{ label: 'Browse Leaderboard', onPress: () => navigation.navigate('Main', { screen: 'LeaderboardTab' }) }}
        />
      ) : (
        <>
          {state.items.map((u) => (
            <Card key={u._id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 }}
                accessibilityLabel={`Open ${u.name}'s profile`}
                onPress={() => navigation.navigate('PublicProfile', { username: u.username })}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.accentSoft,
                  alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                  border: `${theme.border.width}px solid ${theme.colors.text}`,
                }}>
                  {u.avatar?.url ? (
                    <Image source={{ uri: u.avatar.url }} style={{ width: 44, height: 44 }} />
                  ) : (
                    <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{u.name?.[0]?.toUpperCase()}</Text>
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12, marginRight: 8, minWidth: 0 }}>
                  <Text style={theme.typography.h4} numberOfLines={1}>{u.name}</Text>
                  <Text style={theme.typography.caption} numberOfLines={1}>@{u.username}</Text>
                  <PillBadge label={u.role === 'admin' ? 'Admin' : 'Contributor'} tone="accent" style={{ marginTop: 4 }} />
                </View>
              </TouchableOpacity>
              <FollowButton userId={u._id} initialFollowing={u.isFollowing} />
            </Card>
          ))}
          {state.page < state.pages ? (
            <Button title="Load more" variant="outline" loading={state.loadingMore} onPress={loadMore} style={{ marginTop: 6 }} />
          ) : null}
        </>
      )}
    </Screen>
  );
}
