// Small, plain-web layout primitives used throughout the ported screens.
// These are ordinary <div>/<span>/<button>/<input> elements styled with
// flexbox — no react-native-web, no native runtime. They're named after
// their React Native counterparts (View/Text/TouchableOpacity/...) purely
// so the screen code below reads close to the original app and is easy to
// diff against it; every one of them renders standard DOM/CSS.
import React from 'react';

function flatten(style) {
  if (!style) return undefined;
  if (Array.isArray(style)) return Object.assign({}, ...style.filter(Boolean).map(flatten));
  return style;
}

export const View = React.forwardRef(function View({ style, children, ...rest }, ref) {
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0, ...flatten(style) }} {...rest}>
      {children}
    </div>
  );
});

export const Text = React.forwardRef(function Text({ style, children, numberOfLines, ...rest }, ref) {
  const clamp = numberOfLines
    ? { display: '-webkit-box', WebkitLineClamp: numberOfLines, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }
    : {};
  return (
    <span ref={ref} style={{ display: 'block', boxSizing: 'border-box', ...flatten(style), ...clamp }} {...rest}>
      {children}
    </span>
  );
});

export function ScrollView({ style, contentContainerStyle, horizontal, children, ...rest }) {
  return (
    <div
      style={{
        overflowX: horizontal ? 'auto' : 'hidden',
        overflowY: horizontal ? 'hidden' : 'auto',
        boxSizing: 'border-box',
        ...flatten(style),
      }}
      {...rest}
    >
      <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', ...flatten(contentContainerStyle) }}>
        {children}
      </div>
    </div>
  );
}

export const TouchableOpacity = React.forwardRef(function TouchableOpacity(
  { style, onPress, onClick, children, disabled, accessibilityRole, accessibilityLabel, accessibilityState, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={disabled ? undefined : (onPress || onClick)}
      disabled={disabled}
      aria-label={accessibilityLabel}
      className="gk-touchable"
      style={{
        display: 'flex', flexDirection: 'column', background: 'none', border: 'none', padding: 0, margin: 0,
        textAlign: 'inherit', font: 'inherit', color: 'inherit', boxSizing: 'border-box',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
        ...flatten(style),
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export function Image({ source, style, alt = '', ...rest }) {
  const src = typeof source === 'string' ? source : source?.uri;
  const flat = flatten(style);
  return <img src={src} alt={alt} style={{ display: 'block', objectFit: 'cover', ...flat }} {...rest} />;
}

export const TextInput = React.forwardRef(function TextInput(
  { style, value, onChangeText, onChange, placeholder, multiline, secureTextEntry, keyboardType, editable = true, rows, ...rest },
  ref
) {
  const common = {
    ref,
    value: value ?? '',
    placeholder,
    disabled: !editable,
    onChange: (e) => { onChangeText && onChangeText(e.target.value); onChange && onChange(e); },
    style: { border: 'none', outline: 'none', background: 'transparent', font: 'inherit', color: 'inherit', width: '100%', resize: 'vertical', ...flatten(style) },
  };
  if (multiline) return <textarea rows={rows || 4} {...common} {...rest} />;
  const type = secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : 'text';
  return <input type={type} {...common} {...rest} />;
});

export function ActivityIndicator({ size = 20, color = 'currentColor', style }) {
  const px = size === 'small' ? 16 : size === 'large' ? 32 : size;
  return (
    <span
      style={{
        display: 'inline-block', width: px, height: px, borderRadius: '50%',
        border: `2px solid ${color}33`, borderTopColor: color,
        animation: 'gk-spin 0.7s linear infinite', ...flatten(style),
      }}
    />
  );
}
