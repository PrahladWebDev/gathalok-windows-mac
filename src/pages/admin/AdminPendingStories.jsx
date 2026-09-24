import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { SkeletonList } from '../../ui/Skeleton';
import ErrorState from '../../ui/ErrorState';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../router/navAdapter';
import api from '../../api/client';
import { getCategory } from '../../data/categories';

function ReviewCard({ story, onReview, navigation }) {
  const theme = useTheme();
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const act = async (status) => {
    setLoading(true);
    await onReview(story._id, status, note);
    setLoading(false);
  };

  return (
    <Card style={{ marginBottom: 14 }}>
      <TouchableOpacity onPress={() => navigation.navigate('StoryDetail', { slug: story.slug })}>
        <Text style={theme.typography.h4}>{story.title}</Text>
        <Text style={{ ...theme.typography.caption, marginTop: 2 }}>
          📍 {story.country} · {getCategory(story.category)?.icon} {getCategory(story.category)?.name}
        </Text>
        <Text style={{ ...theme.typography.small, marginTop: 4 }}>by {story.contributor?.name || 'Unknown'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setExpanded((e) => !e)} style={{ marginTop: 8 }}>
        <Text style={{ ...theme.typography.bodyMuted, color: theme.colors.accent }}>{expanded ? 'Hide preview ▲' : 'Show preview ▼'}</Text>
      </TouchableOpacity>

      {expanded ? (
        <Text style={{ ...theme.typography.bodyMuted, marginTop: 8 }} numberOfLines={6}>{story.shortDescription}</Text>
      ) : null}

      <Input
        placeholder="Admin note (shown to contributor, optional for approve)"
        value={note}
        onChangeText={setNote}
        containerStyle={{ marginTop: 12, marginBottom: 8 }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Button title="✓ Approve" size="sm" onPress={() => act('approved')} loading={loading} style={{ marginRight: 8, marginBottom: 8 }} />
        <Button title="✎ Request Changes" size="sm" variant="outline" onPress={() => act('changes_requested')} loading={loading} style={{ marginRight: 8, marginBottom: 8 }} />
        <Button title="✕ Reject" size="sm" variant="danger" onPress={() => act('rejected')} loading={loading} style={{ marginBottom: 8 }} />
      </View>
    </Card>
  );
}

export default function AdminPendingStories() {
  const toast = useToast();
  const navigation = useNavigation();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/stories', { params: { status: 'pending', limit: 50 } })
      .then((r) => setStories(r.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (id, status, adminNote) => {
    try {
      await api.patch(`/stories/${id}/review`, { status, adminNote });
      setStories((prev) => prev.filter((s) => s._id !== id));
      toast(
        status === 'approved' ? 'Story approved and published.'
          : status === 'rejected' ? 'Story rejected.'
          : 'Changes requested — contributor notified.'
      );
    } catch (err) {
      toast(err.message || 'Failed to update story.', 'error');
    }
  };

  return (
    <Screen title="Pending Stories" subtitle={`${stories.length} awaiting review`}>
      {loading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : stories.length === 0 ? (
        <ErrorState icon="checkmark-circle-outline" title="All caught up" message="No stories are waiting for review." />
      ) : (
        stories.map((s) => <ReviewCard key={s._id} story={s} onReview={handleReview} navigation={navigation} />)
      )}
    </Screen>
  );
}
