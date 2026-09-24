import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AppShell from './ui/AppShell';
import RequireAuth from './ui/RequireAuth';
import { ActivityIndicator } from './ui/primitives';

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const MapPage = lazy(() => import('./pages/Map'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const StoryDetail = lazy(() => import('./pages/StoryDetail'));
const CountryDetail = lazy(() => import('./pages/CountryDetail'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));

const Profile = lazy(() => import('./pages/profile/Profile'));
const Bookmarks = lazy(() => import('./pages/profile/Bookmarks'));
const History = lazy(() => import('./pages/profile/History'));
const Achievements = lazy(() => import('./pages/profile/Achievements'));
const Contributions = lazy(() => import('./pages/profile/Contributions'));
const Contribute = lazy(() => import('./pages/profile/Contribute'));
const Following = lazy(() => import('./pages/profile/Following'));
const Notifications = lazy(() => import('./pages/profile/Notifications'));
const Settings = lazy(() => import('./pages/profile/Settings'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPendingStories = lazy(() => import('./pages/admin/AdminPendingStories'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

function PageFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <ActivityIndicator size={28} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <HashRouter>
            <AppShell>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/realms" element={<MapPage />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/stories/:slug" element={<StoryDetail />} />
                  <Route path="/countries/:countryName" element={<CountryDetail />} />
                  <Route path="/u/:username" element={<PublicProfile />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />

                  <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                  <Route path="/profile/bookmarks" element={<RequireAuth><Bookmarks /></RequireAuth>} />
                  <Route path="/profile/history" element={<RequireAuth><History /></RequireAuth>} />
                  <Route path="/profile/achievements" element={<RequireAuth><Achievements /></RequireAuth>} />
                  <Route path="/profile/contributions" element={<RequireAuth><Contributions /></RequireAuth>} />
                  <Route path="/profile/contribute" element={<RequireAuth><Contribute /></RequireAuth>} />
                  <Route path="/profile/contribute/:id" element={<RequireAuth><Contribute /></RequireAuth>} />
                  <Route path="/profile/following" element={<RequireAuth><Following /></RequireAuth>} />
                  <Route path="/profile/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
                  <Route path="/profile/settings" element={<RequireAuth><Settings /></RequireAuth>} />

                  <Route path="/admin" element={<RequireAuth adminOnly><AdminDashboard /></RequireAuth>} />
                  <Route path="/admin/pending" element={<RequireAuth adminOnly><AdminPendingStories /></RequireAuth>} />
                  <Route path="/admin/reports" element={<RequireAuth adminOnly><AdminReports /></RequireAuth>} />
                  <Route path="/admin/users" element={<RequireAuth adminOnly><AdminUsers /></RequireAuth>} />

                  <Route path="*" element={<Home />} />
                </Routes>
              </Suspense>
            </AppShell>
          </HashRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
