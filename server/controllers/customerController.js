const bcrypt = require('bcrypt');
const pool = require('../config/database');
const httpError = require('../utils/httpError');
const { isPhone, isStrongPassword, str } = require('../utils/validators');

const COLS = 'id, name, email, phone, address, username, role, created_at';

exports.list = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ${COLS}, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = users.id) AS order_count
     FROM users WHERE role = 'customer' ORDER BY id DESC`
  );
  res.json(rows);
};

exports.getOne = async (req, res) => {
  const id = Number(req.params.id);
  if (req.user.role !== 'owner' && req.user.id !== id) throw httpError(403, 'You can only view your own profile.');
  const [rows] = await pool.query(`SELECT ${COLS} FROM users WHERE id = ?`, [id]);
  if (!rows.length) throw httpError(404, 'Customer not found.');
  res.json(rows[0]);
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  if (req.user.id !== id) throw httpError(403, 'You can only update your own profile.');

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  if (!rows.length) throw httpError(404, 'User not found.');
  const u = rows[0];

  const name = str(req.body.name) || u.name;
  const phone = str(req.body.phone) || u.phone;
  const address = str(req.body.address) || u.address;
  if (!isPhone(phone)) throw httpError(400, 'Please enter a valid phone number.');

  let hash = u.password;
  if (req.body.newPassword) {
    if (!req.body.currentPassword || !(await bcrypt.compare(req.body.currentPassword, u.password)))
      throw httpError(400, 'Current password is incorrect.');
    if (!isStrongPassword(req.body.newPassword))
      throw httpError(400, 'New password must be at least 8 characters and include a letter and a number.');
    hash = await bcrypt.hash(req.body.newPassword, 10);
  }

  await pool.query('UPDATE users SET name=?, phone=?, address=?, password=? WHERE id=?', [name, phone, address, hash, id]);
  const [out] = await pool.query(`SELECT ${COLS} FROM users WHERE id = ?`, [id]);
  res.json({ message: 'Profile updated successfully.', user: out[0] });
};
