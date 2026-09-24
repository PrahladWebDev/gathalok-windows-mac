import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

// Ambient drift of golden dust behind a screen's content — ported from the
// RN Animated version to plain CSS keyframe animations (one <span> per
// mote, randomized position/delay/duration via inline custom properties).
// Only shows for the 'elevated' (GathaLok Gold / mythical) theme, same as
// the original.
export default function MagicParticles({ count = 10 }) {
  const theme = useTheme();

  const motes = useMemo(() => (
    Array.from({ length: count }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${8 + Math.random() * 78}%`,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 4,
      duration: 3.5 + Math.random() * 2.5,
    }))
  ), [count]);

  if (theme.uiStyle !== 'elevated') return null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: 'absolute', left: m.left, top: m.top, width: m.size, height: m.size,
            borderRadius: '50%', backgroundColor: theme.colors.accent,
            animation: `gk-drift ${m.duration}s ease-in-out ${m.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
