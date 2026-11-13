const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const httpError = require('../utils/httpError');
const { isEmail, isPhone, isUsername, isStrongPassword, str } = require('../utils/validators');

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
const publicUser = ({ password, ...rest }) => rest;

exports.register = async (req, res) => {
  const name = str(req.body.name), email = str(req.body.email).toLowerCase(), phone = str(req.body.phone);
  const address = str(req.body.address), username = str(req.body.username);
  const { password, confirmPassword } = req.body;

  if (!name || !email || !phone || !address || !username || !password || !confirmPassword)
    throw httpError(400, 'Please fill all required fields.');
  if (!isEmail(email)) throw httpError(400, 'Please enter a valid email address.');
  if (!isPhone(phone)) throw httpError(400, 'Please enter a valid phone number.');
  if (!isUsername(username)) throw httpError(400, 'Username must be 3-30 characters: letters, numbers or underscore.');
  if (!isStrongPassword(password)) throw httpError(400, 'Password must be at least 8 characters and include a letter and a number.');
  if (password !== confirmPassword) throw httpError(400, 'Passwords do not match.');

  const [dups] = await pool.query('SELECT email, username FROM users WHERE email = ? OR username = ?', [email, username]);
  if (dups.some((d) => d.email === email)) throw httpError(409, 'An account with this email already exists.');
  if (dups.length) throw httpError(409, 'This username is already taken.');

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (name,email,phone,address,username,password,role) VALUES (?,?,?,?,?,?,"customer")',
    [name, email, phone, address, username, hash]
  );
  res.status(201).json({ message: 'Account created successfully.' });
};

exports.customerLogin = async (req, res) => {
  const identifier = str(req.body.identifier), { password } = req.body;
  if (!identifier || !password) throw httpError(400, 'Please fill all required fields.');

  const [rows] = await pool.query(
    'SELECT * FROM users WHERE (username = ? OR email = ?) AND role = "customer" LIMIT 1',
    [identifier, identifier.toLowerCase()]
  );
  if (!rows.length) throw httpError(404, 'Account does not exist.');
  if (!(await bcrypt.compare(password, rows[0].password))) throw httpError(401, 'Invalid password.');

  res.json({ message: 'Login successful.', token: sign(rows[0]), user: publicUser(rows[0]) });
};

exports.ownerLogin = async (req, res) => {
  const username = str(req.body.username), { password } = req.body;
  if (!username || !password) throw httpError(400, 'Please fill all required fields.');

  const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND role = "owner" LIMIT 1', [username]);
  if (!rows.length || !(await bcrypt.compare(password, rows[0].password)))
    throw httpError(401, 'Invalid username or password.');

  res.json({ message: 'Owner login successful.', token: sign(rows[0]), user: publicUser(rows[0]) });
};

// JWTs are stateless: the client discards its token. This endpoint exists for API completeness.
exports.logout = (req, res) => res.json({ message: 'Logged out successfully.' });
