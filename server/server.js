require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const pool = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Express 4 does not catch rejected promises from async handlers, so wrap every route handler.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
function wrapRouter(router) {
  router.stack.forEach((layer) => {
    if (layer.route) layer.route.stack.forEach((l) => { if (l.handle.constructor.name === 'AsyncFunction') l.handle = wrap(l.handle); });
  });
  return router;
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/settings', (req, res) =>
  res.json({
    taxRate: Number(process.env.TAX_RATE) || 0,
    deliveryCharge: Number(process.env.DELIVERY_CHARGE) || 0,
    currency: process.env.CURRENCY_SYMBOL || '₹',
  })
);

app.use('/api/auth', wrapRouter(require('./routes/authRoutes')));
app.use('/api/menu', wrapRouter(require('./routes/menuRoutes')));
app.use('/api/categories', wrapRouter(require('./routes/categoryRoutes')));
app.use('/api/orders', wrapRouter(require('./routes/orderRoutes')));
app.use('/api/customers', wrapRouter(require('./routes/customerRoutes')));
app.use('/api/contact', wrapRouter(require('./routes/contactRoutes')));
app.use('/api/dashboard', wrapRouter(require('./routes/dashboardRoutes')));

app.use(
  '/api/payment',
  wrapRouter(require('./routes/paymentRoutes'))
);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
pool.query('SELECT 1')
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Unable to connect to MySQL:', err.message);
    console.error('Check DB_* values in server/.env and that you ran the SQL script.');
    process.exit(1);
  });
