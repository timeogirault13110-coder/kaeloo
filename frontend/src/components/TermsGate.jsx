import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Download } from 'lucide-react';

const STORAGE_KEY = 'novashop_terms_accepted_v1';

const TermsGate = () => {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // small delay so the page renders first
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    if (!checked) return;
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-lg shadow-2xl">
        <div className="px-6 py-5 border-b border-neutral-200">
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Welcome to</p>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
            NovaShop
          </h2>
        </div>

        <div className="px-6 py-5 space-y-4 text-sm text-neutral-700 leading-relaxed">
          <p className="font-semibold text-black uppercase tracking-wider text-xs">
            Before you continue, please read and accept our terms:
          </p>

          <ul className="space-y-3">
            <li className="flex gap-3">
              <Download className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
              <span>
                <strong className="uppercase">100% digital delivery.</strong> All products sold on NovaShop are digital files (PDF guides, supplier lists, links). Nothing physical will ever be shipped.
              </span>
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
              <span>
                After payment, your files are delivered instantly by email and inside your account.
              </span>
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
              <span>
                Because deliveries are digital and immediate, <strong>all sales are final</strong> and non-refundable.
              </span>
            </li>
          </ul>

          <p className="text-xs text-neutral-500">
            Full details available on our{' '}
            <Link to="/policies/terms" onClick={accept} className="underline hover:text-black">Terms of Use</Link>{' '}
            and{' '}
            <Link to="/policies/privacy" onClick={accept} className="underline hover:text-black">Privacy Policy</Link> pages.
          </p>
        </div>

        <div className="px-6 py-5 border-t border-neutral-200 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-black cursor-pointer"
            />
            <span className="text-xs text-neutral-700">
              I have read and I accept the <Link to="/policies/terms" onClick={accept} className="underline">Terms of Use</Link>. I understand that all products are digital and non-refundable.
            </span>
          </label>

          <button
            onClick={accept}
            disabled={!checked}
            className={`w-full uppercase text-[12px] tracking-widest font-semibold py-4 transition-colors ${
              checked
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            I Accept &amp; Enter
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsGate;
