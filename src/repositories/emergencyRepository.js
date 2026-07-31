const pool = require('../config/db');
const EmergencyRequest = require('../models/EmergencyRequest');

const create = async ({ user_id, latitude, longitude, description, category, priority, recommended_responder, classification_source }) => {
  const { rows } = await pool.query(
    `INSERT INTO emergency_requests
      (user_id, latitude, longitude, description, category, priority, recommended_responder, classification_source, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
     RETURNING *`,
    [user_id, latitude, longitude, description, category, priority, recommended_responder, classification_source]
  );
  return EmergencyRequest(rows[0]);
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM emergency_requests WHERE id = $1', [id]);
  return rows[0] ? EmergencyRequest(rows[0]) : null;
};

const findByIds = async (ids) => {
  if (!ids.length) return [];
  const { rows } = await pool.query(
    'SELECT * FROM emergency_requests WHERE id = ANY($1::int[])',
    [ids]
  );
  return rows.map(EmergencyRequest);
};

const findActive = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM emergency_requests WHERE status NOT IN ('resolved', 'cancelled') ORDER BY created_at DESC`
  );
  return rows.map(EmergencyRequest);
};

const updateStatus = async (id, status) => {
  const { rows } = await pool.query(
    `UPDATE emergency_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0] ? EmergencyRequest(rows[0]) : null;
};

module.exports = { create, findById, findByIds, findActive, updateStatus };
