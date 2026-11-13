const pool = require('../config/database');
const httpError = require('../utils/httpError');
const { str } = require('../utils/validators');

const SELECT = `SELECT c.*, (SELECT COUNT(*) FROM menu_items m WHERE m.category_id = c.id) AS item_count FROM categories c`;

exports.list = async (req, res) => {
  const [rows] = await pool.query(`${SELECT} ORDER BY c.name`);
  res.json(rows);
};

exports.create = async (req, res) => {
  const name = str(req.body.name);
  if (!name) throw httpError(400, 'Category name is required.');
  const [r] = await pool.query('INSERT INTO categories (name, description) VALUES (?,?)', [name, str(req.body.description) || null]);
  const [rows] = await pool.query(`${SELECT} WHERE c.id = ?`, [r.insertId]);
  res.status(201).json({ message: 'Category added successfully.', category: rows[0] });
};

exports.update = async (req, res) => {
  const name = str(req.body.name);
  if (!name) throw httpError(400, 'Category name is required.');
  const [r] = await pool.query('UPDATE categories SET name=?, description=? WHERE id=?',
    [name, str(req.body.description) || null, req.params.id]);
  if (!r.affectedRows) throw httpError(404, 'Category not found.');
  const [rows] = await pool.query(`${SELECT} WHERE c.id = ?`, [req.params.id]);
  res.json({ message: 'Category updated successfully.', category: rows[0] });
};

// Foods in a deleted category stay on the menu without a category.
exports.remove = async (req, res) => {
  const [r] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) throw httpError(404, 'Category not found.');
  res.json({ message: 'Category deleted successfully.' });
};
