import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useI18n } from '../context/I18nContext';

const Section = ({ titleKey, viewAllHref, products }) => {
  const { t } = useI18n();
  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold uppercase tracking-tight">{t(titleKey)}</h2>
        <Link
          to={viewAllHref}
          className="text-[12px] uppercase tracking-widest font-medium border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
        >
          {t('section.viewAll')}
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 lg:gap-x-6 lg:gap-y-10">
        {products.map((p, i) => (
          <ProductCard key={`${p.id}-${i}`} product={p} />
        ))}
      </div>
    </section>
  );
};

export default Section;
