import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import PillBadge from '../../ui/PillBadge';
import { SkeletonList } from '../../ui/Skeleton';
import ErrorState from '../../ui/ErrorState';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../router/navAdapter';
import api from '../../api/client';

const REASON_LABEL = {
  spam: 'Spam', inaccurate: 'Inaccurate', offensive: 'Offensive', copyright: 'Copyright', other: 'Other',
};

export default function AdminReports() {
  const theme = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/admin/reports')
      .then((r) => setReports(r.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id, status) => {
    try {
      await api.patch(`/admin/reports/${id}`, { status });
      setReports((prev) => prev.filter((r) => r._id !== id));
      toast(status === 'dismissed' ? 'Report dismissed.' : 'Report marked reviewed.');
    } catch (err) {
      toast(err.message || 'Failed to update report.', 'error');
    }
  };

  return (
    <Screen title="Reports" subtitle={`${reports.length} pending`}>
      {loading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : reports.length === 0 ? (
        <ErrorState icon="shield-checkmark-outline" title="No reports pending" message="Nothing flagged by the community right now." />
      ) : (
        reports.map((r) => (
          <Card key={r._id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <PillBadge label={r.targetType} tone="neutral" />
              <PillBadge label={REASON_LABEL[r.reason] || r.reason} tone="danger" />
            </View>
            <TouchableOpacity
              disabled={r.targetType !== 'story' || !r.targetId?.slug}
              onPress={() => r.targetId?.slug && navigation.navigate('StoryDetail', { slug: r.targetId.slug })}
              style={{ marginTop: 10 }}
            >
              <Text style={theme.typography.h4}>{r.targetId?.title || '(content no longer exists)'}</Text>
            </TouchableOpacity>
            <Text style={{ ...theme.typography.caption, marginTop: 4 }}>
              Reported by {r.reporter?.name || 'Unknown'} (@{r.reporter?.username}) on {new Date(r.createdAt).toLocaleDateString()}
            </Text>
            {r.description ? <Text style={{ ...theme.typography.bodyMuted, marginTop: 6 }}>"{r.description}"</Text> : null}
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <Button title="Dismiss" size="sm" variant="outline" onPress={() => resolve(r._id, 'dismissed')} style={{ marginRight: 8 }} />
              <Button title="Mark Reviewed" size="sm" onPress={() => resolve(r._id, 'reviewed')} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
