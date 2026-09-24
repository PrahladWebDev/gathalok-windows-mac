import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Image } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Chip from '../../ui/Chip';
import Button from '../../ui/Button';
import PillBadge from '../../ui/PillBadge';
import { SkeletonList } from '../../ui/Skeleton';
import ErrorState from '../../ui/ErrorState';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

const ROLE_TONE = { admin: 'accent', contributor: 'info', user: 'neutral' };
const ROLE_OPTIONS = ['user', 'contributor', 'admin'];

// Mirrors the web app's role dropdown: once someone is admin, their role
// can't be changed from here at all — no accidental one-click demotion.
function RolePicker({ user: u, disabled, onPick, theme }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {ROLE_OPTIONS.map((role) => {
        const active = u.role === role;
        return (
          <button
            key={role}
            type="button"
            disabled={disabled}
            onClick={() => !active && onPick(role)}
            style={{
              padding: '5px 8px', borderRadius: theme.radius.pill, marginRight: 4,
              backgroundColor: active ? theme.colors.accent : 'transparent',
              border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
              opacity: disabled && !active ? 0.35 : 1, cursor: disabled ? 'default' : 'pointer',
            }}
          >
            <span style={{
              fontSize: 10, fontWeight: '700', textTransform: 'uppercase',
              color: active ? theme.colors.onAccent : theme.colors.textMuted,
            }}>
              {role === 'contributor' ? 'Contrib.' : role}
            </span>
          </button>
        );
      })}
    </View>
  );
}

export default function AdminUsers() {
  const theme = useTheme();
  const toast = useToast();
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const debounceRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    const params = { limit: 40 };
    if (search) params.search = search;
    if (roleFilter === 'blocked') params.blocked = true;
    else if (roleFilter) params.role = roleFilter;
    api.get('/admin/users', { params })
      .then((r) => setUsers(r.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [load, search]);

  const setRole = async (u, role) => {
    if (u.role === 'admin') return;
    try {
      await api.patch(`/admin/users/${u._id}/role`, { role });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role } : x)));
      toast(`${u.name} is now ${role}.`);
    } catch (err) {
      toast(err.message || 'Failed to update role.', 'error');
    }
  };

  const toggleBlock = async (u) => {
    if (u.role === 'admin') return;
    try {
      const res = await api.patch(`/admin/users/${u._id}/block`);
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isBlocked: res.data.data.isBlocked } : x)));
      toast(res.data.message);
    } catch (err) {
      toast(err.message || 'Failed to update block status.', 'error');
    }
  };

  return (
    <Screen title="Users" subtitle={`${users.length} shown`}>
      <Input placeholder="Search name, username, email…" value={search} onChangeText={setSearch} leftIcon="search-outline" containerStyle={{ marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', marginBottom: 14, flexWrap: 'wrap' }}>
        <Chip label="All" active={!roleFilter} onPress={() => setRoleFilter('')} />
        <Chip label="Contributors" active={roleFilter === 'contributor'} onPress={() => setRoleFilter('contributor')} />
        <Chip label="Admins" active={roleFilter === 'admin'} onPress={() => setRoleFilter('admin')} />
        <Chip label="Blocked" active={roleFilter === 'blocked'} onPress={() => setRoleFilter('blocked')} />
      </View>

      {loading ? (
        <SkeletonList count={6} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : users.length === 0 ? (
        <ErrorState icon="people-outline" title="No users found" />
      ) : (
        users.map((u) => {
          const isSelf = u._id === me?._id;
          const isAdmin = u.role === 'admin';
          return (
            <Card key={u._id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.accentSoft,
                  alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden', flexShrink: 0,
                  border: `${theme.border.width}px solid ${theme.colors.text}`,
                }}>
                  {u.avatar?.url ? (
                    <Image source={{ uri: u.avatar.url }} style={{ width: 42, height: 42 }} />
                  ) : (
                    <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{u.name?.[0]?.toUpperCase()}</Text>
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={theme.typography.h4} numberOfLines={1}>{u.name} {u.isBlocked ? '🚫' : ''}</Text>
                  <Text style={theme.typography.caption} numberOfLines={1}>@{u.username} · {u.storiesWritten || 0} stories</Text>
                </View>
                <PillBadge label={u.role} tone={ROLE_TONE[u.role] || 'neutral'} />
              </View>

              {isSelf ? (
                <Text style={{ ...theme.typography.small, marginTop: 10 }}>This is your own account — manage it from Settings.</Text>
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                  <RolePicker user={u} disabled={isAdmin} onPick={(role) => setRole(u, role)} theme={theme} />
                  <Button
                    title={u.isBlocked ? 'Unblock' : 'Block'}
                    size="sm"
                    variant={u.isBlocked ? 'primary' : 'danger'}
                    disabled={isAdmin}
                    onPress={() => toggleBlock(u)}
                  />
                </View>
              )}
              {isAdmin && !isSelf ? (
                <Text style={{ ...theme.typography.small, marginTop: 8 }}>Admins can't be role-changed or blocked from here.</Text>
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
