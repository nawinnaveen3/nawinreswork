import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function useAddToCart() {
  const { user } = useAuth();
  const { add } = useCart();
  const toast = useToast();
  const nav = useNavigate();

  return (food) => {
    if (!food.availability) return toast.error('This item is currently unavailable.');
    if (!user) { toast.error('Please log in to order.'); return nav('/login', { state: { from: '/menu' } }); }
    if (user.role !== 'customer') return toast.error('Only customers can place orders.');
    add(food);
    toast.success(`${food.name} added to cart.`);
  };
}
