import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = Math.round(
    ((product.regularPrice - product.price) / product.regularPrice) * 100
  );

  const displayImage = hovered && product.hoverImage ? product.hoverImage : product.image;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={`/products/${product.id}`}
        className="relative block bg-neutral-50 overflow-hidden aspect-square"
      >
        {product.onSale && (
          <span className="absolute top-3 left-3 z-10 bg-black text-white text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1">
            Sale
          </span>
        )}
        <img
          src={displayImage}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <button
          onClick={handleAdd}
          className="absolute bottom-3 right-3 bg-white text-black text-[11px] uppercase tracking-wider font-medium px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black hover:text-white shadow-sm"
        >
          {added ? 'Added ✓' : 'Add'}
        </button>
      </Link>

      <div className="pt-3 pb-6">
        <Link
          to={`/products/${product.id}`}
          className="block text-[13px] font-medium tracking-wide uppercase hover:text-neutral-500 transition-colors line-clamp-2"
        >
          {product.title}
        </Link>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[13px] text-red-600 font-semibold">${product.price.toFixed(2)}</span>
          <span className="text-[12px] text-neutral-400 line-through">${product.regularPrice.toFixed(2)}</span>
          {discount > 0 && (
            <span className="text-[11px] text-neutral-500 ml-1">-{discount}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
