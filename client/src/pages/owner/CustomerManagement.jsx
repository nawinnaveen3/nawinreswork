import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { orderCode, fmtDate, statusClass } from '../../utils';

export default function CustomerManagement() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState(null);
  const [orders, setOrders] = useState(null);
  const { money } = useCart();
  const toast = useToast();

  useEffect(() => { api.get('/customers').then(setList).catch((e) => setError(e.message)); }, []);

  const view = async (c) => {
    setSel(c); setOrders(null);
    try { setOrders(await api.get(`/orders?customerId=${c.id}`)); } catch (err) { toast.error(err.message); }
  };

  if (error) return <div className="empty">{error}</div>;
  if (!list) return <Spinner />;

  return (
    <>
      <div className="page-head"><h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Customers</h1></div>
      {list.length === 0 ? <div className="empty">No customers have registered yet.</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Registered</th><th>Orders</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td><td><b>{c.name}</b></td><td>{c.email}</td><td>{c.phone}</td><td>{c.address}</td>
                  <td>{fmtDate(c.created_at)}</td>
                  <td><button className="chip" onClick={() => view(c)}>{c.order_count} · View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sel && (
        <Modal wide title={`${sel.name} - order history`} onClose={() => setSel(null)}>
          {!orders ? <Spinner /> : orders.length === 0 ? <div className="empty">This customer has no orders yet.</div> : (
            <div className="table-wrap">
              <table style={{ minWidth: 560 }}>
                <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}><td>{orderCode(o.id)}</td><td>{fmtDate(o.created_at)}</td>
                      <td>{o.items.map((i) => `${i.item_name} x${i.quantity}`).join(', ')}</td>
                      <td>{money(o.total_amount)}</td><td><span className={statusClass(o.status)}>{o.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
