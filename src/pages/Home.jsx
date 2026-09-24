import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView } from '../ui/primitives';
import Screen from '../ui/Screen';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StoryCard from '../ui/StoryCard';
import { SkeletonList } from '../ui/Skeleton';
import ErrorState from '../ui/ErrorState';
import FadeInUp from '../ui/FadeInUp';
import MagicalTitle from '../ui/MagicalTitle';
import Flag from '../ui/Flag';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../router/navAdapter';
import api from '../api/client';
import { CATEGORIES } from '../data/categories';
import { COUNTRIES } from '../data/countries';

function SectionHeader({ label, title, onPress, actionLabel = 'View all' }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
      <View>
        <Text style={theme.typography.label}>{label}</Text>
        <Text style={theme.typography.h2}>{title}</Text>
      </View>
      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          aria-label={`${actionLabel}: ${title}`}
          className="gk-touchable"
          style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}
        >
          <Text style={{ ...theme.typography.body, color: theme.colors.accent, fontWeight: '700' }}>{actionLabel} →</Text>
        </button>
      ) : null}
    </View>
  );
}

export default function Home() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [featRes, recentRes] = await Promise.all([
        api.get('/stories/featured'),
        api.get('/stories', { params: { limit: 6, sort: '-createdAt' } }),
      ]);
      setFeatured(featRes.data.data || []);
      setRecent(recentRes.data.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!featured.length) return undefined;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % Math.min(featured.length, 5)), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

  const onRefresh = () => { setRefreshing(true); load(); };
  const heroStory = featured[heroIdx] || featured[0];

  if (loading) {
    return (
      <Screen titleNode={<MagicalTitle title="GathaLok" subtitle="Living archive of world folklore" />}>
        <SkeletonList count={4} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen titleNode={<MagicalTitle title="GathaLok" />} refreshing={refreshing} onRefresh={onRefresh}>
        <ErrorState message="Couldn't reach the archive. Check your server connection in Settings." onRetry={load} />
      </Screen>
    );
  }

  return (
    <Screen titleNode={<MagicalTitle title="GathaLok" subtitle="Living archive of world folklore" />} refreshing={refreshing} onRefresh={onRefresh}>
      {heroStory ? (
        <FadeInUp distance={14}>
          <Card onPress={() => navigation.navigate('StoryDetail', { slug: heroStory.slug })} accessibilityLabel={`Featured story: ${heroStory.title}`} style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
            <img
              src={heroStory.coverImage?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(heroStory.title)}&size=600&background=1E1736&color=B78C3E`}
              alt=""
              style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
            />
            <View style={{ padding: 14 }}>
              <Text style={theme.typography.label}>✦ Featured</Text>
              <Text style={theme.typography.h2} numberOfLines={2}>{heroStory.title}</Text>
              <Text style={{ ...theme.typography.bodyMuted, marginTop: 4 }} numberOfLines={2}>{heroStory.shortDescription}</Text>
            </View>
            {featured.length > 1 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: 12 }}>
                {featured.slice(0, 5).map((_, i) => (
                  <span key={i} style={{
                    width: i === heroIdx ? 16 : 6, height: 6, borderRadius: 3, margin: '0 3px',
                    backgroundColor: i === heroIdx ? theme.colors.accent : theme.colors.border,
                  }} />
                ))}
              </View>
            ) : null}
          </Card>
        </FadeInUp>
      ) : null}

      {recent.length > 0 ? (
        <>
          <SectionHeader label="Fresh from the Archives" title="Recently Added" onPress={() => navigation.navigate('ExploreTab', { sort: '-createdAt' })} />
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 10 }}>
            {recent.map((s) => (
              <StoryCard key={s._id} story={s} onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader label="Explore by Region" title="Journey Across the World" onPress={() => navigation.navigate('MapTab')} actionLabel="View Realms" />
      <ScrollView horizontal style={{ marginBottom: 24 }} contentContainerStyle={{ paddingBottom: 4 }}>
        {COUNTRIES.slice(0, 8).map((item) => (
          <Card key={item.name} onPress={() => navigation.navigate('CountryDetail', { countryName: item.name })} style={{ marginRight: 10, alignItems: 'center', width: 108, padding: '18px 10px', flexShrink: 0 }}>
            <Flag code={item.code} size={38} />
            <Text style={{ ...theme.typography.h4, marginTop: 8, textAlign: 'center' }} numberOfLines={1}>{item.name}</Text>
          </Card>
        ))}
      </ScrollView>

      <SectionHeader label="Discover" title="Browse by Category" />
      <View style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
        {CATEGORIES.map((cat) => (
          <Card
            key={cat.slug}
            onPress={() => navigation.navigate('ExploreTab', { category: cat.slug })}
            style={{ alignItems: 'center', padding: '16px 10px' }}
          >
            <Text style={{ fontSize: 26 }}>{cat.icon}</Text>
            <Text style={{ ...theme.typography.small, marginTop: 6, textAlign: 'center', textTransform: 'none', fontSize: 12 }} numberOfLines={2}>
              {cat.name}
            </Text>
          </Card>
        ))}
      </View>

      <Card style={{ alignItems: 'center', padding: '28px 20px', marginTop: 4 }}>
        <Text style={{ fontSize: 22 }}>✦</Text>
        <Text style={{ ...theme.typography.h2, textAlign: 'center', marginTop: 8, whiteSpace: 'pre-line' }}>
          {'Your village has a story\nthe world should hear.'}
        </Text>
        <Text style={{ ...theme.typography.bodyMuted, textAlign: 'center', marginTop: 8, marginBottom: 18 }}>
          Help preserve oral heritage from around the world before the last teller falls silent.
        </Text>
        {user ? (
          <Button title="Share Your Story" onPress={() => navigation.navigate('ProfileTab', { screen: 'Contribute' })} />
        ) : (
          <Button title="Create Free Account" onPress={() => navigation.navigate('Auth', { screen: 'Register' })} />
        )}
      </Card>
    </Screen>
  );
}
