import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQty, removeItem, subtotal } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Your Cart ({items.length})</h2>
          <button onClick={() => setIsOpen(false)} aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-neutral-500 text-sm mb-6">Your cart is empty.</p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-black text-white uppercase text-[11px] tracking-widest font-medium px-8 py-3 hover:bg-neutral-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100">
                  <Link to={`/products/${item.id}`} onClick={() => setIsOpen(false)}>
                    <img src={item.image} alt={item.title} className="w-20 h-20 object-cover bg-neutral-50" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-wide leading-tight">{item.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-200">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2 py-1 hover:bg-neutral-50"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 text-xs">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 py-1 hover:bg-neutral-50"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-neutral-400 hover:text-red-600 transition-colors" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 px-6 py-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase tracking-wider font-medium">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-neutral-500">Shipping and taxes calculated at checkout.</p>
              <button
                onClick={() => { setIsOpen(false); alert('Checkout is a demo. Payment integration coming soon.'); }}
                className="w-full bg-black text-white uppercase text-[12px] tracking-widest font-semibold py-4 hover:bg-neutral-800 transition-colors"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
