import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Loader2, Tag } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQty, removeItem, subtotal } = useCart();
  const { t, lang } = useI18n();
  const { authHeader, API, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null); // {code, discount, type, value}
  const [promoErr, setPromoErr] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoErr('');
    setPromoLoading(true);
    try {
      const res = await axios.post(`${API}/promos/validate`, {
        code: promoInput.trim(),
        subtotal: subtotal,
      });
      setPromo(res.data);
    } catch (err) {
      setPromoErr(err?.response?.data?.detail || (lang === 'fr' ? 'Code invalide' : 'Invalid code'));
      setPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromo(null);
    setPromoInput('');
    setPromoErr('');
  };

  const total = Math.max(subtotal - (promo?.discount || 0), 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!user) {
      setIsOpen(false);
      navigate('/login', { state: { from: '/account' } });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/payments/checkout`,
        {
          items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
          origin_url: window.location.origin,
          promo_code: promo?.code || null,
        },
        { headers: authHeader() }
      );
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <h2 className="text-sm font-semibold uppercase tracking-widest">{t('cart.title')} ({items.length})</h2>
          <button onClick={() => setIsOpen(false)} aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-neutral-500 text-sm mb-6">{t('cart.empty')}</p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-black text-white uppercase text-[11px] tracking-widest font-medium px-8 py-3 hover:bg-neutral-800 transition-colors"
            >
              {t('cart.continue')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100">
                  <Link to={`/products/${item.id}`} onClick={() => setIsOpen(false)}>
                    <img src={item.image} alt={item.title} className="w-20 h-20 object-cover bg-neutral-50" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-wide leading-tight">{item.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-200">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2 py-1 hover:bg-neutral-50"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 text-xs">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 py-1 hover:bg-neutral-50"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-neutral-400 hover:text-red-600 transition-colors" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 px-6 py-5 space-y-4">
              {/* Promo code */}
              {!promo ? (
                <div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center border border-neutral-300">
                      <Tag className="w-4 h-4 text-neutral-400 ml-3" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoErr(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } }}
                        placeholder={lang === 'fr' ? 'Code promo' : 'Promo code'}
                        className="flex-1 px-3 py-2.5 text-sm outline-none uppercase"
                      />
                    </div>
                    <button
                      onClick={applyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-4 border border-black uppercase text-[11px] tracking-widest font-semibold hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                    >
                      {promoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (lang === 'fr' ? 'Appliquer' : 'Apply')}
                    </button>
                  </div>
                  {promoErr && <p className="mt-1.5 text-[11px] text-red-600">{promoErr}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-green-700" />
                    <span className="text-xs font-semibold text-green-800">{promo.code}</span>
                    <span className="text-xs text-green-700">
                      −${promo.discount.toFixed(2)} {promo.type === 'percent' ? `(${promo.value}%)` : ''}
                    </span>
                  </div>
                  <button onClick={removePromo} className="text-green-700 hover:text-red-600" aria-label="Remove promo">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between text-neutral-500">
                  <span>{t('cart.subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {promo && (
                  <div className="flex items-center justify-between text-green-700">
                    <span className="uppercase tracking-wider text-xs">{lang === 'fr' ? 'Réduction' : 'Discount'}</span>
                    <span>−${promo.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-base font-semibold pt-2 border-t border-neutral-100">
                  <span className="uppercase tracking-wider">Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500">{t('cart.taxes')}</p>
              {error && <p className="text-xs text-red-600 border border-red-200 bg-red-50 p-2">{error}</p>}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-black text-white uppercase text-[12px] tracking-widest font-semibold py-4 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('cart.checkout')}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
