import React, { forwardRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

// Text input with label, inline error/helper text, optional leading icon and
// a trailing slot (used for the password eye). `secureToggle` adds the eye
// automatically for password fields.
const Input = forwardRef(function Input({
  label, error, helperText, leftIcon, rightSlot, secureToggle = false, secureTextEntry,
  style, containerStyle, inputStyle, multiline, value, onChangeText, onChange, placeholder,
  editable = true, keyboardType, onKeyDown, onSubmitEditing, autoFocus, ...rest
}, ref) {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const secure = secureToggle ? hidden : secureTextEntry;

  const handleChange = (e) => { onChangeText && onChangeText(e.target.value); onChange && onChange(e); };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) onSubmitEditing && onSubmitEditing();
    onKeyDown && onKeyDown(e);
  };

  const fieldStyle = {
    display: 'flex', flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center',
    minHeight: 48, backgroundColor: theme.colors.surface,
    border: `${elevated ? 1 : theme.border.width}px solid ${error ? theme.colors.danger : elevated ? theme.colors.border : theme.colors.text}`,
    borderRadius: theme.radius.md, padding: '0 14px', gap: 8, boxSizing: 'border-box',
    ...style,
  };

  const inputCommon = {
    ref, value: value ?? '', placeholder, disabled: !editable, autoFocus,
    onChange: handleChange, onKeyDown: handleKeyDown,
    style: { flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: theme.colors.text, padding: multiline ? '12px 0' : '11px 0', resize: 'vertical', fontFamily: 'inherit', ...inputStyle },
  };

  return (
    <div style={{ marginBottom: 14, ...containerStyle }}>
      {label ? (
        <label style={{ display: 'block', ...theme.typography.label, textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      ) : null}
      <div style={fieldStyle}>
        {leftIcon ? <Icon name={leftIcon} size={18} color={theme.colors.textMuted} /> : null}
        {multiline ? (
          <textarea rows={4} {...inputCommon} {...rest} />
        ) : (
          <input type={secure ? 'password' : keyboardType === 'email-address' ? 'email' : 'text'} {...inputCommon} {...rest} />
        )}
        {secureToggle ? (
          <button
            type="button"
            onClick={() => setHidden((v) => !v)}
            aria-label={hidden ? 'Show password' : 'Hide password'}
            style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
          >
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.colors.textMuted} />
          </button>
        ) : rightSlot}
      </div>
      {error ? (
        <div role="alert" style={{ ...theme.typography.caption, color: theme.colors.danger, marginTop: 4 }}>{error}</div>
      ) : helperText ? (
        <div style={{ ...theme.typography.caption, marginTop: 4 }}>{helperText}</div>
      ) : null}
    </div>
  );
});

export default Input;
