import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { orderCode } from '../../utils';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { user } = useAuth();
  const { items, totals, money, clear } = useCart();
  const toast = useToast();
  const nav = useNavigate();

  const [f, setF] = useState({
    name: user.name,
    phone: user.phone || '',
    email: user.email,
    address: user.address || '',
  });

  const [payment, setPayment] = useState('Cash on Delivery');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/customers/${user.id}`)
      .then((u) =>
        setF({
          name: u.name,
          phone: u.phone || '',
          email: u.email,
          address: u.address || '',
        })
      )
      .catch(() => {});
  }, [user.id]);

  if (items.length === 0) {
    return (
      <div className="page container">
        <div className="empty">
          Your cart is empty.{' '}
          <Link to="/menu" className="gold">
            Browse the menu
          </Link>
        </div>
      </div>
    );
  }

  const orderItems = items.map((i) => ({
    menu_item_id: i.id,
    quantity: i.quantity,
  }));

  const saveOrder = async (method) => {
  const result = await api.post('/orders', {
    items: orderItems,
    payment_method: method,
    delivery_address: f.address,
  });

  return result;
};

const finishOrder = (result) => {
  clear();
  toast.success(
    `${result.message} Order ID: ${orderCode(result.order.id)}`
  );
  nav('/orders');
};

  const payOnline = async () => {
  // First create the restaurant order in MySQL
  const result = await saveOrder('Online Payment');
  const restaurantOrderId = result.order.id;

  const loaded = await loadRazorpay();

  if (!loaded) {
    throw new Error(
      `Order ${orderCode(restaurantOrderId)} created, but Razorpay did not load.`
    );
  }

  // Create Razorpay order using the saved restaurant order ID
  const paymentOrder = await api.post('/payment/create-order', {
    restaurant_order_id: restaurantOrderId,
  });

  if (!paymentOrder.orderId || !paymentOrder.keyId) {
    throw new Error('Razorpay order could not be created.');
  }

  return new Promise((resolve, reject) => {
    let completed = false;

    const options = {
      key: paymentOrder.keyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency || 'INR',
      name: 'Nawins Restaurant',
      description: `Order ${orderCode(restaurantOrderId)}`,
      order_id: paymentOrder.orderId,
      prefill: {
        name: f.name,
        email: f.email,
        contact: f.phone,
      },
      theme: { color: '#b88645' },

      handler: async (response) => {
        try {
          const verification = await api.post(
            '/payment/verify-payment',
            {
              restaurant_order_id: restaurantOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }
          );

          if (!verification.verified) {
            throw new Error('Payment verification failed.');
          }

          completed = true;
          finishOrder(result);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      },

      modal: {
        ondismiss: () => {
          if (!completed) resolve(false);
        },
      },
    };

    const checkout = new window.Razorpay(options);

    checkout.on('payment.failed', (response) => {
      reject(
        new Error(
          response.error?.description || 'Payment failed. Please try again.'
        )
      );
    });

    checkout.open();
  });
};

 const place = async (e) => {
  e.preventDefault();
  setError('');

  if (!f.address.trim() || !f.phone.trim()) {
    setError('Please fill all required fields.');
    return;
  }

  setBusy(true);

  try {
    if (payment === 'Cash on Delivery') {
      const result = await saveOrder('Cash on Delivery');
      finishOrder(result);
    } else {
      const completed = await payOnline();

      if (!completed) {
        setError(
          'Payment cancelled. Your order remains Pending. Please check My Orders before trying again.'
        );
      }
    }
  } catch (err) {
    setError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setBusy(false);
  }
};


  return (
    <div className="page container">
      <div className="page-head">
        <h1 style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>
          Checkout
        </h1>
      </div>

      <form className="cart-layout" onSubmit={place} noValidate>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Customer information</h3>

          {error && (
            <div className="error-text" role="alert">
              {error}
            </div>
          )}

          <div className="two-col">
            <div className="field">
              <label htmlFor="n">Name</label>
              <input id="n" className="input" value={f.name} readOnly />
            </div>

            <div className="field">
              <label htmlFor="p">Phone</label>
              <input
                id="p"
                className="input"
                value={f.phone}
                onChange={(e) =>
                  setF({ ...f, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="e">Email</label>
            <input id="e" className="input" value={f.email} readOnly />
          </div>

          <div className="field">
            <label htmlFor="a">Delivery Address</label>
            <textarea
              id="a"
              className="input"
              value={f.address}
              onChange={(e) =>
                setF({ ...f, address: e.target.value })
              }
            />
          </div>

          <h3 style={{ margin: '1rem 0' }}>Payment method</h3>

          {['Cash on Delivery', 'Online Payment'].map((method) => (
            <label
              key={method}
              className={`pay-opt ${payment === method ? 'on' : ''}`}
            >
              <input
                type="radio"
                name="pay"
                checked={payment === method}
                disabled={busy}
                onChange={() => setPayment(method)}
              />
              <span>
                {method}
                {method === 'Online Payment' && (
                  <span className="muted"> (Razorpay)</span>
                )}
              </span>
            </label>
          ))}
        </div>

        <aside className="card">
          <h3 style={{ marginBottom: '.8rem' }}>Your order</h3>

          {items.map((i) => (
            <div className="sum-line" key={i.id}>
              <span>
                {i.name} x {i.quantity}
              </span>
              <span>{money(i.price * i.quantity)}</span>
            </div>
          ))}

          <div
            className="sum-line"
            style={{
              borderTop: '1px solid var(--brown-3)',
              marginTop: '.5rem',
            }}
          >
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>

          <div className="sum-line">
            <span>Tax</span>
            <span>{money(totals.tax)}</span>
          </div>

          <div className="sum-line">
            <span>Delivery Charge</span>
            <span>{money(totals.delivery)}</span>
          </div>

          <div className="sum-line total">
            <span>Total</span>
            <b>{money(totals.total)}</b>
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={busy}
          >
            {busy
              ? 'Please wait...'
              : payment === 'Online Payment'
                ? 'Pay Now'
                : 'Place Order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
//Updated chechout