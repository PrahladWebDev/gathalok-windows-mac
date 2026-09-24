import React, { useCallback, useEffect, useState } from 'react';
import { View, Text } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import MagicalTitle from '../../ui/MagicalTitle';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';
import { SkeletonGrid } from '../../ui/Skeleton';
import ErrorState from '../../ui/ErrorState';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '../../router/navAdapter';
import api from '../../api/client';

function StatCard({ label, value, theme }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 10px' }}>
      <Text style={theme.typography.h1}>{value}</Text>
      <Text style={{ ...theme.typography.caption, textAlign: 'center', marginTop: 4 }}>{label}</Text>
    </Card>
  );
}

function MenuRow({ icon, label, sub, onPress, theme }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="gk-touchable"
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '14px 0', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
    >
      <span style={{ width: 28, display: 'flex' }}><Icon name={icon} size={20} color={theme.colors.accent} /></span>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={theme.typography.body}>{label}</Text>
        {sub ? <Text style={theme.typography.caption}>{sub}</Text> : null}
      </View>
      <Icon name="chevron-forward" size={18} color={theme.colors.textFaint} />
    </button>
  );
}

export default function AdminDashboard() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/admin/analytics')
      .then((r) => setData(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen titleNode={<MagicalTitle title="Admin Dashboard" subtitle="Moderation and platform overview" />} refreshing={loading} onRefresh={load}>
      {loading ? (
        <SkeletonGrid count={4} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <>
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            <StatCard label="Total Stories" value={data.totalStories} theme={theme} />
            <StatCard label="Approved" value={data.totalApproved} theme={theme} />
            <StatCard label="Pending Review" value={data.totalPending} theme={theme} />
            <StatCard label="Active Users" value={data.totalUsers} theme={theme} />
          </View>

          <Card style={{ marginBottom: 20 }}>
            <Text style={{ ...theme.typography.h4, marginBottom: 8 }}>Highlights</Text>
            <Text style={theme.typography.bodyMuted}>👁 {data.totalViews?.toLocaleString() || 0} total views across approved stories</Text>
            <Text style={theme.typography.bodyMuted}>🌍 Top country: {data.topCountry}</Text>
            <Text style={theme.typography.bodyMuted}>🏷 Top category: {data.topCategory}</Text>
            {data.topStory ? <Text style={theme.typography.bodyMuted}>🔥 Top story: {data.topStory.title} ({data.topStory.views} views)</Text> : null}
            {data.topContributor ? <Text style={theme.typography.bodyMuted}>✍️ Top contributor: {data.topContributor.name} ({data.topContributor.storiesWritten} stories)</Text> : null}
          </Card>

          <Card style={{ padding: '4px 16px' }}>
            <MenuRow icon="hourglass-outline" label="Pending Stories" sub={`${data.totalPending} awaiting review`} onPress={() => navigation.navigate('AdminPendingStories')} theme={theme} />
            <MenuRow icon="flag-outline" label="Reports" sub="User-flagged stories & comments" onPress={() => navigation.navigate('AdminReports')} theme={theme} />
            <MenuRow icon="people-outline" label="Users" sub="Roles & blocking" onPress={() => navigation.navigate('AdminUsers')} theme={theme} />
          </Card>
        </>
      )}
    </Screen>
  );
}