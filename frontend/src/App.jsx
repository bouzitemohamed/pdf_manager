import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './features/auth/authSlice';
import AuthPage       from './features/auth/AuthPage';
import OAuthCallback  from './features/auth/OAuthCallback';
import Dashboard      from './features/files/Dashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute     from './components/AdminRoute';

function App() {
  const dispatch = useDispatch();
  const { mode } = useSelector((s) => s.theme);

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
      <Route path="/login"          element={<AuthPage mode="login" />} />
      <Route path="/register"       element={<AuthPage mode="register" />} />
      <Route path="/auth/callback"  element={<OAuthCallback />} />
      <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="*"               element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
