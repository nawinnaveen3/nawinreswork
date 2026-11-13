import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

const load = () => {
  try { return JSON.parse(localStorage.getItem('nr_cart')) || []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [settings, setSettings] = useState({ taxRate: 0, deliveryCharge: 0, currency: '₹' });

  useEffect(() => { localStorage.setItem('nr_cart', JSON.stringify(items)); }, [items]);
  useEffect(() => { api.get('/settings').then(setSettings).catch(() => {}); }, []);

  const add = useCallback((food) => {
    setItems((list) => {
      const found = list.find((i) => i.id === food.id);
      if (found) return list.map((i) => (i.id === food.id ? { ...i, quantity: Math.min(i.quantity + 1, 50) } : i));
      return [...list, { id: food.id, name: food.name, price: food.price, image: food.image, quantity: 1 }];
    });
  }, []);
  const remove = useCallback((id) => setItems((l) => l.filter((i) => i.id !== id)), []);
  const setQty = useCallback((id, q) =>
    setItems((l) => (q < 1 ? l.filter((i) => i.id !== id) : l.map((i) => (i.id === id ? { ...i, quantity: Math.min(q, 50) } : i)))), []);
  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
    const tax = Math.round(subtotal * settings.taxRate * 100) / 100;
    const delivery = items.length ? settings.deliveryCharge : 0;
    return { subtotal, tax, delivery, total: Math.round((subtotal + tax + delivery) * 100) / 100 };
  }, [items, settings]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const money = useCallback((n) => `${settings.currency}${Number(n).toFixed(2)}`, [settings.currency]);

  return (
    <Ctx.Provider value={{ items, count, add, remove, setQty, clear, totals, settings, money }}>
      {children}
    </Ctx.Provider>
  );
}
