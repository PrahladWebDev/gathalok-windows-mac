// Small desktop-platform shims replacing the RN app's device APIs
// (expo-haptics, Linking, Share, Alert) with web/Electron equivalents.

// No haptic engine on desktop — every call in the ported screens becomes a
// safe no-op instead of being stripped out, so the call sites didn't need editing.
export const haptic = {
  select: () => {},
  light: () => {},
  medium: () => {},
  success: () => {},
  warning: () => {},
  error: () => {},
};

// Opens a URL in the user's real default browser when running inside
// Electron (via the preload bridge); falls back to a new browser tab when
// running the plain web build (`npm run dev` / a browser preview).
export function openExternal(url) {
  if (!url) return;
  if (window.gathalokDesktop?.openExternal) {
    window.gathalokDesktop.openExternal(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Native OS confirm dialog in Electron; falls back to window.confirm in a
// plain browser. Returns a Promise<boolean>.
export async function confirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false } = {}) {
  if (window.gathalokDesktop?.confirm) {
    return window.gathalokDesktop.confirm({ title, message, confirmLabel, cancelLabel, destructive });
  }
  return window.confirm(`${title ? title + '\n\n' : ''}${message || ''}`);
}

// Replaces RN's Share.share — desktop has no native share sheet, so this
// copies a shareable "Title — url" string to the clipboard.
export async function shareLink({ title, text, url }) {
  const payload = [title, text, url].filter(Boolean).join('\n\n');
  try {
    await navigator.clipboard.writeText(payload);
    return true;
  } catch (err) {
    return false;
  }
}
