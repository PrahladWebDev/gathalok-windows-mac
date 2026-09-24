import React, { useEffect, useState } from 'react';
import { useNavigation } from '../router/navAdapter';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { haptic } from '../utils/desktop';
import api from '../api/client';

// Follow / Unfollow toggle. Renders nothing for your own account.
// Logged-out clicks route to the login page.
export default function FollowButton({ userId, initialFollowing, onChange, style }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const toast = useToast();
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialFollowing !== undefined) { setFollowing(initialFollowing); return undefined; }
    if (!user || !userId || user._id === userId) return undefined;
    let cancelled = false;
    api.get(`/users/${userId}/follow-status`)
      .then((r) => { if (!cancelled) setFollowing(!!r.data.isFollowing); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [initialFollowing, userId, user]);

  if (!userId || user?._id === userId) return null;

  const toggle = async () => {
    if (!user) { navigation.navigate('Auth', { screen: 'Login' }); return; }
    if (loading) return;
    setLoading(true);
    try {
      const res = following
        ? await api.delete(`/users/${userId}/follow`)
        : await api.post(`/users/${userId}/follow`);
      setFollowing(res.data.isFollowing);
      haptic.success();
      toast(res.data.isFollowing ? 'Following!' : 'Unfollowed');
      onChange?.(res.data.isFollowing, res.data.followersCount);
    } catch (err) {
      haptic.error();
      toast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title={following ? 'Following' : 'Follow'}
      icon={following ? 'checkmark' : 'person-add-outline'}
      variant={following ? 'outline' : 'primary'}
      size="sm"
      loading={loading}
      onPress={toggle}
      accessibilityLabel={following ? 'Unfollow' : 'Follow'}
      style={{ minWidth: 118, ...style }}
    />
  );
}
