import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTokenFromOAuth, fetchCurrentUser } from './authSlice';

const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/login?error=' + (error || 'unknown'));
      return;
    }

    dispatch(setTokenFromOAuth(token));
    dispatch(fetchCurrentUser()).then(() => navigate('/dashboard'));
  }, [params, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-ink-300 font-sans text-sm">Completing sign in…</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
