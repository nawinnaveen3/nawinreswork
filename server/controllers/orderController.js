const pool = require('../config/database');
const httpError = require('../utils/httpError');
const { str, round2 } = require('../utils/validators');

const FLOW = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
const PAYMENTS = ['Cash on Delivery', 'Online Payment'];
const BASE = `SELECT o.*, u.name AS customer_name, u.phone AS customer_phone, u.email AS customer_email
              FROM orders o JOIN users u ON u.id = o.customer_id`;

async function withItems(orders) {
  if (!orders.length) return orders;
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id IN (?) ORDER BY id', [orders.map((o) => o.id)]);
  return orders.map((o) => ({ ...o, items: items.filter((i) => i.order_id === o.id) }));
}

exports.create = async (req, res) => {
  if (req.user.role !== 'customer') throw httpError(403, 'Only customers can place orders.');
  const { items, payment_method } = req.body;
  const delivery_address = str(req.body.delivery_address);

  if (!Array.isArray(items) || !items.length) throw httpError(400, 'Your cart is empty.');
  if (!PAYMENTS.includes(payment_method)) throw httpError(400, 'Please choose a payment method.');
  if (!delivery_address) throw httpError(400, 'Please fill all required fields.');

  const qtyById = new Map();
  for (const it of items) {
    const id = Number(it.menu_item_id), q = Number(it.quantity);
    if (!Number.isInteger(id) || !Number.isInteger(q) || q < 1 || q > 50) throw httpError(400, 'Invalid item quantity.');
    qtyById.set(id, (qtyById.get(id) || 0) + q);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const ids = [...qtyById.keys()];
    const [rows] = await conn.query('SELECT id, name, price, availability FROM menu_items WHERE id IN (?)', [ids]);
    if (rows.length !== ids.length) throw httpError(400, 'One or more items are no longer on the menu.');
    const bad = rows.find((r) => !r.availability);
    if (bad) throw httpError(400, `${bad.name} is currently unavailable.`);

    // Prices always come from MySQL, never from the browser.
    const subtotal = round2(rows.reduce((s, r) => s + r.price * qtyById.get(r.id), 0));
    const tax = round2(subtotal * (Number(process.env.TAX_RATE) || 0));
    const delivery = Number(process.env.DELIVERY_CHARGE) || 0;
    const total = round2(subtotal + tax + delivery);

    
const initialStatus =
  payment_method === 'Online Payment'
    ? 'Confirmed'
    : 'Pending';

const [o] = await conn.query(
  `INSERT INTO orders
   (customer_id, subtotal, tax_amount, delivery_charge,
    total_amount, payment_method, status, delivery_address)
   VALUES (?,?,?,?,?,?,?,?)`,
  [
    req.user.id,
    subtotal,
    tax,
    delivery,
    total,
    payment_method,
    initialStatus,
    delivery_address
  ]
);
    await conn.query('INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price) VALUES ?',
      [rows.map((r) => [o.insertId, r.id, r.name, qtyById.get(r.id), r.price])]);
    await conn.commit();
    res.status(201).json({ message: 'Order placed successfully!', order: { id: o.insertId, total_amount: total } });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.list = async (req, res) => {
  const where = [], params = [];
  if (req.user.role === 'customer') { where.push('o.customer_id = ?'); params.push(req.user.id); }
  else if (req.query.customerId) { where.push('o.customer_id = ?'); params.push(Number(req.query.customerId)); }
  const [rows] = await pool.query(`${BASE} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY o.created_at DESC, o.id DESC`, params);
  res.json(await withItems(rows));
};

exports.getOne = async (req, res) => {
  const [rows] = await pool.query(`${BASE} WHERE o.id = ?`, [req.params.id]);
  if (!rows.length || (req.user.role === 'customer' && rows[0].customer_id !== req.user.id))
    throw httpError(404, 'Order not found.');
  res.json((await withItems(rows))[0]);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const [rows] = await pool.query('SELECT status FROM orders WHERE id = ?', [req.params.id]);
  if (!rows.length) throw httpError(404, 'Order not found.');
  const current = rows[0].status;

  if (current === 'Delivered' || current === 'Cancelled') throw httpError(400, `A ${current.toLowerCase()} order cannot be changed.`);
  if (status === 'Cancelled') { /* allowed from any open status */ }
  else if (!FLOW.includes(status) || FLOW.indexOf(status) <= FLOW.indexOf(current))
    throw httpError(400, 'Invalid status change.');

  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: `Order marked as ${status}.` });
};
