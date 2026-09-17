import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { allProducts } from '../data/mock';

const Header = () => {
  const { count, setIsOpen } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = query.trim()
    ? allProducts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const handleGoToProduct = (id) => {
    setSearchOpen(false);
    setQuery('');
    navigate(`/products/${id}`);
  };

  return (
    <>
      <div className="w-full bg-black text-white text-[11px] tracking-[0.18em] uppercase py-2 text-center">
        Free shipping over $50 · New drops every week
      </div>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 lg:px-8 h-16">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide uppercase">
            <Link to="/" className="hover:text-neutral-500 transition-colors">Home</Link>
            <Link to="/collections/bundles" className="hover:text-neutral-500 transition-colors">Bundles</Link>
            <Link to="/collections/best-sellers" className="hover:text-neutral-500 transition-colors">Best Sellers</Link>
            <Link to="/collections/all" className="hover:text-neutral-500 transition-colors">Shop All</Link>
          </nav>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2 select-none">
            <span className="font-black tracking-[0.28em] text-xl lg:text-2xl" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
              NOVASHOP
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
            <div className="flex items-center gap-4 border-b border-neutral-200 pb-4">
              <Search className="w-5 h-5 text-neutral-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 text-lg outline-none placeholder:text-neutral-400 bg-transparent"
              />
              <button onClick={() => { setSearchOpen(false); setQuery(''); }} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            {query && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Products</p>
                {results.length === 0 ? (
                  <p className="text-sm text-neutral-500">No results for "{query}"</p>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {results.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => handleGoToProduct(p.id)}
                          className="flex items-center gap-4 py-3 w-full text-left hover:bg-neutral-50 px-2 rounded transition-colors"
                        >
                          <img src={p.image} alt={p.title} className="w-14 h-14 object-cover bg-neutral-50" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{p.title}</p>
                            <p className="text-xs text-neutral-500 mt-1">
                              <span className="line-through mr-2">${p.regularPrice.toFixed(2)}</span>
                              <span className="text-red-600 font-semibold">${p.price.toFixed(2)}</span>
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 h-16 border-b border-neutral-200">
            <span className="font-black tracking-[0.28em] text-xl" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>NOVASHOP</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close"><X className="w-5 h-5" /></button>
          </div>
          <nav className="flex flex-col p-6 gap-5 text-lg font-medium uppercase tracking-wider">
            <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/collections/bundles" onClick={() => setMobileOpen(false)}>Bundles</Link>
            <Link to="/collections/best-sellers" onClick={() => setMobileOpen(false)}>Best Sellers</Link>
            <Link to="/collections/all" onClick={() => setMobileOpen(false)}>Shop All</Link>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
