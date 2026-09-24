import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, Image } from './primitives';
import Card from './Card';
import PillBadge from './PillBadge';
import Stars from './Stars';
import { getCategory } from '../data/categories';

// size: 'normal' (grid card, default) | 'compact' (horizontal list row)
export default function StoryCard({ story, size = 'normal', onPress }) {
  const theme = useTheme();
  if (!story) return null;

  const placeholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(story.title)}&size=400&background=1E1736&color=B78C3E&bold=true&length=2`;
  const category = getCategory(story.category);

  if (size === 'compact') {
    return (
      <Card onPress={onPress} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 10 }}>
        <Image source={{ uri: story.coverImage?.url || placeholder }} style={{ width: 64, height: 64, borderRadius: theme.radius.sm, flexShrink: 0 }} />
        <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
          <Text style={theme.typography.h4} numberOfLines={2}>{story.title}</Text>
          <Text style={{ ...theme.typography.caption, marginTop: 4 }} numberOfLines={1}>📍 {story.country}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Stars value={story.averageRating || 0} size={12} />
            <Text style={{ ...theme.typography.small, marginLeft: 6 }}>
              {story.averageRating ? story.averageRating.toFixed(1) : 'Unrated'}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} style={{ padding: 10, marginBottom: 14 }}>
      <View style={{ borderRadius: theme.radius.md, overflow: 'hidden', position: 'relative', aspectRatio: '4 / 3' }}>
        <Image source={{ uri: story.coverImage?.url || placeholder }} style={{ width: '100%', height: '100%' }} />
        {story.isFeatured ? (
          <PillBadge label="⭐ Featured" tone="accent" style={{ position: 'absolute', top: 8, left: 8 }} />
        ) : null}
        {category ? (
          <span style={{
            position: 'absolute', bottom: 8, left: 8, padding: '3px 8px', borderRadius: theme.radius.pill,
            backgroundColor: category.color, fontSize: 10, fontWeight: 700, color: '#FFFFFF',
          }}>
            {category.icon} {category.name}
          </span>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Text style={theme.typography.caption} numberOfLines={1}>📍 {story.country}</Text>
        <Text style={theme.typography.caption}>👁 {story.views?.toLocaleString() || 0}</Text>
      </View>

      <Text style={{ ...theme.typography.h3, marginTop: 6 }} numberOfLines={2}>{story.title}</Text>

      <Text style={{ ...theme.typography.bodyMuted, marginTop: 4 }} numberOfLines={2}>
        {story.shortDescription}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Stars value={story.averageRating || 0} size={13} />
          <Text style={{ ...theme.typography.small, marginLeft: 6 }}>
            {story.averageRating ? story.averageRating.toFixed(1) : 'Unrated'}
          </Text>
        </View>
        {story.contributor ? (
          <Text style={theme.typography.small} numberOfLines={1}>
            by {story.contributor.name || story.contributor.username}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
