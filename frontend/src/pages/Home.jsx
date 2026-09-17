import React from 'react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import { bundles, bestSellers } from '../data/mock';

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-neutral-100 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">Reselling suppliers · New drop</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[0.95] tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
              Source smarter.<br />Resell faster.
            </h1>
            <p className="mt-6 text-neutral-600 text-sm max-w-md leading-relaxed">
              NovaShop gives you access to hand-picked bundles and best-selling items at supplier prices. Start your reselling journey today.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                to="/collections/bundles"
                className="bg-black text-white uppercase text-[12px] tracking-widest font-semibold px-8 py-4 hover:bg-neutral-800 transition-colors"
              >
                Shop Bundles
              </Link>
              <Link
                to="/collections/all"
                className="border border-black uppercase text-[12px] tracking-widest font-semibold px-8 py-4 hover:bg-black hover:text-white transition-colors"
              >
                Shop All
              </Link>
            </div>
          </div>
          <div className="relative aspect-square lg:aspect-[4/5] bg-white overflow-hidden">
            <img
              src={bundles[0].image}
              alt="Featured bundle"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black text-white text-[10px] tracking-widest uppercase font-semibold px-3 py-1.5">
              Featured
            </div>
          </div>
        </div>
      </section>

      <Section title="Bundles" viewAllHref="/collections/bundles" products={bundles} />

      {/* Marquee/announcement */}
      <div className="bg-black text-white py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] gap-12 text-xs tracking-[0.3em] uppercase font-medium">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>Free shipping over $50</span>
              <span>•</span>
              <span>New drops weekly</span>
              <span>•</span>
              <span>Trusted by 5000+ resellers</span>
              <span>•</span>
            </span>
          ))}
        </div>
      </div>

      <Section title="Best Sellers" viewAllHref="/collections/best-sellers" products={bestSellers.slice(0, 8)} />

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16 flex justify-center">
        <Link
          to="/collections/all"
          className="border border-black uppercase text-[12px] tracking-widest font-semibold px-10 py-4 hover:bg-black hover:text-white transition-colors"
        >
          Shop All
        </Link>
      </div>
    </div>
  );
};

export default Home;
