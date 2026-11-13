const pool = require('../config/database');
const httpError = require('../utils/httpError');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const GROUPS = {
  day: { sql: "DATE_FORMAT(created_at,'%Y-%m-%d')", back: 30 },
  week: { sql: "DATE_FORMAT(created_at,'%x-W%v')", back: 84 },
  month: { sql: "DATE_FORMAT(created_at,'%Y-%m')", back: 365 },
};
const iso = (d) => d.toISOString().slice(0, 10);

function range(q, defaultBack, col) {
  const { from, to } = q;
  if ((from && !DATE_RE.test(from)) || (to && !DATE_RE.test(to))) throw httpError(400, 'Invalid date filter.');
  const start = from || iso(new Date(Date.now() - defaultBack * 864e5));
  const clauses = [`${col} >= ?`], params = [start];
  if (to) { clauses.push(`${col} < DATE_ADD(?, INTERVAL 1 DAY)`); params.push(to); }
  return { clauses, params };
}

exports.statistics = async (req, res) => {
  const [[s]] = await pool.query(`SELECT
    (SELECT COUNT(*) FROM orders) AS totalOrders,
    (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()) AS todaysOrders,
    (SELECT COUNT(*) FROM users WHERE role = 'customer') AS totalCustomers,
    (SELECT COUNT(*) FROM menu_items) AS totalMenuItems,
    (SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE status <> 'Cancelled' AND DATE(created_at) = CURDATE()) AS todaysSales,
    (SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE status <> 'Cancelled'
       AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())) AS monthlySales,
    (SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE status <> 'Cancelled') AS totalRevenue`);
  const [orderStatus] = await pool.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');
  res.json({ ...s, orderStatus });
};

exports.sales = async (req, res) => {
  const g = GROUPS[req.query.group] || GROUPS.day;
  const { clauses, params } = range(req.query, g.back, 'created_at');
  const [rows] = await pool.query(
    `SELECT ${g.sql} AS period, COUNT(*) AS orders, COALESCE(SUM(total_amount),0) AS revenue
     FROM orders WHERE status <> 'Cancelled' AND ${clauses.join(' AND ')}
     GROUP BY period ORDER BY period`, params);
  res.json({
    rows,
    totals: { orders: rows.reduce((a, r) => a + r.orders, 0), revenue: rows.reduce((a, r) => a + r.revenue, 0) },
  });
};

exports.popularItems = async (req, res) => {
  const { clauses, params } = range(req.query, 3650, 'o.created_at');
  const [rows] = await pool.query(
    `SELECT oi.item_name AS name, SUM(oi.quantity) AS quantity, SUM(oi.quantity * oi.price) AS revenue
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.status <> 'Cancelled' AND ${clauses.join(' AND ')}
     GROUP BY oi.item_name ORDER BY quantity DESC LIMIT 10`, params);
  res.json(rows.map((r) => ({ ...r, quantity: Number(r.quantity) })));
};
