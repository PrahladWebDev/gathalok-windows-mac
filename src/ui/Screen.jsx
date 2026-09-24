import React from 'react';
import { useTheme } from '../context/ThemeContext';
import IconButton from './IconButton';
import MagicParticles from './MagicParticles';

// The one screen shell every page uses. Desktop counterpart of the RN
// Screen: same header language (title/subtitle/right actions) and the same
// prop surface, minus mobile-only concerns (safe-area insets, floating tab
// bar inset, keyboard avoidance). `onRefresh` — pull-to-refresh on mobile —
// becomes a small refresh button next to the title here.
//
//   <Screen title="Explore" right={<IconButton .../>} onRefresh={refresh}>
export default function Screen({
  title, titleNode, subtitle, right, children, footer,
  refreshing = false, onRefresh, padded = true, style, contentStyle, headerStyle, onScroll, scrollRef,
}) {
  const theme = useTheme();
  const pad = theme.layout.screenPadding;

  const header = (title || titleNode) ? (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: `22px ${pad}px 14px`, gap: 12, ...headerStyle }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {titleNode || (
          <>
            <h1 style={{ margin: 0, ...theme.typography.h1 }}>{title}</h1>
            {subtitle ? <div style={{ ...theme.typography.bodyMuted, marginTop: 2 }}>{subtitle}</div> : null}
          </>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {onRefresh ? (
          <IconButton
            name="refresh-outline"
            label="Refresh"
            variant="soft"
            onPress={onRefresh}
            style={refreshing ? { animation: 'gk-spin 0.8s linear infinite' } : undefined}
          />
        ) : null}
        {right}
      </div>
    </div>
  ) : null;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: theme.colors.bg, ...style }}>
      <MagicParticles />
      <div ref={scrollRef} onScroll={onScroll} style={{ position: 'relative', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {header}
        <div style={{ paddingLeft: padded ? pad : 0, paddingRight: padded ? pad : 0, paddingBottom: 32, ...contentStyle }}>
          {children}
        </div>
      </div>
      {footer}
    </div>
  );
}
