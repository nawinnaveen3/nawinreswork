import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import FoodImage from '../../components/FoodImage';

export default function Cart() {
  const { items, setQty, remove, clear, totals, money } = useCart();
  const nav = useNavigate();

  return (
    <div className="page container">
      <div className="page-head row between">
        <h1 style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>Your Cart</h1>
        {items.length > 0 && <button className="btn btn-danger btn-sm" onClick={clear}>Clear cart</button>}
      </div>

      {items.length === 0 ? (
        <div className="empty">Your cart is empty. <Link to="/menu" className="gold">Browse the menu</Link></div>
      ) : (
        <div className="cart-layout">
          <div className="card">
            {items.map((i) => (
              <div className="cart-row" key={i.id}>
                <FoodImage src={i.image} name={i.name} className="thumb" />
                <div><b>{i.name}</b><div className="muted">{money(i.price)} each</div></div>
                <div className="qty">
                  <button onClick={() => setQty(i.id, i.quantity - 1)} aria-label="Decrease"><Minus size={14} /></button>
                  <span>{i.quantity}</span>
                  <button onClick={() => setQty(i.id, i.quantity + 1)} aria-label="Increase"><Plus size={14} /></button>
                </div>
                <div className="row" style={{ gap: '.6rem' }}>
                  <b>{money(i.price * i.quantity)}</b>
                  <button className="btn btn-danger btn-icon" onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <aside className="card">
            <h3 style={{ marginBottom: '.8rem' }}>Order summary</h3>
            <div className="sum-line"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
            <div className="sum-line"><span>Tax</span><span>{money(totals.tax)}</span></div>
            <div className="sum-line"><span>Delivery Charge</span><span>{money(totals.delivery)}</span></div>
            <div className="sum-line total"><span>Total</span><b>{money(totals.total)}</b></div>
            <button className="btn btn-gold" style={{ width: '100%', marginTop: '1rem' }} onClick={() => nav('/checkout')}>Proceed to Checkout</button>
          </aside>
        </div>
      )}
    </div>
  );
}
