import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from '../ui/primitives';
import Screen from '../ui/Screen';
import MagicalTitle from '../ui/MagicalTitle';
import Input from '../ui/Input';
import Chip from '../ui/Chip';
import StoryCard from '../ui/StoryCard';
import ErrorState from '../ui/ErrorState';
import EmptyState from '../ui/EmptyState';
import { SkeletonGrid } from '../ui/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '../router/navAdapter';
import api from '../api/client';
import { CATEGORIES } from '../data/categories';

const SORTS = [
  { value: '-createdAt', label: 'Newest' },
  { value: '-views', label: 'Most Viewed' },
  { value: '-averageRating', label: 'Top Rated' },
  { value: 'title', label: 'A–Z' },
];

export default function Explore() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [search, setSearch] = useState(route.params?.search || '');
  const [category, setCategory] = useState(route.params?.category || '');
  const [country, setCountry] = useState(route.params?.country || '');
  const [tag, setTag] = useState(route.params?.tag || '');
  const [sort, setSort] = useState(route.params?.sort || '-createdAt');
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (route.params?.category !== undefined) setCategory(route.params.category);
    if (route.params?.search !== undefined) setSearch(route.params.search);
    if (route.params?.sort !== undefined) setSort(route.params.sort);
    if (route.params?.country !== undefined) setCountry(route.params.country);
    if (route.params?.tag !== undefined) setTag(route.params.tag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.path, JSON.stringify(route.params)]);

  const fetchStories = useCallback(async (pageNum = 1, append = false, silent = false) => {
    if (append) setLoadingMore(true); else if (!silent) setLoading(true);
    if (!append) setError(false);
    try {
      const params = { page: pageNum, limit: 12, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (country) params.country = country;
      if (tag) params.tag = tag;
      const res = await api.get('/stories', { params });
      setStories((prev) => (append ? [...prev, ...res.data.data] : res.data.data));
      setPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err) {
      if (!append) { setStories([]); setError(true); }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, category, country, tag, sort]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchStories(1, false), search ? 450 : 0);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, country, tag, sort]);

  const loadMore = () => {
    if (loadingMore || loading || page >= pages) return;
    fetchStories(page + 1, true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStories(1, false, true);
    setRefreshing(false);
  };

  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < el.clientHeight * 0.4) loadMore();
  };

  const hasFilters = !!search || !!category || !!country || !!tag || sort !== '-createdAt';
  const clearFilters = () => { setSearch(''); setCategory(''); setCountry(''); setTag(''); setSort('-createdAt'); };

  return (
    <Screen onScroll={handleScroll} refreshing={refreshing} onRefresh={onRefresh}>
      <MagicalTitle title="Explore" subtitle={loading ? 'Searching the archives…' : `${total.toLocaleString()} stories`} />
      <Input
        placeholder="Title, creature, place…"
        value={search}
        onChangeText={setSearch}
        leftIcon="search-outline"
        containerStyle={{ marginBottom: 10 }}
      />
      {country || tag ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {country ? <Chip label={`📍 ${country}`} active onPress={() => setCountry('')} icon="close" /> : null}
          {tag ? <Chip label={`#${tag}`} active onPress={() => setTag('')} icon="close" /> : null}
        </View>
      ) : null}
      <ScrollView horizontal style={{ marginBottom: 10, flexGrow: 0 }}>
        {[{ slug: '', name: 'All' }, ...CATEGORIES].map((item) => (
          <Chip
            key={item.slug || 'all'}
            label={item.icon ? `${item.icon} ${item.name}` : item.name}
            active={category === item.slug}
            onPress={() => setCategory(category === item.slug ? '' : item.slug)}
          />
        ))}
      </ScrollView>
      <ScrollView horizontal style={{ marginBottom: 14, flexGrow: 0 }}>
        {SORTS.map((item) => (
          <Chip key={item.value} small label={item.label} active={sort === item.value} onPress={() => setSort(item.value)} />
        ))}
      </ScrollView>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : stories.length === 0 ? (
        error ? (
          <ErrorState onRetry={() => fetchStories(1, false)} />
        ) : (
          <EmptyState
            icon="moon-outline"
            title="No stories found"
            subtitle={hasFilters ? 'Try adjusting your filters or search for something else.' : 'The archive is quiet for now. Check back soon.'}
            action={hasFilters ? { label: 'Clear filters', onPress: clearFilters } : undefined}
          />
        )
      ) : (
        <>
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {stories.map((item) => (
              <StoryCard key={item._id} story={item} onPress={() => navigation.navigate('StoryDetail', { slug: item.slug })} />
            ))}
          </View>
          {loadingMore ? (
            <View style={{ alignItems: 'center', margin: '16px 0' }}>
              <ActivityIndicator color={theme.colors.accent} />
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}
