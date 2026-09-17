import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'novashop_cart_v1';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + qty } : p
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          regularPrice: product.regularPrice,
          image: product.image,
          qty,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((p) => p.id !== id));

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  };

  const clear = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clear, subtotal, count, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
