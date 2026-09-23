import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-10">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <span className="font-black tracking-[0.28em] text-xl" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
            KAELOO
          </span>
          <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
            {t('footer.tagline')}
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Instagram" className="p-2 border border-neutral-300 hover:bg-black hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter" className="p-2 border border-neutral-300 hover:bg-black hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" aria-label="Email" className="p-2 border border-neutral-300 hover:bg-black hover:text-white transition-colors"><Mail className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3">{t('footer.shop')}</p>
          <ul className="space-y-2 text-xs text-neutral-600">
            <li><Link to="/collections/bundles" className="hover:text-black">{t('nav.bundles')}</Link></li>
            <li><Link to="/collections/best-sellers" className="hover:text-black">{t('nav.bestsellers')}</Link></li>
            <li><Link to="/collections/all" className="hover:text-black">{t('nav.shopall')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3">{t('footer.support')}</p>
          <ul className="space-y-2 text-xs text-neutral-600">
            <li><Link to="/policies/privacy" className="hover:text-black">{t('footer.privacy')}</Link></li>
            <li><Link to="/policies/terms" className="hover:text-black">{t('footer.terms')}</Link></li>
            <li><Link to="/policies/shipping" className="hover:text-black">{t('footer.shipping')}</Link></li>
            <li><Link to="/policies/refund" className="hover:text-black">{t('footer.refund')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3">{t('footer.newsletter')}</p>
          <p className="text-xs text-neutral-600 mb-3">{t('footer.newsletterDesc')}</p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Thanks for subscribing to Kaeloo!'); }} className="flex">
            <input type="email" required placeholder={t('footer.emailPh')} className="flex-1 px-3 py-2 border border-neutral-300 text-xs outline-none focus:border-black" />
            <button className="bg-black text-white px-4 text-[11px] uppercase tracking-widest hover:bg-neutral-800 transition-colors">{t('footer.join')}</button>
          </form>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-5 text-center text-[11px] text-neutral-500">
        © {new Date().getFullYear()} Kaeloo · {t('footer.rights')}
      </div>
    </footer>
  );
};

export default Footer;
