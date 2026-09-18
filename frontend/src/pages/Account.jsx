import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { LogOut, Package, Loader2 } from 'lucide-react';

const Account = () => {
  const { user, logout, authHeader, API, loading: authLoading } = useAuth();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const T = {
    en: {
      welcome: 'Welcome back',
      subtitle: 'Your NovaShop account',
      logout: 'Sign out',
      library: 'My orders',
      libraryDesc: 'All your past orders.',
      empty: 'You have no orders yet.',
      shop: 'Shop now',
      view: 'View',
      orderedOn: 'Ordered on',
    },
    fr: {
      welcome: 'Bon retour',
      subtitle: 'Ton compte NovaShop',
      logout: 'Déconnexion',
      library: 'Mes commandes',
      libraryDesc: 'Toutes tes commandes passées.',
      empty: 'Tu n\'as encore aucune commande.',
      shop: 'Acheter maintenant',
      view: 'Voir',
      orderedOn: 'Commandé le',
    },
  }[lang];

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: '/account' } });
      return;
    }
    (async () => {
      try {
        const res = await axios.get(`${API}/library`, { headers: authHeader() });
        setItems(res.data.items || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, API, authHeader, navigate]);

  if (authLoading || !user) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{T.subtitle}</p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
            {T.welcome}{user.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 border border-neutral-300 px-5 py-2.5 text-[12px] uppercase tracking-widest font-semibold hover:bg-neutral-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {T.logout}
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold uppercase tracking-tight">{T.library}</h2>
        <p className="text-sm text-neutral-500 mt-1">{T.libraryDesc}</p>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 border border-dashed border-neutral-300 p-10 text-center">
            <p className="text-sm text-neutral-500">{T.empty}</p>
            <Link
              to="/collections/all"
              className="inline-block mt-4 bg-black text-white uppercase text-[12px] tracking-widest font-semibold px-6 py-3 hover:bg-neutral-800 transition-colors"
            >
              {T.shop}
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((it, idx) => (
              <div key={`${it.order_id}-${idx}`} className="border border-neutral-200 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide">{it.title}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {T.orderedOn} {new Date(it.ordered_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/products/${it.product_id}`}
                  className="inline-flex items-center gap-2 border border-black uppercase text-[11px] tracking-widest font-semibold px-4 py-2.5 hover:bg-black hover:text-white transition-colors"
                >
                  {T.view}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
