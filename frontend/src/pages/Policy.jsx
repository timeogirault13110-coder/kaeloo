import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';

const content = {
  en: {
    terms: {
      title: 'Terms of Use',
      body: [
        'By using Kaeloo you agree to these terms.',
        'You must be at least 18 years old to purchase.',
        'All sales are final once the order has been shipped.',
        'For any question contact support@kaeloo.com.',
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      body: [
        'We collect only the information needed to process your order (name, email, shipping and billing address).',
        'Your data is never sold to third parties.',
        'You can request deletion of your data at support@kaeloo.com.',
      ],
    },
    shipping: {
      title: 'Delivery',
      body: [
        'Delivery is digital.',
      ],
    },
    refund: {
      title: 'Refunds',
      body: [
        'You have 14 days after receiving your order to request a refund.',
        'Items must be returned in their original condition and packaging.',
        'Refunds are processed within 5 business days after we receive the return.',
      ],
    },
  },
  fr: {
    terms: {
      title: "Conditions d'utilisation",
      body: [
        "En utilisant Kaeloo, vous acceptez ces conditions.",
        "Vous devez avoir au moins 18 ans pour acheter.",
        "Toutes les ventes sont définitives une fois la commande expédiée.",
        "Pour toute question, contactez support@kaeloo.com.",
      ],
    },
    privacy: {
      title: 'Politique de confidentialité',
      body: [
        "Nous ne collectons que les informations nécessaires à la commande (nom, email, adresse de livraison et de facturation).",
        "Vos données ne sont jamais revendues.",
        "Vous pouvez demander la suppression de vos données à support@kaeloo.com.",
      ],
    },
    shipping: {
      title: 'Livraison',
      body: [
        'La livraison est digitale.',
      ],
    },
    refund: {
      title: 'Remboursements',
      body: [
        'Vous avez 14 jours après réception pour demander un remboursement.',
        'Les articles doivent être retournés dans leur état et emballage d\'origine.',
        'Les remboursements sont traités sous 5 jours ouvrés après réception du retour.',
      ],
    },
  },
};

const Policy = () => {
  const { slug } = useParams();
  const { lang, t } = useI18n();
  const page = content[lang][slug];

  if (!page) {
    return (
      <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold uppercase">{t('product.notFound')}</h1>
        <Link to="/" className="inline-block mt-6 border border-black uppercase text-xs tracking-widest px-6 py-3 hover:bg-black hover:text-white transition-colors">
          {t('product.backHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[820px] mx-auto px-4 lg:px-8 py-16">
      <nav className="text-[11px] uppercase tracking-widest text-neutral-500 mb-6">
        <Link to="/" className="hover:text-black">{t('nav.home')}</Link> / <span className="text-black">{page.title}</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
          {page.title}
        </h1>
      </header>

      <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
        {page.body.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
};

export default Policy;
