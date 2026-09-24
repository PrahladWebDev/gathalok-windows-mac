import React from 'react';
import { View, Text } from '../ui/primitives';
import Screen from '../ui/Screen';
import MagicalTitle from '../ui/MagicalTitle';
import Card from '../ui/Card';
import PillBadge from '../ui/PillBadge';
import Flag from '../ui/Flag';
import { SkeletonGrid } from '../ui/Skeleton';
import ErrorState from '../ui/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../router/navAdapter';
import useFocusedFetch from '../hooks/useFocusedFetch';
import api from '../api/client';
import { COUNTRIES } from '../data/countries';

// Tile-grid "map" instead of a literal geographic map — every country as a
// card showing its live story count. No mapping library or API key needed.
export default function MapPage() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { data: counts, status, refreshing, refresh, reload } = useFocusedFetch(
    () => api.get('/countries/stats').then((r) => {
      const map = {};
      (r.data.data || []).forEach((row) => { map[row._id] = row.storyCount; });
      return map;
    }),
    []
  );

  const sorted = [...COUNTRIES].sort((a, b) => ((counts || {})[b.name] || 0) - ((counts || {})[a.name] || 0));

  return (
    <Screen titleNode={<MagicalTitle title="Realms" subtitle="Every region GathaLok has reached" />} refreshing={refreshing} onRefresh={refresh}>
      {status === 'loading' ? (
        <SkeletonGrid count={10} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : (
        <View style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {sorted.map((item) => {
            const count = counts[item.name] || 0;
            return (
              <Card
                key={item.name}
                onPress={() => navigation.navigate('CountryDetail', { countryName: item.name })}
                accessibilityLabel={`${item.name}, ${count} ${count === 1 ? 'tale' : 'tales'}`}
                style={{ alignItems: 'center', padding: '20px 10px', opacity: count ? 1 : 0.55 }}
              >
                <Flag code={item.code} size={40} style={{ marginBottom: 4 }} />
                <Text style={{ ...theme.typography.h4, marginTop: 8, textAlign: 'center' }} numberOfLines={1}>{item.name}</Text>
                <PillBadge
                  label={count ? `${count} ${count === 1 ? 'tale' : 'tales'}` : 'No tales yet'}
                  tone={count ? 'accent' : 'neutral'}
                  style={{ marginTop: 8 }}
                />
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
