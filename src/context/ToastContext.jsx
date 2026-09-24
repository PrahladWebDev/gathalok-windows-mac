import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { IoCheckmarkCircle, IoAlertCircle, IoInformationCircle } from 'react-icons/io5';
import { useTheme } from './ThemeContext';

const ToastContext = createContext(() => {});

// const toast = useToast(); toast('Saved'); toast('Oops', 'error');
export const useToast = () => useContext(ToastContext);

const ICONS = { success: IoCheckmarkCircle, error: IoAlertCircle, info: IoInformationCircle };

export function ToastProvider({ children }) {
  const theme = useTheme();
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);
  const hideTimer = useRef(null);

  const hide = useCallback(() => {
    setVisible(false);
    hideTimer.current = setTimeout(() => setToast(null), 200);
  }, []);

  const show = useCallback((message, type = 'success', duration = 2600) => {
    if (!message) return;
    clearTimeout(timer.current);
    clearTimeout(hideTimer.current);
    setToast({ message: String(message), type: ICONS[type] ? type : 'info' });
    requestAnimationFrame(() => setVisible(true));
    timer.current = setTimeout(hide, duration);
  }, [hide]);

  const bg = toast?.type === 'error' ? theme.colors.danger : toast?.type === 'info' ? theme.colors.info : theme.colors.accent;
  const fg = toast?.type === 'success' ? theme.colors.onAccent : '#FFFFFF';
  const Icon = toast ? ICONS[toast.type] : null;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', left: '50%', top: 20, zIndex: 3000,
            transform: `translate(-50%, ${visible ? '0' : '-20px'})`,
            opacity: visible ? 1 : 0,
            transition: 'transform 200ms ease, opacity 200ms ease',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', minWidth: 260, maxWidth: 420,
            backgroundColor: bg,
            borderRadius: theme.radius.md,
            border: `${theme.border.width}px solid ${theme.colors.text}`,
            boxShadow: theme.shadow.card,
          }}
        >
          {Icon ? <Icon size={20} color={fg} /> : null}
          <span style={{ ...theme.typography.body, color: fg, fontWeight: 600, flex: 1 }}>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}
