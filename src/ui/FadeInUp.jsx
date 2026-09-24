import React from 'react';

// Fades + slides its children up into place on mount, via a plain CSS
// keyframe animation. Stagger multiple instances with an increasing `delay`
// (ms) so a screen's elements settle in one after another.
export default function FadeInUp({ children, delay = 0, distance = 18, duration = 520, style }) {
  return (
    <div
      style={{
        animation: `gk-fade-up ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`,
        '--gk-fade-distance': `${distance}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
