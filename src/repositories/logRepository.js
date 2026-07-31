const pool = require('../config/db');
const Log = require('../models/Log');

const create = async ({ event, payload }) => {
  const { rows } = await pool.query(
    `INSERT INTO system_logs (event, payload) VALUES ($1, $2) RETURNING *`,
    [event, JSON.stringify(payload)]
  );
  return Log(rows[0]);
};

const findAll = async (limit = 100) => {
  const { rows } = await pool.query(
    'SELECT * FROM system_logs ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return rows.map(Log);
};

module.exports = { create, findAll };
