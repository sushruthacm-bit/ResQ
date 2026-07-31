const pool = require('../config/db');
const User = require('../models/User');

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ? User(rows[0]) : null;
};

const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return rows.map(User);
};

module.exports = { findById, findAll };
