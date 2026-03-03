import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser, clearError } from './authSlice';
import ThemeToggle from '../../components/ThemeToggle';

const AuthPage = ({ mode = 'login' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setForm({ email: '', password: '', confirmPassword: '' });
    setLocalError('');
    dispatch(clearError());
  }, [mode, dispatch]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (mode === 'register') {
      if (form.password.length < 8) { setLocalError('Password must be at least 8 characters.'); return; }
      if (form.password !== form.confirmPassword) { setLocalError('Passwords do not match.'); return; }
    }
    const action = mode === 'login' ? loginUser : registerUser;
    dispatch(action({ email: form.email, password: form.password }));
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || '/api'}/auth/google`;
  };

  const displayError = localError || error;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 transition-colors duration-250 relative"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Background grain — only visible in dark */}
      <div className="fixed inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />

      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: 'var(--bg-primary)' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
              </svg>
            </div>
            <span className="font-display text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>Archivum</span>
          </div>
          <p className="text-sm font-sans" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login' ? 'Sign in to your document vault' : 'Create your free account'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border transition-colors duration-250"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
        >
          {/* Mode tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Link to="/login" className={`flex-1 text-center py-2 rounded-lg text-sm font-sans font-medium transition-all ${mode === 'login' ? 'shadow' : ''}`}
              style={{
                backgroundColor: mode === 'login' ? 'var(--bg-tertiary)' : 'transparent',
                color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              Sign In
            </Link>
            <Link to="/register" className={`flex-1 text-center py-2 rounded-lg text-sm font-sans font-medium transition-all ${mode === 'register' ? 'shadow' : ''}`}
              style={{
                backgroundColor: mode === 'register' ? 'var(--bg-tertiary)' : 'transparent',
                color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              Create Account
            </Link>
          </div>

          {/* Error */}
          {displayError && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm font-sans"
              style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error-text)', border: '1px solid' }}>
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-sans font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email" required autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-3 font-sans text-sm outline-none border transition-colors duration-200"
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-sans font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password" required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === 'register' ? 'Minimum 8 characters' : '••••••••'}
                className="w-full rounded-lg px-4 py-3 font-sans text-sm outline-none border transition-colors duration-200"
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>

            {/* Confirm Password — register only */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-sans font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Confirm Password
                </label>
                <input
                  type="password" required autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  className="w-full rounded-lg px-4 py-3 font-sans text-sm outline-none border transition-colors duration-200"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    borderColor: form.confirmPassword
                      ? form.confirmPassword === form.password ? '#16a34a' : '#dc2626'
                      : 'var(--border-light)'
                  }}
                />
                {form.confirmPassword && (
                  <p className="text-xs mt-1.5 font-sans" style={{ color: form.confirmPassword === form.password ? '#16a34a' : '#dc2626' }}>
                    {form.confirmPassword === form.password ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-sans font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
              onMouseEnter={e => !loading && (e.target.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={e => e.target.style.backgroundColor = 'var(--accent)'}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center text-xs font-sans uppercase tracking-widest">
              <span className="px-3" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)' }}>or</span>
            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-lg py-3 text-sm font-sans border transition-colors duration-200"
            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
