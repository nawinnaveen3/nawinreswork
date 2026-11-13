import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { orderCode, fmtDate, statusClass } from '../../utils';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState(null);
  const { money } = useCart();

  useEffect(() => { api.get('/orders').then(setOrders).catch((e) => setError(e.message)); }, []);

  return (
    <div className="page container">
      <div className="page-head"><h1 style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>My Orders</h1></div>
      {error ? <div className="empty">{error}</div> : !orders ? <Spinner /> : orders.length === 0 ? (
        <div className="empty">You have not placed any orders yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Qty</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} onClick={() => setSel(o)} style={{ cursor: 'pointer' }}>
                  <td><b className="gold">{orderCode(o.id)}</b></td>
                  <td>{fmtDate(o.created_at)}</td>
                  <td>{o.items.map((i) => i.item_name).join(', ')}</td>
                  <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td>{money(o.total_amount)}</td>
                  <td>{o.payment_method}</td>
                  <td><span className={statusClass(o.status)}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {orders && orders.length > 0 && <p className="muted" style={{ marginTop: '.8rem' }}>Click an order to see full details.</p>}

      {sel && (
        <Modal title={`Order ${orderCode(sel.id)}`} onClose={() => setSel(null)}>
          <p className="muted">{fmtDate(sel.created_at)} · <span className={statusClass(sel.status)}>{sel.status}</span></p>
          <div style={{ margin: '1rem 0' }}>
            {sel.items.map((i) => (
              <div className="sum-line" key={i.id}><span>{i.item_name} x {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>
            ))}
            <div className="sum-line"><span>Subtotal</span><span>{money(sel.subtotal)}</span></div>
            <div className="sum-line"><span>Tax</span><span>{money(sel.tax_amount)}</span></div>
            <div className="sum-line"><span>Delivery Charge</span><span>{money(sel.delivery_charge)}</span></div>
            <div className="sum-line total"><span>Total</span><b>{money(sel.total_amount)}</b></div>
          </div>
          <p><b>Payment:</b> {sel.payment_method}</p>
          <p><b>Delivery address:</b> {sel.delivery_address}</p>
        </Modal>
      )}
    </div>
  );
}
