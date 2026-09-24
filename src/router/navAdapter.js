// Maps the RN app's React Navigation call patterns — navigation.navigate('X',
// params), navigation.goBack(), navigation.getParent()?.goBack(),
// navigation.push(...) — onto React Router. This is what let every ported
// screen keep calling `navigation.navigate(...)` almost verbatim instead of
// hand-rewriting ~30 screens' worth of routing calls.
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';

function qs(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

// name -> (params) => path
const ROUTES = {
  HomeTab: () => '/',
  ExploreTab: (p) => `/explore${qs(p)}`,
  MapTab: () => '/realms',
  LeaderboardTab: () => '/leaderboard',
  ProfileTab: (p) => (p?.screen ? resolve(p.screen, p.params) : '/profile'),
  ProfileHome: () => '/profile',

  StoryDetail: (p) => `/stories/${encodeURIComponent(p.slug)}`,
  CountryDetail: (p) => `/countries/${encodeURIComponent(p.countryName)}`,
  PublicProfile: (p) => `/u/${encodeURIComponent(p.username)}`,

  Auth: (p) => (p?.screen ? resolve(p.screen, p.params) : '/login'),
  Login: () => '/login',
  Register: () => '/register',
  ForgotPassword: () => '/forgot-password',
  ResetPassword: (p) => `/reset-password/${p?.token || ''}`,
  VerifyEmail: (p) => `/verify-email/${p?.token || ''}`,

  Bookmarks: () => '/profile/bookmarks',
  History: () => '/profile/history',
  Achievements: () => '/profile/achievements',
  Contributions: () => '/profile/contributions',
  Contribute: () => '/profile/contribute',
  ContributeEdit: (p) => `/profile/contribute/${p?.id || ''}`,
  Following: () => '/profile/following',
  Notifications: () => '/profile/notifications',
  Settings: () => '/profile/settings',

  AdminDashboard: () => '/admin',
  AdminPendingStories: () => '/admin/pending',
  AdminReports: () => '/admin/reports',
  AdminUsers: () => '/admin/users',

  Main: (p) => (p?.screen ? resolve(p.screen, p.params) : '/'),
};

function resolve(name, params) {
  if (typeof name === 'string' && name.startsWith('/')) return name + qs(params);
  const fn = ROUTES[name];
  return fn ? fn(params) : '/';
}

// A drop-in replacement for React Navigation's `navigation` prop.
export function useNavigation() {
  const navigate = useNavigate();
  return {
    navigate: (name, params) => navigate(resolve(name, params)),
    push: (name, params) => navigate(resolve(name, params)),
    goBack: () => navigate(-1),
    getParent: () => ({ goBack: () => navigate(-1) }),
  };
}

// A drop-in replacement for React Navigation's `route` prop — merges path
// params (e.g. :slug) with query-string params (e.g. ?category=...) into a
// single `params` object, same shape the RN screens read from.
export function useRoute() {
  const pathParams = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const params = { ...Object.fromEntries(searchParams.entries()), ...pathParams };
  return { params, path: location.pathname };
}
