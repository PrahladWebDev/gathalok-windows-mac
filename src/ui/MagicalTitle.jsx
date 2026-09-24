import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

// Animated wordmark: shimmering gold title sitting on drifting light-waves,
// with twinkling stars around it.
//
// Every effect is clipped/faded to the title area — no hard-edged boxes.
// (The old version used a 180x180 radial-gradient div centred on the whole
// screen width, which showed up as a visible glowing square on every page.)
// Keyframes live in the <style> tag below so this file is self-contained.
const CSS = `
@keyframes gk-wave-slide-a { from { transform: translateX(0); } to { transform: translateX(-120px); } }
@keyframes gk-wave-slide-b { from { transform: translateX(-120px); } to { transform: translateX(0); } }
@keyframes gk-twinkle {
  0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.15) rotate(20deg); }
}
`;

// One wave period is 120px, so sliding by exactly 120px loops seamlessly.
const WAVE_A = 'M0 14 Q30 0 60 14 T120 14 T180 14 T240 14 T300 14 T360 14 T420 14 T480 14 T540 14';
const WAVE_B = 'M0 14 Q30 28 60 14 T120 14 T180 14 T240 14 T300 14 T360 14 T420 14 T480 14 T540 14';

export default function MagicalTitle({ title, subtitle }) {
  const theme = useTheme();
  const gold = theme.gradient?.[0] || theme.colors.accent;
  const goldDeep = theme.gradient?.[1] || theme.colors.accent;

  // Stars scattered around the title (left/top are % of the title area).
  const stars = useMemo(() => ([
    { left: 2, top: 4, size: 10, delay: 0, duration: 2.6 },
    { left: 16, top: 62, size: 7, delay: 0.7, duration: 2.2 },
    { left: 30, top: -8, size: 9, delay: 1.3, duration: 3.0 },
    { left: 47, top: 58, size: 12, delay: 0.3, duration: 2.8 },
    { left: 62, top: 2, size: 8, delay: 1.7, duration: 2.4 },
    { left: 78, top: 60, size: 10, delay: 0.9, duration: 3.2 },
    { left: 92, top: -4, size: 7, delay: 2.1, duration: 2.5 },
  ]), []);

  const fade = 'linear-gradient(to right, transparent 0%, #000 18%, #000 82%, transparent 100%)';

  return (
    <div style={{ position: 'relative', display: 'inline-block', verticalAlign: 'top', paddingTop: 4, paddingBottom: 6 }}>
      <style>{CSS}</style>

      {/* Light waves + stars, sized to the title and softly faded at the edges */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 2, left: -16, width: 'calc(100% + 32px)', minWidth: 300, height: 44,
          pointerEvents: 'none', overflow: 'hidden',
          WebkitMaskImage: fade, maskImage: fade,
        }}
      >
        <svg width="660" height="28" viewBox="0 0 660 28" style={{ position: 'absolute', left: 0, top: 8, animation: 'gk-wave-slide-a 6s linear infinite' }}>
          <path d={WAVE_A} fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
        </svg>
        <svg width="660" height="28" viewBox="0 0 660 28" style={{ position: 'absolute', left: 0, top: 12, animation: 'gk-wave-slide-b 9s linear infinite' }}>
          <path d={WAVE_B} fill="none" stroke={goldDeep} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>

      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, pointerEvents: 'none' }}>
        {stars.map((s, i) => (
          <span
            key={i}
            style={{
              position: 'absolute', left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, lineHeight: 1, color: gold,
              textShadow: `0 0 6px ${gold}`,
              animation: `gk-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <h1
        role="heading"
        style={{
          position: 'relative', margin: 0, letterSpacing: '0.5px',
          ...theme.typography.h1,
          '--gk-shimmer-a': goldDeep, '--gk-shimmer-b': gold, '--gk-shimmer-glow': gold,
          animation: 'gk-shimmer 1.8s ease-in-out infinite',
        }}
      >
        {title}
      </h1>
      {subtitle ? <div style={{ ...theme.typography.bodyMuted, marginTop: 2, position: 'relative' }}>{subtitle}</div> : null}
    </div>
  );
}