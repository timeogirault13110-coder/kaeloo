import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';

const STORAGE_KEY = 'novashop_terms_accepted_v1';

const TermsGate = () => {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      const to = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(to);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setVisible(false);
  };

  const decline = () => {
    // Reload the page - they must accept to use the site
    window.location.reload();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-md shadow-2xl">
        <div className="px-6 py-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 mb-2">NovaShop</p>
          <h2 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
            {t('gate.title')}
          </h2>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={decline}
            className="flex-1 border border-neutral-300 uppercase text-[12px] tracking-widest font-semibold py-3.5 hover:bg-neutral-50 transition-colors"
          >
            {t('gate.decline')}
          </button>
          <button
            onClick={accept}
            className="flex-1 bg-black text-white uppercase text-[12px] tracking-widest font-semibold py-3.5 hover:bg-neutral-800 transition-colors"
          >
            {t('gate.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsGate;
