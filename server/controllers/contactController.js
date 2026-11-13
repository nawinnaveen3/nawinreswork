const pool = require('../config/database');
const httpError = require('../utils/httpError');
const { isEmail, isPhone, str } = require('../utils/validators');

exports.create = async (req, res) => {
  const name = str(req.body.name), email = str(req.body.email), phone = str(req.body.phone), message = str(req.body.message);
  if (!name || !email || !message) throw httpError(400, 'Please fill all required fields.');
  if (!isEmail(email)) throw httpError(400, 'Please enter a valid email address.');
  if (phone && !isPhone(phone)) throw httpError(400, 'Please enter a valid phone number.');
  if (message.length > 2000) throw httpError(400, 'Message is too long.');
  await pool.query('INSERT INTO contact_messages (name,email,phone,message) VALUES (?,?,?,?)', [name, email, phone || null, message]);
  res.status(201).json({ message: 'Thank you! Your message has been sent.' });
};

exports.list = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC');
  res.json(rows);
};
