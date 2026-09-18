import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithGoogleSession } = useAuth();
  const [error, setError] = useState('');
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = location.hash || '';
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate('/login');
      return;
    }
    const sessionId = decodeURIComponent(match[1]);

    (async () => {
      try {
        const user = await loginWithGoogleSession(sessionId);
        // Clean the hash from URL and go to account (or admin if admin)
        window.history.replaceState({}, '', window.location.pathname);
        navigate(user.is_admin ? '/admin' : '/account', { replace: true });
      } catch (e) {
        setError(e?.response?.data?.detail || 'Google sign-in failed');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 lg:px-8 py-24 text-center">
      {!error ? (
        <>
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-black" />
          <p className="mt-4 text-sm text-neutral-500">Signing you in...</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold uppercase">Sign-in failed</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 border border-black uppercase text-xs tracking-widest px-6 py-3 hover:bg-black hover:text-white transition-colors"
          >
            Back to login
          </button>
        </>
      )}
    </div>
  );
};

export default AuthCallback;
