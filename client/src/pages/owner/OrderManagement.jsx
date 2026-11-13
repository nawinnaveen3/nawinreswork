import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { orderCode, fmtDate, statusClass } from '../../utils';

const FLOW = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];

export default function OrderManagement() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState('All');
  const { money } = useCart();
  const toast = useToast();

  const load = () => api.get('/orders').then(setOrders).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const setStatus = async (o, status) => {
    try { const r = await api.put(`/orders/${o.id}/status`, { status }); toast.success(r.message); await load(); }
    catch (err) { toast.error(err.message); }
  };

  if (error) return <div className="empty">{error}</div>;
  if (!orders) return <Spinner />;
  const shown = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <div className="page-head row between">
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Orders</h1>
        <select className="input" style={{ width: 200 }} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          {['All', ...FLOW, 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {shown.length === 0 ? <div className="empty">No orders found.</div> : (
        <div className="table-wrap">
          <table style={{ minWidth: 900 }}>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Qty</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {shown.map((o) => {
                const next = FLOW[FLOW.indexOf(o.status) + 1];
                const closed = o.status === 'Delivered' || o.status === 'Cancelled';
                return (
                  <tr key={o.id}>
                    <td><button className="chip" onClick={() => setSel(o)}>{orderCode(o.id)}</button></td>
                    <td>{o.customer_name}<div className="muted">{o.customer_phone}</div></td>
                    <td>{fmtDate(o.created_at)}</td>
                    <td>{o.items.map((i) => `${i.item_name} x${i.quantity}`).join(', ')}</td>
                    <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td>{money(o.total_amount)}</td>
                    <td>{o.payment_method}</td>
                    <td><span className={statusClass(o.status)}>{o.status}</span></td>
                    <td>{closed ? '-' : (
                      <div className="row" style={{ gap: '.4rem' }}>
                        {next && <button className="btn btn-gold btn-sm" onClick={() => setStatus(o, next)}>Mark {next}</button>}
                        <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm('Cancel this order?')) setStatus(o, 'Cancelled'); }}>Cancel</button>
                      </div>
                    )}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {sel && (
        <Modal title={`Order ${orderCode(sel.id)}`} onClose={() => setSel(null)}>
          <p><b>{sel.customer_name}</b> · {sel.customer_phone} · {sel.customer_email}</p>
          <p className="muted" style={{ marginBottom: '1rem' }}>{fmtDate(sel.created_at)} · {sel.payment_method}</p>
          {sel.items.map((i) => <div className="sum-line" key={i.id}><span>{i.item_name} x {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>)}
          <div className="sum-line"><span>Subtotal</span><span>{money(sel.subtotal)}</span></div>
          <div className="sum-line"><span>Tax</span><span>{money(sel.tax_amount)}</span></div>
          <div className="sum-line"><span>Delivery Charge</span><span>{money(sel.delivery_charge)}</span></div>
          <div className="sum-line total"><span>Total</span><b>{money(sel.total_amount)}</b></div>
          <p style={{ marginTop: '1rem' }}><b>Deliver to:</b> {sel.delivery_address}</p>
        </Modal>
      )}
    </>
  );
}
