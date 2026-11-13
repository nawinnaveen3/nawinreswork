import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const toast = useToast();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const doLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* token is discarded either way */ }
    logout();
    close();
    toast.success('Logged out successfully.');
    nav('/');
  };

  const L = ({ to, children, end }) => <NavLink to={to} end={end} onClick={close}>{children}</NavLink>;
  const customer = user?.role === 'customer';
  const owner = user?.role === 'owner';

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to={customer ? '/customer' : '/'} className="brand" onClick={close}>NAWIN'S RESTAURANT</Link>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {customer ? (
            <>
              <L to="/customer" end>Home</L>
              <L to="/menu">Menu</L>
              <L to="/cart"><ShoppingCart size={16} /> Cart {count > 0 && <span className="cart-badge">{count}</span>}</L>
              <L to="/orders">My Orders</L>
              <L to="/profile">Profile</L>
              <L to="/contact">Contact</L>
              <button className="linklike" onClick={doLogout}>Logout</button>
            </>
          ) : (
            <>
              <L to="/" end>Home</L>
              <L to="/about">About</L>
              <L to="/menu">Menu</L>
              <L to="/contact">Contact</L>
              {owner ? (
                <>
                  <L to="/owner">Owner Dashboard</L>
                  <button className="linklike" onClick={doLogout}>Logout</button>
                </>
              ) : (
                <>
                  <L to="/login">Customer Login</L>
                  <Link to="/menu" className="btn btn-gold btn-sm" onClick={close}>Order Now</Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
