import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const PaymentResult = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { API } = useAuth();
  const { clear } = useCart();
  const { lang } = useI18n();
  const [status, setStatus] = useState(variant === 'success' ? 'polling' : 'cancelled');
  const [attempts, setAttempts] = useState(0);

  const T = {
    en: {
      successTitle: 'Payment successful',
      successDesc: 'Thank you for your order. You can find it in your account.',
      pending: 'Confirming your payment...',
      failedTitle: 'Payment failed',
      failedDesc: 'The payment could not be confirmed. Please try again.',
      cancelledTitle: 'Payment cancelled',
      cancelledDesc: 'You cancelled the checkout. Your cart is still there.',
      goAccount: 'Go to my account',
      goShop: 'Continue shopping',
    },
    fr: {
      successTitle: 'Paiement réussi',
      successDesc: 'Merci pour ta commande. Tu peux la retrouver dans ton compte.',
      pending: 'Confirmation de ton paiement...',
      failedTitle: 'Paiement échoué',
      failedDesc: 'Le paiement n\'a pas pu être confirmé. Merci de réessayer.',
      cancelledTitle: 'Paiement annulé',
      cancelledDesc: 'Tu as annulé le paiement. Ton panier est toujours là.',
      goAccount: 'Voir mon compte',
      goShop: 'Continuer les achats',
    },
  }[lang];

  useEffect(() => {
    if (variant !== 'success' || !sessionId) return;
    let cancelled = false;
    let interval;

    const poll = async () => {
      try {
        const res = await axios.get(`${API}/payments/status/${sessionId}`);
        if (cancelled) return;
        if (res.data.payment_status === 'paid') {
          setStatus('paid');
          clear();
          clearInterval(interval);
        } else if (res.data.payment_status === 'failed' || res.data.payment_status === 'expired') {
          setStatus('failed');
          clearInterval(interval);
        } else {
          setAttempts((a) => a + 1);
        }
      } catch (e) {
        // continue polling
      }
    };

    poll();
    interval = setInterval(poll, 2500);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setStatus((s) => (s === 'polling' ? 'failed' : s));
    }, 90000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, variant, API]);

  return (
    <div className="max-w-lg mx-auto px-4 lg:px-8 py-24 text-center">
      {status === 'polling' && (
        <>
          <Loader2 className="w-14 h-14 mx-auto text-black animate-spin" />
          <h1 className="mt-6 text-2xl font-bold uppercase tracking-tight">{T.pending}</h1>
          <p className="mt-2 text-sm text-neutral-500">#{attempts + 1}</p>
        </>
      )}
      {status === 'paid' && (
        <>
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
          <h1 className="mt-6 text-3xl font-black uppercase tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>{T.successTitle}</h1>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{T.successDesc}</p>
          <div className="mt-8 flex gap-3 justify-center">
            <Link to="/account" className="bg-black text-white uppercase text-[12px] tracking-widest font-semibold px-6 py-3 hover:bg-neutral-800 transition-colors">
              {T.goAccount}
            </Link>
            <Link to="/collections/all" className="border border-black uppercase text-[12px] tracking-widest font-semibold px-6 py-3 hover:bg-black hover:text-white transition-colors">
              {T.goShop}
            </Link>
          </div>
        </>
      )}
      {status === 'failed' && (
        <>
          <XCircle className="w-16 h-16 mx-auto text-red-600" />
          <h1 className="mt-6 text-3xl font-black uppercase tracking-tight">{T.failedTitle}</h1>
          <p className="mt-3 text-sm text-neutral-600">{T.failedDesc}</p>
          <div className="mt-8">
            <Link to="/collections/all" className="inline-block border border-black uppercase text-[12px] tracking-widest font-semibold px-6 py-3 hover:bg-black hover:text-white transition-colors">
              {T.goShop}
            </Link>
          </div>
        </>
      )}
      {status === 'cancelled' && (
        <>
          <XCircle className="w-16 h-16 mx-auto text-neutral-500" />
          <h1 className="mt-6 text-3xl font-black uppercase tracking-tight">{T.cancelledTitle}</h1>
          <p className="mt-3 text-sm text-neutral-600">{T.cancelledDesc}</p>
          <div className="mt-8 flex gap-3 justify-center">
            <Link to="/collections/all" className="bg-black text-white uppercase text-[12px] tracking-widest font-semibold px-6 py-3 hover:bg-neutral-800 transition-colors">
              {T.goShop}
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentResult;
