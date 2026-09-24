# GathaLok Desktop

A native Windows/macOS/Linux desktop port of the GathaLok React Native app,
built with **React + Electron**. All business logic, API integration, state
management, and app functionality are reused from the original app; every
React Native UI component has been replaced with standard React/HTML/CSS.

## What's the same as the mobile app

- **API client** (`src/api/client.js`) — same endpoints, same auth flow,
  same base-URL override mechanism (now backed by `localStorage` instead of
  AsyncStorage).
- **Auth / Theme / Toast contexts** — same shape, same methods.
- **All 11 themes** (`src/theme/themes.js`), including the "GathaLok Gold"
  elevated theme, ported value-for-value.
- **All 30 screens**, feature-complete: Home, Explore, Realms (Map),
  Leaderboard, Story Detail (with nested comments/replies, ratings, likes,
  bookmarks, reporting), Country Detail, Public Profile, full auth flow
  (login/register/forgot/reset/verify), the full Profile area (Bookmarks
  with collections, Reading History, Achievements, Contributions, the
  3-step Contribute wizard, Following, Notifications, Settings with theme
  picker + avatar upload + password change), and all 4 Admin screens
  (Dashboard, Pending Stories review, Reports, Users).
- **Data files** (`categories.js`, `countries.js`) — copied unchanged.

## What changed for desktop

- **UI primitives** (`src/ui/primitives.jsx`): `View`, `Text`,
  `ScrollView`, `TouchableOpacity`, `Image`, `TextInput` are now plain
  `<div>`/`<span>`/`<button>`/`<input>` elements styled with flexbox — no
  React Native, no react-native-web. They're named the same as their RN
  counterparts purely to keep the diff against the original screens small.
- **Icons**: `Ionicons` → `react-icons/io5`, matched automatically by name
  (`src/ui/Icon.jsx`).
- **Navigation**: React Navigation → `react-router-dom` (HashRouter, so it
  works from a packaged `file://` build with no server). A small adapter
  (`src/router/navAdapter.js`) lets every screen keep calling
  `navigation.navigate('ScreenName', params)` exactly as before.
- **Layout**: the mobile bottom tab bar became a left sidebar
  (`src/ui/AppShell.jsx`) — Home / Explore / Realms / Leaderboard, plus
  Admin for admins, plus the account switcher at the bottom.
- **Device APIs** (`src/utils/desktop.js`):
  - Haptics → no-ops.
  - `expo-image-picker` → a real `<input type="file">`, uploaded directly
    as a `File` via `FormData` (Settings avatar picker, Contribute cover
    image picker).
  - `Share.share` → copies a shareable link to the clipboard.
  - `Linking.openURL` → opens the link in the user's real default browser
    (via Electron's `shell.openExternal`, wired through
    `electron/preload.js`).
  - `Alert.alert` confirmations (delete comment, delete account) → a native
    OS confirm dialog in Electron (falls back to `window.confirm` if run as
    a plain web build).
  - Pull-to-refresh → a refresh button in the page header, plus a silent
    refetch whenever the app window regains focus (the closest desktop
    equivalent of "returning to a screen").
- **Animations**: React Native's `Animated` API → CSS keyframe animations
  (`src/index.css`) for the shimmering title, ambient particles, fade-ins,
  and skeleton loaders. The decorative animated light-wave layer behind the
  `MagicalTitle` wordmark was left out to keep the port focused — everything
  else (glow, shimmer, sparkles) is carried over.
- **Grids**: React Native `FlatList` with `numColumns` → CSS Grid
  (`display: grid; grid-template-columns: repeat(auto-fill, ...)`), which
  also gives you a genuinely responsive multi-column layout as the window
  is resized — something a fixed 2-column mobile grid doesn't need to
  handle.

## Project layout

```
electron/
  main.js       — Electron main process (window, external-link + confirm-dialog IPC)
  preload.js    — contextBridge, exposes window.gathalokDesktop to the renderer
src/
  api/          — axios client (ported)
  context/      — Auth / Theme / Toast providers (ported)
  data/         — categories.js, countries.js (unchanged)
  hooks/        — useFocusedFetch (adapted for the web)
  router/       — navAdapter.js (React Navigation → React Router shim)
  theme/        — themes.js (ported)
  ui/           — primitives.jsx + the component library (Button, Card, Screen, ...)
  utils/        — desktop.js (haptics/share/linking/confirm shims)
  pages/        — every screen, one file per route
  App.jsx       — router + provider tree
  main.jsx      — React entry point
build/
  icon.ico      — Windows app icon (generated from the original app icon)
```

## Running it

```bash
npm install
npm run dev:electron   # Vite dev server + Electron window, with hot reload
```

Or just the web build in a browser (useful for quick UI iteration):

```bash
npm run dev
```

## Building the Windows installer

Building an actual `.exe` requires either a Windows machine or a Linux
machine with **Wine** installed (Wine is what lets `electron-builder`
produce a Windows NSIS installer from Linux/macOS) — this sandbox has
neither, so the installer itself wasn't produced here, but the app has been
built and compiles cleanly (`npm run build` succeeds with zero errors).

**On Windows**, or in CI (e.g. GitHub Actions `windows-latest`):

```bash
npm install
npm run build:win
```

This produces `dist_electron/GathaLok Setup <version>.exe` (a standard NSIS
installer — the user picks an install directory, gets a desktop shortcut
and a Start Menu entry).

If you'd rather not install Wine or use CI, the quickest path is to `npm
install && npm run build:win` directly on a Windows machine — no extra
setup needed beyond Node.js.

## Configuring the API server

Same as the mobile app: the base URL is stored client-side and can be
changed at runtime. There's currently no in-app settings field for it in
this port (the mobile app's server-picker wasn't part of the screens
list) — you can set it once from the DevTools console:

```js
localStorage.setItem('gathalok_api_base_url', 'https://your-api.example.com')
```

then reload. It defaults to `https://api.gathalok.prahladsingh.in`.
