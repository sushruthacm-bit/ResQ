/**
 * Assignment model – represents the assignments table schema.
 */
const Assignment = (row) => ({
  id: row.id,
  request_id: row.request_id,
  responder_id: row.responder_id,
  assigned_at: row.assigned_at,
  notes: row.notes,
});

module.exports = Assignment;
