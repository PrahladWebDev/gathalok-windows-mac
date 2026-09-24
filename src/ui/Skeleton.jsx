import React from 'react';
import { useTheme } from '../context/ThemeContext';

export function Skeleton({ width = '100%', height = 16, radius, style }) {
  const theme = useTheme();
  return (
    <div
      style={{
        width, height, borderRadius: radius ?? theme.radius.sm,
        backgroundColor: theme.colors.surfaceAlt, animation: 'gk-pulse 1.3s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function ItemCardSkeleton() {
  const theme = useTheme();
  return (
    <div style={{ padding: 10, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, border: `${theme.border.width}px solid ${theme.colors.border}` }}>
      <Skeleton height={undefined} style={{ aspectRatio: '3 / 4' }} radius={theme.radius.sm} />
      <Skeleton width="72%" height={13} style={{ marginTop: 10 }} />
      <Skeleton width="40%" height={11} style={{ marginTop: 6 }} />
    </div>
  );
}

export function SkeletonGrid({ count = 6, style, minColWidth = 170 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}px, 1fr))`, gap: 14, ...style }}>
      {Array.from({ length: count }).map((_, i) => <ItemCardSkeleton key={i} />)}
    </div>
  );
}

export function RowSkeleton({ lines = 2, thumb = 56 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
      <Skeleton width={thumb} height={thumb} radius={14} />
      <div style={{ flex: 1, marginLeft: 12 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} width={i === 0 ? '62%' : '38%'} height={i === 0 ? 14 : 12} style={{ marginTop: i ? 6 : 0 }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5, style, ...rowProps }) {
  return (
    <div style={style}>
      {Array.from({ length: count }).map((_, i) => <RowSkeleton key={i} {...rowProps} />)}
    </div>
  );
}

export function DetailSkeleton() {
  const theme = useTheme();
  return (
    <div>
      <Skeleton height={260} radius={theme.radius.lg} />
      <Skeleton width="70%" height={26} style={{ marginTop: 16 }} />
      <Skeleton width="45%" height={14} style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginTop: 18 }}>
        <Skeleton height={74} radius={theme.radius.lg} style={{ flex: 1 }} />
        <Skeleton height={74} radius={theme.radius.lg} style={{ flex: 1 }} />
        <Skeleton height={74} radius={theme.radius.lg} style={{ flex: 1 }} />
      </div>
      <Skeleton height={48} radius={theme.radius.pill} style={{ marginTop: 20 }} />
      <Skeleton height={48} radius={theme.radius.pill} style={{ marginTop: 10 }} />
    </div>
  );
}
