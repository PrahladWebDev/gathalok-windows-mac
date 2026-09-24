import React from 'react';

// Windows doesn't render regional-indicator flag emoji (🇮🇳 etc.) — it falls
// back to showing the raw two-letter code, which is exactly what showed up
// in testing. This renders a real flag image instead, keyed off the same
// ISO alpha-2 `code` every country in data/countries.js already has.
export default function Flag({ code, size = 24, style, rounded = true }) {
  if (!code) return null;
  const w = size;
  const h = Math.round(size * 0.75);
  return (
    <img
      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w160/${code.toLowerCase()}.png 2x`}
      alt=""
      width={w}
      height={h}
      style={{
        width: w, height: h, objectFit: 'cover', borderRadius: rounded ? 3 : 0,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.15)', display: 'inline-block', flexShrink: 0,
        ...style,
      }}
      // If the flag image can't load (offline etc.), fall back to the
      // country code as plain text rather than a broken image icon.
      onError={(e) => {
        const span = document.createElement('span');
        span.textContent = code;
        span.style.fontSize = '11px';
        span.style.fontWeight = '700';
        e.target.replaceWith(span);
      }}
    />
  );
}
