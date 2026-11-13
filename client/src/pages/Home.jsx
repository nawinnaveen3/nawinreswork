import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import FoodCard from '../components/FoodCard';
import Spinner from '../components/Spinner';
import useAddToCart from '../components/useAddToCart';
import ownerPhoto from '../assets/owner-photo.jpeg';

export default function Home() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const addToCart = useAddToCart();

  useEffect(() => {
    api.get('/menu').then((m) => setItems(m.slice(0, 4))).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-in">
          <h1>Welcome to Nawin's Restaurant</h1>
          <p>Experience exquisite food, elegant dining, and exceptional service.</p>
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-ghost">Explore Menu</Link>
            <Link to="/menu" className="btn btn-gold">Order Now</Link>
          </div>
        </div>
      </section>

      <section className="section container menu-section">
        <div className="page-head">
          <h2>From our kitchen</h2>
          <p>Freshly added by the chef's team.</p>
        </div>
        {error ? <div className="empty">{error}</div>
          : !items ? <Spinner />
          : items.length === 0 ? <div className="empty">No menu items available at the moment.</div>
          : <div className="grid grid-3">{items.map((f) => <FoodCard key={f.id} food={f} onAdd={addToCart} />)}</div>}
      </section>

      <section className="section container owner-about">
        <figure className="owner-about-photo">
          <img src={ownerPhoto} alt="Nawin, founder of Nawin's Restaurant" width="1086" height="1448" loading="lazy" />
          <figcaption>Nawin &middot; Founder &amp; Head Chef</figcaption>
        </figure>
        <div className="owner-about-text">
          <p className="owner-about-eyebrow">The Founder</p>
          <h2>About the Owner</h2>
          <p className="muted">
            Nawin built this restaurant around a single idea: a meal should feel like an occasion. What began as one
            kitchen and a handful of regulars grew into a dining room and a delivery service, without ever changing how
            the food is made.
          </p>
          <p className="muted">
            Every dish is still chosen by hand, cooked to order, and tasted before it leaves the pass. (Replace this text
            with your own story.)
          </p>
          <div className="chips">
            {['Menu curated by hand', 'Cooked to order', 'Home delivery'].map((t) => (
              <span key={t} className="chip on">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--brown)' }}>
        <div className="container grid grid-2">
          <div className="glass"><h3>Elegant dining</h3><p className="muted">A warm, refined space for family dinners and special evenings.</p></div>
          <div className="glass"><h3>Order from home</h3><p className="muted">Create an account, build your cart and have your meal delivered.</p></div>
        </div>
      </section>
    </>
  );
}
