import React, { useEffect, useState } from 'react';
import { View, Text, Image } from '../ui/primitives';
import Screen from '../ui/Screen';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PillBadge from '../ui/PillBadge';
import StoryCard from '../ui/StoryCard';
import { SkeletonGrid } from '../ui/Skeleton';
import ErrorState from '../ui/ErrorState';
import Flag from '../ui/Flag';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '../router/navAdapter';
import api from '../api/client';
import { getCountry } from '../data/countries';

export default function CountryDetail() {
  const { params } = useRoute();
  const countryName = decodeURIComponent(params.countryName || '');
  const theme = useTheme();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const country = getCountry(countryName);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get(`/countries/${encodeURIComponent(countryName)}`)
      .then((r) => setData(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [countryName]);

  const otherStories = data?.stories?.filter((s) => !data.featured || s._id !== data.featured._id) || [];

  return (
    <Screen
      titleNode={(
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {country?.code ? <Flag code={country.code} size={34} /> : <Text style={{ fontSize: 26 }}>📍</Text>}
          <View>
            <Text style={{ margin: 0, ...theme.typography.h1 }}>{countryName}</Text>
            <Text style={{ ...theme.typography.bodyMuted, marginTop: 2 }}>Stories from this land</Text>
          </View>
        </View>
      )}
    >
      {loading ? (
        <SkeletonGrid count={6} />
      ) : error || !data ? (
        <ErrorState icon="earth-outline" title="Couldn't load this country" onRetry={load} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', marginBottom: 14 }}>
            <Card style={{ flex: 1, alignItems: 'center', marginRight: 8 }}>
              <Text style={theme.typography.h1}>{data.storyCount}</Text>
              <Text style={theme.typography.caption}>Stories</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text style={theme.typography.h1}>{data.contributors?.length || 0}</Text>
              <Text style={theme.typography.caption}>Contributors</Text>
            </Card>
          </View>

          <Button
            title="Browse All Stories"
            onPress={() => navigation.navigate('Main', { screen: 'ExploreTab', params: { country: countryName } })}
            style={{ marginBottom: 20 }}
          />

          {data.featured ? (
            <>
              <Text style={theme.typography.label}>Most Notable</Text>
              <Text style={{ ...theme.typography.h2, marginBottom: 10 }}>Featured Legend</Text>
              <StoryCard story={data.featured} onPress={() => navigation.navigate('StoryDetail', { slug: data.featured.slug })} />
            </>
          ) : null}

          {otherStories.length ? (
            <>
              <Text style={{ ...theme.typography.h2, marginTop: 8, marginBottom: 10 }}>Stories from {countryName}</Text>
              <View style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {otherStories.slice(0, 6).map((s) => (
                  <StoryCard key={s._id} story={s} onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
                ))}
              </View>
            </>
          ) : !data.featured ? (
            <ErrorState icon="moon-outline" title="No stories yet" message="Be the first to share a legend from here." />
          ) : null}

          {data.contributors?.length > 0 ? (
            <>
              <Text style={{ ...theme.typography.h2, marginTop: 8, marginBottom: 10 }}>Top Contributors</Text>
              {data.contributors.map((u) => (
                <Card key={u._id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.accentSoft,
                    alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden', flexShrink: 0,
                    border: `${theme.border.width}px solid ${theme.colors.text}`,
                  }}>
                    {u.avatar?.url ? (
                      <Image source={{ uri: u.avatar.url }} style={{ width: 40, height: 40 }} />
                    ) : (
                      <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{u.name?.[0]?.toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={theme.typography.h4}>{u.name}</Text>
                  </View>
                  <PillBadge label={`${u.storiesWritten || 0} stories`} tone="accent" />
                </Card>
              ))}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}
