import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-10">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <span className="font-black tracking-[0.28em] text-xl" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
            NOVASHOP
          </span>
          <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
            Premium suppliers for resellers. Curated bundles, best-selling items, and unbeatable prices.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Instagram" className="p-2 border border-neutral-300 hover:bg-black hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter" className="p-2 border border-neutral-300 hover:bg-black hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" aria-label="Email" className="p-2 border border-neutral-300 hover:bg-black hover:text-white transition-colors"><Mail className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3">Shop</p>
          <ul className="space-y-2 text-xs text-neutral-600">
            <li><Link to="/collections/bundles" className="hover:text-black">Bundles</Link></li>
            <li><Link to="/collections/best-sellers" className="hover:text-black">Best Sellers</Link></li>
            <li><Link to="/collections/all" className="hover:text-black">Shop All</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3">Support</p>
          <ul className="space-y-2 text-xs text-neutral-600">
            <li><Link to="/policies/privacy" className="hover:text-black">Privacy Policy</Link></li>
            <li><Link to="/policies/terms" className="hover:text-black">Terms of Service</Link></li>
            <li><Link to="/policies/shipping" className="hover:text-black">Shipping</Link></li>
            <li><Link to="/policies/refund" className="hover:text-black">Refunds</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3">Newsletter</p>
          <p className="text-xs text-neutral-600 mb-3">Sign up and unlock your instant discount.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Thanks for subscribing to NovaShop!'); }} className="flex">
            <input type="email" required placeholder="Email" className="flex-1 px-3 py-2 border border-neutral-300 text-xs outline-none focus:border-black" />
            <button className="bg-black text-white px-4 text-[11px] uppercase tracking-widest hover:bg-neutral-800 transition-colors">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-5 text-center text-[11px] text-neutral-500">
        © {new Date().getFullYear()} NovaShop · All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
