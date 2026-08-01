const pool = require('../config/db');
const Responder = require('../models/Responder');

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM responders WHERE id = $1', [id]);
  return rows[0] ? Responder(rows[0]) : null;
};

const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM responders ORDER BY created_at DESC');
  return rows.map(Responder);
};

const updateStatus = async (id, status) => {
  const { rows } = await pool.query(
    'UPDATE responders SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0] ? Responder(rows[0]) : null;
};

const findNearestAvailable = async (type, latitude, longitude) => {
  const { rows } = await pool.query(
    `SELECT *,
      ( 6371 * acos(
          cos(radians($1)) * cos(radians(latitude::float)) *
          cos(radians(longitude::float) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude::float))
        )
      ) AS distance_km
     FROM responders
     WHERE status = 'available' AND type = $3
     ORDER BY distance_km ASC
     LIMIT 1`,
    [latitude, longitude, type]
  );
  return rows[0] ? Responder(rows[0]) : null;
};

module.exports = { findById, findAll, updateStatus, findNearestAvailable };
