import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

// Read-only: <Stars value={story.averageRating} />
// Interactive: <Stars value={userRating} interactive onRate={setRating} />
export default function Stars({ value = 0, size = 15, interactive = false, onRate, style }) {
  const theme = useTheme();
  const rounded = Math.round(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', ...style }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= rounded;
        const icon = filled ? 'star' : 'star-outline';
        if (!interactive) {
          return <span key={i} style={{ marginRight: 2, display: 'flex' }}><Icon name={icon} size={size} color={theme.colors.accent} /></span>;
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onRate && onRate(i)}
            aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
            className="gk-touchable"
            style={{ background: 'none', border: 'none', padding: 2, marginRight: 2, cursor: 'pointer', display: 'flex' }}
          >
            <Icon name={icon} size={size} color={theme.colors.accent} />
          </button>
        );
      })}
    </div>
  );
}
