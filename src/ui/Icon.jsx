import React from 'react';
import * as Io5 from 'react-icons/io5';

// The RN app used <Ionicons name="chevron-back" .../> everywhere. react-icons'
// Io5 set mirrors Ionicons 5/7 one-for-one, just as PascalCase components
// prefixed with "Io" (e.g. "chevron-back" -> IoChevronBack). This converts
// the kebab-case name used throughout the ported screens into that export
// name, so every existing `icon="..."` prop kept working unchanged.
function toComponentName(name) {
  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return `Io${pascal}`;
}

export default function Icon({ name, size = 20, color = 'currentColor', style }) {
  if (!name) return null;
  const Cmp = Io5[toComponentName(name)] || Io5.IoEllipseOutline;
  return <Cmp size={size} color={color} style={style} />;
}
