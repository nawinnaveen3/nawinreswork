import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../services/api';
import FoodCard from '../components/FoodCard';
import Spinner from '../components/Spinner';
import useAddToCart from '../components/useAddToCart';

export default function Menu() {
  const [items, setItems] = useState(null);
  const [cats, setCats] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [params, setParams] = useSearchParams();
  const cat = params.get('category') || 'all';
  const addToCart = useAddToCart();

  useEffect(() => {
    Promise.all([api.get('/menu'), api.get('/categories')])
      .then(([m, c]) => { setItems(m); setCats(c); })
      .catch((e) => setError(e.message));
  }, []);

  const shown = useMemo(() => (items || []).filter((f) =>
    (cat === 'all' || String(f.category_id) === cat) &&
    (`${f.name} ${f.description || ''}`.toLowerCase().includes(q.toLowerCase()))), [items, cat, q]);

  return (
    <div className="page container">
      <div className="page-head"><h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}>Our Menu</h1></div>
      {error ? <div className="empty">{error}</div> : !items ? <Spinner /> : items.length === 0 ? (
        <div className="empty">No menu items available at the moment.</div>
      ) : (
        <>
          <div className="row between" style={{ marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 380 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--muted)' }} />
              <input className="input" style={{ paddingLeft: 36 }} placeholder="Search food..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search food" />
            </div>
          </div>
          <div className="chips">
            <button className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setParams({})}>All</button>
            {cats.map((c) => (
              <button key={c.id} className={`chip ${cat === String(c.id) ? 'on' : ''}`} onClick={() => setParams({ category: c.id })}>{c.name}</button>
            ))}
          </div>
          {shown.length === 0 ? <div className="empty">No food matches your search.</div>
            : <div className="grid grid-3">{shown.map((f) => <FoodCard key={f.id} food={f} onAdd={addToCart} />)}</div>}
        </>
      )}
    </div>
  );
}
