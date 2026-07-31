/**
 * StatusHistory model – represents the status_history table schema.
 */
const StatusHistory = (row) => ({
  id: row.id,
  request_id: row.request_id,
  old_status: row.old_status,
  new_status: row.new_status,
  changed_at: row.changed_at,
  changed_by: row.changed_by,
});

module.exports = StatusHistory;
