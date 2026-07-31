const pool = require('../config/db');
const StatusHistory = require('../models/StatusHistory');

const create = async ({ request_id, old_status, new_status, changed_by }) => {
  const { rows } = await pool.query(
    `INSERT INTO status_history (request_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4) RETURNING *`,
    [request_id, old_status, new_status, changed_by || null]
  );
  return StatusHistory(rows[0]);
};

const findByRequestId = async (request_id) => {
  const { rows } = await pool.query(
    'SELECT * FROM status_history WHERE request_id = $1 ORDER BY changed_at ASC',
    [request_id]
  );
  return rows.map(StatusHistory);
};

module.exports = { create, findByRequestId };
