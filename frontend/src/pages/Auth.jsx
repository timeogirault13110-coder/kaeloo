import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Loader2 } from 'lucide-react';

const GoogleIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M21.35 11.1H12v3.24h5.35c-.24 1.44-1.68 4.23-5.35 4.23-3.22 0-5.85-2.66-5.85-5.94s2.63-5.94 5.85-5.94c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.79 4.13 14.6 3.2 12 3.2 6.98 3.2 3 7.18 3 12.2s3.98 9 9 9c5.2 0 8.62-3.65 8.62-8.79 0-.59-.06-1.03-.14-1.31z"/>
  </svg>
);

const Auth = ({ mode }) => {
  const isLogin = mode === 'login';
  const { login, register, startGoogleLogin } = useAuth();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const T = {
    en: {
      loginTitle: 'Sign in',
      registerTitle: 'Create account',
      email: 'Email',
      password: 'Password',
      name: 'Name (optional)',
      submitLogin: 'Sign in',
      submitRegister: 'Create account',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      goRegister: 'Create one',
      goLogin: 'Sign in',
      subtitle: 'Access your orders anytime.',
      google: 'Continue with Google',
      or: 'or',
    },
    fr: {
      loginTitle: 'Se connecter',
      registerTitle: 'Créer un compte',
      email: 'Email',
      password: 'Mot de passe',
      name: 'Nom (optionnel)',
      submitLogin: 'Se connecter',
      submitRegister: 'Créer le compte',
      noAccount: "Pas encore de compte ?",
      haveAccount: 'Déjà un compte ?',
      goRegister: 'En créer un',
      goLogin: 'Se connecter',
      subtitle: 'Retrouve tes commandes à tout moment.',
      google: 'Continuer avec Google',
      or: 'ou',
    },
  }[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      const dest = location.state?.from || '/account';
      navigate(dest);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const returnPath = location.state?.from || '/account';

  return (
    <div className="max-w-md mx-auto px-4 lg:px-8 py-16">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">NovaShop</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
          {isLogin ? T.loginTitle : T.registerTitle}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">{T.subtitle}</p>
      </div>

      {/* Google login */}
      <button
        type="button"
        onClick={() => startGoogleLogin(returnPath)}
        className="w-full flex items-center justify-center gap-3 border border-neutral-300 py-3.5 text-sm font-medium hover:bg-neutral-50 transition-colors"
      >
        <GoogleIcon className="w-5 h-5" />
        {T.google}
      </button>

      <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-neutral-400">
        <div className="flex-1 h-px bg-neutral-200" />
        <span>{T.or}</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="text-[11px] uppercase tracking-widest font-semibold">{T.name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>
        )}
        <div>
          <label className="text-[11px] uppercase tracking-widest font-semibold">{T.email}</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest font-semibold">{T.password}</label>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        {error && (
          <div className="text-xs text-red-600 border border-red-200 bg-red-50 p-3">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white uppercase text-[12px] tracking-widest font-semibold py-4 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLogin ? T.submitLogin : T.submitRegister}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {isLogin ? T.noAccount : T.haveAccount}{' '}
        <Link
          to={isLogin ? '/register' : '/login'}
          className="underline font-medium text-black"
        >
          {isLogin ? T.goRegister : T.goLogin}
        </Link>
      </p>
    </div>
  );
};

export default Auth;
