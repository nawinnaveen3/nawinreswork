import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FoodCard from '../../components/FoodCard';
import Spinner from '../../components/Spinner';
import useAddToCart from '../../components/useAddToCart';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [cats, setCats] = useState([]);
  const [error, setError] = useState('');
  const addToCart = useAddToCart();

  useEffect(() => {
    Promise.all([api.get('/menu'), api.get('/categories')])
      .then(([m, c]) => { setItems(m); setCats(c); })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page container">
      <div className="page-head row between">
        <h1 style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>Welcome, {user.name}</h1>
        <Link to="/menu" className="btn btn-gold">Order Now</Link>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass"><h3>Nawin's Restaurant</h3><p className="muted">Elegant dining and delivery. Pay by cash on delivery on every order.</p></div>
        <div className="glass"><h3>Your account</h3><p className="muted">Track orders in <Link to="/orders" className="gold">My Orders</Link> or update details in <Link to="/profile" className="gold">Profile</Link>.</p></div>
      </div>

      {error ? <div className="empty">{error}</div> : !items ? <Spinner /> : items.length === 0 ? (
        <div className="empty">No menu items available at the moment.</div>
      ) : (
        <>
          {cats.length > 0 && (
            <>
              <h2 style={{ marginBottom: '1rem' }}>Food categories</h2>
              <div className="chips">{cats.map((c) => <Link key={c.id} to={`/menu?category=${c.id}`} className="chip">{c.name}</Link>)}</div>
            </>
          )}
          <h2 style={{ marginBottom: '1rem' }}>Featured food</h2>
          <div className="grid grid-3">{items.filter((f) => f.availability).slice(0, 6).map((f) => <FoodCard key={f.id} food={f} onAdd={addToCart} />)}</div>
        </>
      )}
    </div>
  );
}
