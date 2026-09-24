// Central theme definitions — ported 1:1 from the RN app's src/theme/themes.js.
// Same shape { colors, radius, spacing, shadow, typography, uiStyle } so the
// desktop UI primitives can swap themes without changing structure. Font
// families now point at real Google Fonts (loaded in index.html) instead of
// Expo font asset names, and `shadow` values are plain CSS box-shadow
// strings instead of RN shadow objects.

const radiusOutline = { sm: 12, md: 18, lg: 28, pill: 999 };
const radiusElevated = { sm: 8, md: 14, lg: 20, pill: 999 };

const borderOutline = { width: 2.5 };
const borderElevated = { width: 1 };

const spacing = (n) => n * 4;

function makeShadow() {
  return {
    card: '0 3px 0 rgba(0,0,0,0.06)',
    subtle: '0 2px 0 rgba(0,0,0,0.04)',
  };
}

function makeElevatedShadow(colors) {
  return {
    card: '0 6px 16px rgba(0,0,0,0.35)',
    subtle: '0 3px 8px rgba(0,0,0,0.25)',
    glow: `0 4px 14px ${hexToRgba(colors.accent, 0.35)}`,
  };
}

function hexToRgba(hex, alpha) {
  if (!hex || hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Whole-app font: Comic Neue everywhere (headings, body and UI), for every
// theme — same as the original RN app. Loaded from Google Fonts in index.html;
// 'Comic Sans MS' is the fallback if the web font can't load (offline).
// To switch fonts later, change APP_FONT only. (Per-theme `fonts` below are
// now ignored except for `uppercaseUI`.)
export const APP_FONT = "'Comic Neue', 'Comic Sans MS', 'Comic Sans', cursive";

function makeTypography(colors, fonts = {}) {
  const display = APP_FONT;
  const h2Font = APP_FONT;
  const h3h4Font = APP_FONT;
  const body = APP_FONT;
  const ui = APP_FONT;
  const uiCase = fonts.uppercaseUI ? 'uppercase' : 'none';
  const uiTracking = fonts.uppercaseUI ? '0.6px' : '0.4px';
  const weight = (bold) => (bold ? 700 : 400);
  return {
    display: { fontFamily: display, fontSize: 32, color: colors.text, letterSpacing: '-0.2px', fontWeight: 700 },
    h1: { fontFamily: display, fontSize: 28, color: colors.text, letterSpacing: '-0.2px', fontWeight: 700 },
    h2: { fontFamily: h2Font, fontSize: 21, color: colors.text, fontWeight: 600 },
    h3: { fontFamily: h3h4Font, fontSize: 17, fontWeight: 700, color: colors.text },
    body: { fontFamily: body, fontSize: 15, fontWeight: 400, color: colors.text },
    bodyMuted: { fontFamily: body, fontSize: 14, fontWeight: 400, color: colors.textMuted },
    label: { fontFamily: ui, fontSize: 12, fontWeight: 600, color: colors.textMuted, letterSpacing: uiTracking, textTransform: uiCase },
    button: { fontFamily: ui, fontSize: 15, fontWeight: 700, letterSpacing: fonts.uppercaseUI ? '0.5px' : 0, textTransform: uiCase },
    h4: { fontFamily: h3h4Font, fontSize: 15, fontWeight: 700, color: colors.text },
    caption: { fontFamily: ui, fontSize: 12, fontWeight: 400, color: colors.textMuted },
    small: { fontFamily: ui, fontSize: 11, fontWeight: 600, color: colors.textMuted, letterSpacing: uiTracking },
  };
}

const layout = { screenPadding: 24, headerHeight: 64, sidebarWidth: 240 };
const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

function build(id, name, mode, colors, extra = {}) {
  const uiStyle = extra.uiStyle || 'outline';
  const elevated = uiStyle === 'elevated';
  return {
    id,
    name,
    mode,
    uiStyle,
    colors,
    radius: elevated ? radiusElevated : radiusOutline,
    border: elevated ? borderElevated : borderOutline,
    spacing,
    layout,
    hitSlop,
    shadow: elevated ? makeElevatedShadow(colors) : makeShadow(),
    typography: makeTypography(colors, extra.fonts),
    gradient: extra.gradient || [colors.accent, colors.accent],
  };
}

const warmLight = build('warmLight', 'Warm Sand', 'light', {
  bg: '#FBF7F0', surface: '#FFFFFF', surfaceAlt: '#F1ECE2', border: '#E7E0D2', text: '#20201D',
  textMuted: '#7A7468', textFaint: '#A8A192', accent: '#C1633B', accentSoft: '#F1D9CC',
  success: '#4C7A5C', successSoft: '#DEEBE1', danger: '#B84B4B', dangerSoft: '#F5DEDE',
  info: '#3E6E8C', infoSoft: '#DCE9F0', black: '#000000', onAccent: '#FFFFFF',
}, { gradient: ['#C1633B', '#D98A5F'] });

const midnight = build('midnight', 'Midnight Gold', 'dark', {
  bg: '#0F1115', surface: '#1A1D24', surfaceAlt: '#22262F', border: '#2E323C', text: '#F3F1EA',
  textMuted: '#A6ABB8', textFaint: '#6C7280', accent: '#D4AF6A', accentSoft: '#3A331F',
  success: '#6FBF8B', successSoft: '#1D2E22', danger: '#E2726B', dangerSoft: '#3A2222',
  info: '#7FB3D5', infoSoft: '#1E2C36', black: '#000000', onAccent: '#1A1508',
}, { gradient: ['#D4AF6A', '#8A6E36'] });

const roseQuartz = build('roseQuartz', 'Rose Quartz', 'light', {
  bg: '#FBF4F5', surface: '#FFFFFF', surfaceAlt: '#F6E9EC', border: '#EED9DE', text: '#2B1F24',
  textMuted: '#8A6E76', textFaint: '#BBA0A7', accent: '#A24E68', accentSoft: '#F1D6DE',
  success: '#5C8A6F', successSoft: '#E2EFE6', danger: '#B94A4A', dangerSoft: '#F6DEDE',
  info: '#5A7599', infoSoft: '#E1E9F1', black: '#000000', onAccent: '#FFFFFF',
}, { gradient: ['#A24E68', '#C97C93'] });

const emeraldNoir = build('emeraldNoir', 'Emerald Noir', 'dark', {
  bg: '#0D1512', surface: '#16211C', surfaceAlt: '#1D2B24', border: '#28382F', text: '#EDF3EF',
  textMuted: '#9FB3A9', textFaint: '#647A6E', accent: '#4FA37B', accentSoft: '#1D3428',
  success: '#4FA37B', successSoft: '#1D3428', danger: '#DD7A6E', dangerSoft: '#3A2420',
  info: '#7AAFC2', infoSoft: '#1C2E35', black: '#000000', onAccent: '#08140E',
}, { gradient: ['#4FA37B', '#2E6B54'] });

const slate = build('slate', 'Slate Minimal', 'light', {
  bg: '#F5F6F8', surface: '#FFFFFF', surfaceAlt: '#ECEEF2', border: '#DEE1E7', text: '#1B1E24',
  textMuted: '#5F6673', textFaint: '#9AA1AD', accent: '#3A5AE0', accentSoft: '#DDE4FB',
  success: '#3E9B6B', successSoft: '#DFF1E7', danger: '#D14F4F', dangerSoft: '#FADEDE',
  info: '#3A5AE0', infoSoft: '#DDE4FB', black: '#000000', onAccent: '#FFFFFF',
}, { gradient: ['#3A5AE0', '#6C8AF0'] });

const creamInk = build('creamInk', 'Cream Ink', 'light', {
  bg: '#F7F1E4', surface: '#FFFFFF', surfaceAlt: '#EFE6D3', border: '#14151A', text: '#14151A',
  textMuted: '#5B5A55', textFaint: '#8E8C82', accent: '#5B4FE0', accentSoft: '#F3DCC0',
  success: '#3E8A5C', successSoft: '#DCEFE1', danger: '#C33D6F', dangerSoft: '#F7D8E4',
  info: '#3A5AE0', infoSoft: '#DDE4FB', black: '#000000', onAccent: '#FFFFFF',
}, { gradient: ['#5B4FE0', '#8B7FF0'] });

const sunsetClay = build('sunsetClay', 'Sunset Clay', 'light', {
  bg: '#FDF6ED', surface: '#FFFFFF', surfaceAlt: '#F5E9D8', border: '#E9D6B8', text: '#2B2117',
  textMuted: '#8A7650', textFaint: '#B8A98E', accent: '#E08A3E', accentSoft: '#FBE3C4',
  success: '#5C8A50', successSoft: '#E4EFDC', danger: '#C2543D', dangerSoft: '#F7DCD2',
  info: '#C99A32', infoSoft: '#F5EBCB', black: '#000000', onAccent: '#FFFFFF',
}, { gradient: ['#E08A3E', '#F2B15E'] });

const obsidianInk = build('obsidianInk', 'Obsidian Ink', 'dark', {
  bg: '#0A0A0D', surface: '#141419', surfaceAlt: '#1C1C24', border: '#2A2A34', text: '#F0EFF5',
  textMuted: '#9C9BAA', textFaint: '#68677A', accent: '#8B7CF6', accentSoft: '#2A2445',
  success: '#5FBF8F', successSoft: '#1B2E24', danger: '#E2666B', dangerSoft: '#3A2224',
  info: '#6FA8DC', infoSoft: '#1E2C38', black: '#000000', onAccent: '#100C24',
}, { gradient: ['#8B7CF6', '#5A4FC7'] });

const oceanMist = build('oceanMist', 'Ocean Mist', 'light', {
  bg: '#F2F8F8', surface: '#FFFFFF', surfaceAlt: '#E4F0EF', border: '#CFE4E2', text: '#132B2C',
  textMuted: '#5C7B7C', textFaint: '#93AFAF', accent: '#1D8A8A', accentSoft: '#D3ECEA',
  success: '#3E9B6B', successSoft: '#DDF1E6', danger: '#C24F4F', dangerSoft: '#F6DCDC',
  info: '#2D6E9E', infoSoft: '#DBE9F2', black: '#000000', onAccent: '#FFFFFF',
}, { gradient: ['#1D8A8A', '#3FB3AE'] });

const crimsonNoir = build('crimsonNoir', 'Crimson Noir', 'dark', {
  bg: '#120D0D', surface: '#1C1414', surfaceAlt: '#241A1A', border: '#362424', text: '#F5EBEA',
  textMuted: '#B3938F', textFaint: '#785F5C', accent: '#D9455A', accentSoft: '#3A1F24',
  success: '#5FA87A', successSoft: '#1E2E23', danger: '#E2666B', dangerSoft: '#3A2224',
  info: '#7FA8C9', infoSoft: '#1E2A34', black: '#000000', onAccent: '#FFFFFF',
}, { gradient: ['#D9455A', '#8C2C3A'] });

const gathalok = build('gathalok', 'GathaLok Gold', 'dark', {
  bg: '#0D0A1A', surface: '#231B3A', surfaceAlt: '#2D2450', border: 'rgba(183, 140, 62, 0.3)', text: '#F0EAD6',
  textMuted: '#C8C0A8', textFaint: '#7A7090', accent: '#B78C3E', accentSoft: 'rgba(183, 140, 62, 0.15)',
  success: '#6FBF8B', successSoft: 'rgba(111, 191, 139, 0.15)', danger: '#A52020', dangerSoft: 'rgba(165, 32, 32, 0.15)',
  info: '#D4660A', infoSoft: 'rgba(212, 102, 10, 0.15)', black: '#000000', onAccent: '#1A1508',
}, {
  gradient: ['#E8C97A', '#B78C3E'],
  uiStyle: 'elevated',
  fonts: {
    display: "'Cinzel', serif",
    h2: "'Cinzel', serif",
    h3h4: "'Cinzel', serif",
    body: "'Lora', serif",
    ui: "'Inter', sans-serif",
    uppercaseUI: true,
  },
});

export const themes = {
  gathalok, creamInk, warmLight, midnight, roseQuartz, emeraldNoir, slate, sunsetClay, obsidianInk, oceanMist, crimsonNoir,
};

export const themeList = Object.values(themes).map((t) => ({
  id: t.id, name: t.name, mode: t.mode, accent: t.colors.accent, onAccent: t.colors.onAccent, bg: t.colors.bg, surface: t.colors.surface,
}));

export const DEFAULT_THEME_ID = 'gathalok';
export { hexToRgba };