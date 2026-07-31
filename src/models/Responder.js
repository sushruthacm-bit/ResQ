/**
 * Responder model – represents the responders table schema.
 */
const Responder = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  phone: row.phone,
  status: row.status,
  latitude: row.latitude,
  longitude: row.longitude,
  created_at: row.created_at,
});

module.exports = Responder;
