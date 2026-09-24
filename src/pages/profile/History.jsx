import React from 'react';
import Screen from '../../ui/Screen';
import MagicalTitle from '../../ui/MagicalTitle';
import StoryCard from '../../ui/StoryCard';
import EmptyState from '../../ui/EmptyState';
import { SkeletonList } from '../../ui/Skeleton';
import ErrorState from '../../ui/ErrorState';
import { useNavigation } from '../../router/navAdapter';
import useFocusedFetch from '../../hooks/useFocusedFetch';
import api from '../../api/client';

export default function History() {
  const navigation = useNavigation();
  const { data: history, status, refreshing, refresh, reload } = useFocusedFetch(
    () => api.get('/users/reading-history').then((r) => r.data.data || []),
    []
  );

  return (
    <Screen titleNode={<MagicalTitle title="Reading History" />} refreshing={refreshing} onRefresh={refresh}>
      {status === 'loading' ? (
        <SkeletonList count={5} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : history.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No reading history yet"
          subtitle="Stories you open will show up here."
          action={{ label: 'Explore stories', onPress: () => navigation.navigate('ExploreTab') }}
        />
      ) : (
        history.map((h, i) => (
          <StoryCard
            key={h.story?._id || i}
            story={h.story}
            size="compact"
            onPress={() => navigation.navigate('StoryDetail', { slug: h.story?.slug })}
          />
        ))
      )}
    </Screen>
  );
}
