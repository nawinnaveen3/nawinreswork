const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const httpError = require('../utils/httpError');
const { str } = require('../utils/validators');

const SELECT = `SELECT m.*, c.name AS category_name FROM menu_items m LEFT JOIN categories c ON c.id = m.category_id`;
const shape = (r) => ({ ...r, availability: !!r.availability });

const removeUpload = (img) => {
  if (img && img.startsWith('/uploads/')) fs.unlink(path.join(__dirname, '..', img), () => {});
};

function parseBody(req) {
  const name = str(req.body.name);
  const price = Number(req.body.price);
  if (!name) throw httpError(400, 'Food name is required.');
  if (req.body.price === undefined || req.body.price === '' || Number.isNaN(price) || price < 0)
    throw httpError(400, 'Please enter a valid price.');
  const cat = req.body.category_id;
  const category_id = cat === undefined || cat === '' || cat === 'null' ? null : Number(cat);
  if (category_id !== null && !Number.isInteger(category_id)) throw httpError(400, 'Invalid category.');
  const a = req.body.availability;
  const availability = a === undefined ? 1 : a === true || a === 'true' || a === '1' || a === 1 ? 1 : 0;
  return { name, description: str(req.body.description), price, category_id, availability };
}

exports.list = async (req, res) => {
  const [rows] = await pool.query(`${SELECT} ORDER BY m.created_at DESC, m.id DESC`);
  res.json(rows.map(shape));
};

exports.getOne = async (req, res) => {
  const [rows] = await pool.query(`${SELECT} WHERE m.id = ?`, [req.params.id]);
  if (!rows.length) throw httpError(404, 'Food item not found.');
  res.json(shape(rows[0]));
};

exports.create = async (req, res) => {
  const d = parseBody(req);
  const image = req.file ? `/uploads/${req.file.filename}` : str(req.body.image) || null;
  const [r] = await pool.query(
    'INSERT INTO menu_items (category_id,name,description,price,image,availability) VALUES (?,?,?,?,?,?)',
    [d.category_id, d.name, d.description, d.price, image, d.availability]
  );
  const [rows] = await pool.query(`${SELECT} WHERE m.id = ?`, [r.insertId]);
  res.status(201).json({ message: 'Food item added successfully.', item: shape(rows[0]) });
};

exports.update = async (req, res) => {
  const [existing] = await pool.query('SELECT image FROM menu_items WHERE id = ?', [req.params.id]);
  if (!existing.length) throw httpError(404, 'Food item not found.');
  const d = parseBody(req);

  let image = existing[0].image;
  if (req.file) image = `/uploads/${req.file.filename}`;
  else if (req.body.image !== undefined) image = str(req.body.image) || null;
  if (image !== existing[0].image) removeUpload(existing[0].image);

  await pool.query(
    'UPDATE menu_items SET category_id=?, name=?, description=?, price=?, image=?, availability=? WHERE id=?',
    [d.category_id, d.name, d.description, d.price, image, d.availability, req.params.id]
  );
  const [rows] = await pool.query(`${SELECT} WHERE m.id = ?`, [req.params.id]);
  res.json({ message: 'Food item updated successfully.', item: shape(rows[0]) });
};

exports.remove = async (req, res) => {
  const [existing] = await pool.query('SELECT image FROM menu_items WHERE id = ?', [req.params.id]);
  if (!existing.length) throw httpError(404, 'Food item not found.');
  await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
  removeUpload(existing[0].image);
  res.json({ message: 'Food item deleted successfully.' });
};
