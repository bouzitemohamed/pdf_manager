import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './features/auth/authSlice';
import AuthPage       from './features/auth/AuthPage';
import OAuthCallback  from './features/auth/OAuthCallback';
import Layout         from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute     from './components/AdminRoute';

// User pages
import MyFilesPage    from './features/files/MyFilesPage';
import UploadPage     from './features/files/UploadPage';
import FileViewerPage from './features/files/FileViewerPage';
import FolderPage     from './features/files/FolderPage';
import BrowsePage     from './features/browse/BrowsePage';
import RecentPage     from './features/files/RecentPage';
import SearchPage     from './features/files/SearchPage';

// Admin
import AdminDashboard from './features/admin/AdminDashboard';

function App() {
  const dispatch = useDispatch();
  const { mode } = useSelector(s => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('light', mode === 'light');
  }, [mode]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(fetchCurrentUser());
    else dispatch({ type: 'auth/me/rejected' });
  }, [dispatch]);

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"         element={<AuthPage mode="login" />} />
      <Route path="/register"      element={<AuthPage mode="register" />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Admin route (no sidebar — has its own layout) */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Protected user routes — all wrapped in Layout (sidebar) */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/dashboard"      element={<MyFilesPage />} />
              <Route path="/upload"         element={<UploadPage />} />
              <Route path="/files/:id"      element={<FileViewerPage />} />
              <Route path="/folders/:id"    element={<FolderPage />} />
              <Route path="/browse"         element={<BrowsePage />} />
              <Route path="/recent"         element={<RecentPage />} />
              <Route path="/search"         element={<SearchPage />} />
              <Route path="*"               element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
