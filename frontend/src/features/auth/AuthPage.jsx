import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser, clearError } from './authSlice';

const AuthPage = ({ mode = 'login' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');

  // Reset form and errors whenever mode switches (login ↔ register)
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

    // Register-only validations
    if (mode === 'register') {
      if (form.password.length < 8) {
        setLocalError('Password must be at least 8 characters.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
    }

    const action = mode === 'login' ? loginUser : registerUser;
    dispatch(action({ email: form.email, password: form.password }));
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || '/api'}/auth/google`;
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      {/* Background grain */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-ink-900">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
              </svg>
            </div>
            <span className="font-display text-2xl text-white tracking-tight">Archivum</span>
          </div>
          <p className="text-ink-300 text-sm font-sans">
            {mode === 'login' ? 'Sign in to your document vault' : 'Create your free account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-ink-800 border border-ink-600 rounded-2xl p-8 shadow-2xl">

          {/* Mode tabs */}
          <div className="flex bg-ink-900 rounded-xl p-1 mb-6">
            <Link
              to="/login"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-sans font-medium transition-all ${
                mode === 'login'
                  ? 'bg-ink-700 text-white shadow'
                  : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-sans font-medium transition-all ${
                mode === 'register'
                  ? 'bg-ink-700 text-white shadow'
                  : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              Create Account
            </Link>
          </div>

          {/* Error */}
          {displayError && (
            <div className="mb-5 px-4 py-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm font-sans">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-ink-300 text-xs font-sans font-medium uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-ink-700 border border-ink-500 rounded-lg px-4 py-3 text-white font-sans text-sm placeholder-ink-400 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-ink-300 text-xs font-sans font-medium uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-ink-700 border border-ink-500 rounded-lg px-4 py-3 text-white font-sans text-sm placeholder-ink-400 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder={mode === 'register' ? 'Minimum 8 characters' : '••••••••'}
              />
            </div>

            {/* Confirm Password — only on register */}
            {mode === 'register' && (
              <div>
                <label className="block text-ink-300 text-xs font-sans font-medium uppercase tracking-widest mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`w-full bg-ink-700 border rounded-lg px-4 py-3 text-white font-sans text-sm placeholder-ink-400 focus:outline-none transition-colors ${
                    form.confirmPassword && form.confirmPassword !== form.password
                      ? 'border-red-600 focus:border-red-500'
                      : form.confirmPassword && form.confirmPassword === form.password
                      ? 'border-green-600 focus:border-green-500'
                      : 'border-ink-500 focus:border-amber-500'
                  }`}
                  placeholder="Re-enter your password"
                />
                {/* Live match indicator */}
                {form.confirmPassword && (
                  <p className={`text-xs mt-1.5 font-sans ${
                    form.confirmPassword === form.password ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {form.confirmPassword === form.password ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-ink-900 font-sans font-semibold rounded-lg py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? 'Please wait…'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-600" />
            </div>
            <div className="relative flex justify-center text-xs text-ink-400 font-sans uppercase tracking-widest">
              <span className="bg-ink-800 px-3">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-ink-700 hover:bg-ink-600 border border-ink-500 text-white font-sans text-sm rounded-lg py-3 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
