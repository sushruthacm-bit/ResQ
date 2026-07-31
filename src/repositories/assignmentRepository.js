const pool = require('../config/db');
const Assignment = require('../models/Assignment');

const create = async ({ request_id, responder_id, notes }) => {
  const { rows } = await pool.query(
    `INSERT INTO assignments (request_id, responder_id, notes) VALUES ($1, $2, $3) RETURNING *`,
    [request_id, responder_id, notes || null]
  );
  return Assignment(rows[0]);
};

const findByRequestId = async (request_id) => {
  const { rows } = await pool.query(
    'SELECT * FROM assignments WHERE request_id = $1 ORDER BY assigned_at DESC',
    [request_id]
  );
  return rows.map(Assignment);
};

module.exports = { create, findByRequestId };
