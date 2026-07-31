/**
 * Log model – represents the system_logs table schema.
 */
const Log = (row) => ({
  id: row.id,
  event: row.event,
  payload: row.payload,
  created_at: row.created_at,
});

module.exports = Log;
