import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { bundles, bestSellers, allProducts } from '../data/mock';

const titles = {
  bundles: 'Bundles',
  'best-sellers': 'Best Sellers',
  all: 'Shop All',
};

const Collection = () => {
  const { slug } = useParams();
  const list =
    slug === 'bundles' ? bundles : slug === 'best-sellers' ? bestSellers : allProducts;

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Collection</p>
        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight mt-2" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
          {titles[slug] || 'Shop'}
        </h1>
        <p className="text-sm text-neutral-500 mt-2">{list.length} products</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 lg:gap-x-6 lg:gap-y-10">
        {list.map((p, i) => (
          <ProductCard key={`${p.id}-${i}`} product={p} />
        ))}
      </div>
    </div>
  );
};

export default Collection;
