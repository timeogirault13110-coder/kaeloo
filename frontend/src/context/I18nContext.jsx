import React, { createContext, useContext, useEffect, useState } from 'react';

const I18nContext = createContext(null);
const STORAGE_KEY = 'novashop_lang_v1';

const translations = {
  en: {
    'topbar.free': '',
    'nav.home': 'Home',
    'nav.bundles': 'Bundles',
    'nav.bestsellers': 'Best Sellers',
    'nav.shopall': 'Shop All',
    'nav.account': 'Account',
    'search.placeholder': 'Search products...',
    'search.noResults': 'No results for',
    'search.products': 'Products',

    'gate.title': 'Do you accept our Terms of Use?',
    'gate.subtitle': '',
    'gate.link': '',
    'gate.accept': 'Yes',
    'gate.decline': 'No',

    'hero.eyebrow': 'New drop',
    'hero.title1': 'Iconic pieces.',
    'hero.title2': 'Everyday prices.',
    'hero.desc': 'NovaShop curates premium bundles and best-selling items you\'ll love.',
    'hero.shopBundles': 'Shop Bundles',
    'hero.shopAll': 'Shop All',
    'hero.featured': 'Featured',

    'section.bundles': 'Bundles',
    'section.bestsellers': 'Best Sellers',
    'section.viewAll': 'View all',
    'section.related': 'You may also like',

    'product.add': 'Add',
    'product.added': 'Added',
    'product.addToCart': 'Add to cart',
    'product.buyNow': 'Buy it now',
    'product.description': 'Description',
    'product.reviews': 'reviews',
    'product.review': 'review',
    'product.customerReviews': 'Customer reviews',
    'product.basedOn': 'Based on',
    'product.notFound': 'Product not found',
    'product.backHome': 'Back home',
    'product.trust1': 'Secure',
    'product.trust2': 'Quality',
    'product.trust3': 'Support',

    'cart.title': 'Your Cart',
    'cart.empty': 'Your cart is empty.',
    'cart.continue': 'Continue Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.taxes': 'Taxes calculated at checkout.',
    'cart.checkout': 'Checkout',

    'collection.products': 'products',

    'footer.tagline': 'Curated bundles, best-selling items, unbeatable prices.',
    'footer.shop': 'Shop',
    'footer.support': 'Support',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterDesc': 'Sign up and unlock your instant discount.',
    'footer.emailPh': 'Email',
    'footer.join': 'Join',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.shipping': 'Delivery',
    'footer.refund': 'Refunds',
    'footer.rights': 'All rights reserved',

    'lang.switch': 'Language',
  },
  fr: {
    'topbar.free': '',
    'nav.home': 'Accueil',
    'nav.bundles': 'Packs',
    'nav.bestsellers': 'Best-sellers',
    'nav.shopall': 'Boutique',
    'nav.account': 'Compte',
    'search.placeholder': 'Rechercher des produits...',
    'search.noResults': 'Aucun résultat pour',
    'search.products': 'Produits',

    'gate.title': 'Voulez-vous accepter les conditions d\'utilisation ?',
    'gate.subtitle': '',
    'gate.link': '',
    'gate.accept': 'Oui',
    'gate.decline': 'Non',

    'hero.eyebrow': 'Nouveauté',
    'hero.title1': 'Pièces iconiques.',
    'hero.title2': 'Prix imbattables.',
    'hero.desc': 'NovaShop sélectionne les packs et best-sellers que tu vas adorer.',
    'hero.shopBundles': 'Voir les packs',
    'hero.shopAll': 'Tout voir',
    'hero.featured': 'À la une',

    'section.bundles': 'Packs',
    'section.bestsellers': 'Best-sellers',
    'section.viewAll': 'Tout voir',
    'section.related': 'Vous aimerez aussi',

    'product.add': 'Ajouter',
    'product.added': 'Ajouté',
    'product.addToCart': 'Ajouter au panier',
    'product.buyNow': 'Acheter maintenant',
    'product.description': 'Description',
    'product.reviews': 'avis',
    'product.review': 'avis',
    'product.customerReviews': 'Avis clients',
    'product.basedOn': 'Sur',
    'product.notFound': 'Produit introuvable',
    'product.backHome': 'Retour à l\'accueil',
    'product.trust1': 'Sécurisé',
    'product.trust2': 'Qualité',
    'product.trust3': 'Support',

    'cart.title': 'Votre panier',
    'cart.empty': 'Votre panier est vide.',
    'cart.continue': 'Continuer les achats',
    'cart.subtotal': 'Sous-total',
    'cart.taxes': 'Taxes calculées au moment du paiement.',
    'cart.checkout': 'Passer commande',

    'collection.products': 'produits',

    'footer.tagline': 'Packs triés, best-sellers, prix imbattables.',
    'footer.shop': 'Boutique',
    'footer.support': 'Support',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterDesc': 'Inscris-toi et débloque une réduction instantanée.',
    'footer.emailPh': 'Email',
    'footer.join': 'Rejoindre',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': "Conditions d'utilisation",
    'footer.shipping': 'Livraison',
    'footer.refund': 'Remboursements',
    'footer.rights': 'Tous droits réservés',

    'lang.switch': 'Langue',
  },
};

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang][key] ?? translations.en[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
