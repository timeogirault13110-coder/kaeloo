import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, Shield, Award, HeadphonesIcon, Minus, Plus, CheckCircle2 } from 'lucide-react';
import { getProductById, bestSellers } from '../data/mock';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import ProductCard from '../components/ProductCard';
import Stars from '../components/Stars';
import { getReviewsForProduct, getRatingStats } from '../data/reviews';

const ProductDetail = () => {
  const { id } = useParams();
  const product = getProductById(id);
  const { addItem, setIsOpen } = useCart();
  const { t, lang } = useI18n();
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState('desc');
  const images = product ? [product.image, product.hoverImage].filter(Boolean) : [];
  const [active, setActive] = useState(images[0] || null);

  React.useEffect(() => {
    setActive(images[0] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold uppercase">{t('product.notFound')}</h1>
        <Link to="/" className="inline-block mt-6 border border-black uppercase text-xs tracking-widest px-6 py-3 hover:bg-black hover:text-white transition-colors">{t('product.backHome')}</Link>
      </div>
    );
  }

  const discount = Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100);
  const stats = getRatingStats(product.id);
  const reviews = getReviewsForProduct(product.id);

  const handleAdd = () => addItem(product, qty);
  const relatedProducts = bestSellers.filter((p) => p.id !== product.id).slice(0, 4);

  const Acc = ({ id: aid, title, children }) => (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpenAcc(openAcc === aid ? '' : aid)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[12px] uppercase tracking-widest font-semibold">{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${openAcc === aid ? 'rotate-180' : ''}`} />
      </button>
      {openAcc === aid && <div className="pb-5 text-sm text-neutral-600 leading-relaxed">{children}</div>}
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <nav className="text-[11px] uppercase tracking-widest text-neutral-500 mb-6">
        <Link to="/" className="hover:text-black">{t('nav.home')}</Link> / <Link to="/collections/all" className="hover:text-black">{t('nav.shopall')}</Link> / <span className="text-black">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="bg-neutral-50 aspect-square overflow-hidden">
            <img src={active} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img) => (
                <button
                  key={img}
                  onClick={() => setActive(img)}
                  className={`w-20 h-20 bg-neutral-50 overflow-hidden border-2 ${active === img ? 'border-black' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.onSale && (
            <span className="inline-block bg-black text-white text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1 mb-4">Sale · -{discount}%</span>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-tight leading-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
            {product.title}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <Stars value={stats.average} size={16} />
            <span className="text-xs text-neutral-600">{stats.average.toFixed(1)}</span>
            <a href="#reviews" className="text-xs text-neutral-500 underline hover:text-black">({stats.count} {t('product.reviews')})</a>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-red-600">${product.price.toFixed(2)}</span>
            <span className="text-base text-neutral-400 line-through">${product.regularPrice.toFixed(2)}</span>
          </div>

          <p className="mt-5 text-sm text-neutral-600 leading-relaxed">
            {product.description || 'A curated product from Kaeloo.'}
          </p>

          {/* Quantity + Add */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center border border-neutral-300">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3 hover:bg-neutral-50"><Minus className="w-4 h-4" /></button>
              <span className="px-5 text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-3 hover:bg-neutral-50"><Plus className="w-4 h-4" /></button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 bg-black text-white uppercase text-[12px] tracking-widest font-semibold py-4 hover:bg-neutral-800 transition-colors"
            >
              {t('product.addToCart')} · ${(product.price * qty).toFixed(2)}
            </button>
          </div>

          <button
            onClick={() => { handleAdd(); setIsOpen(true); }}
            className="mt-3 w-full border border-black uppercase text-[12px] tracking-widest font-semibold py-4 hover:bg-black hover:text-white transition-colors"
          >
            {t('product.buyNow')}
          </button>

          {/* Guarantees */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 border border-neutral-200">
              <Shield className="w-5 h-5 mx-auto mb-2 text-neutral-700" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">{t('product.trust1')}</p>
            </div>
            <div className="p-3 border border-neutral-200">
              <Award className="w-5 h-5 mx-auto mb-2 text-neutral-700" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">{t('product.trust2')}</p>
            </div>
            <div className="p-3 border border-neutral-200">
              <HeadphonesIcon className="w-5 h-5 mx-auto mb-2 text-neutral-700" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">{t('product.trust3')}</p>
            </div>
          </div>

          {/* Accordions */}
          <div className="mt-10">
            <Acc id="desc" title={t('product.description')}>
              {product.description || 'A curated product from Kaeloo.'}
            </Acc>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <section id="reviews" className="mt-20 border-t border-neutral-200 pt-14">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <h2 className="text-2xl lg:text-3xl font-bold uppercase tracking-tight">{t('product.customerReviews')}</h2>
            <div className="mt-4 flex items-center gap-3">
              <Stars value={stats.average} size={22} />
              <span className="text-xl font-semibold">{stats.average.toFixed(1)}</span>
            </div>
            <p className="text-sm text-neutral-500 mt-2">{t('product.basedOn')} {stats.count} {t('product.reviews')}</p>

            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const percent = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : star === 2 ? 1 : 1;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-4">{star}</span>
                    <Stars value={star} size={10} />
                    <div className="flex-1 h-1.5 bg-neutral-100 overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-8 text-right text-neutral-500">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="pb-6 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black text-white flex items-center justify-center text-xs font-bold uppercase">
                      {r.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {r.name}
                        {r.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-700">
                            <CheckCircle2 className="w-3 h-3" /> {lang === 'fr' ? 'Achat vérifié' : 'Verified buyer'}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-neutral-500">{lang === 'fr' ? r.dateFr : r.date}</p>
                    </div>
                  </div>
                  <Stars value={r.rating} size={13} />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{lang === 'fr' ? r.titleFr : r.titleEn}</h3>
                <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{lang === 'fr' ? r.bodyFr : r.bodyEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="mt-20">
        <h2 className="text-2xl lg:text-3xl font-bold uppercase tracking-tight mb-8">{t('section.related')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
