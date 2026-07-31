/**
 * EmergencyRequest model – represents the emergency_requests table schema.
 */
const EmergencyRequest = (row) => ({
  id: row.id,
  user_id: row.user_id,
  latitude: row.latitude,
  longitude: row.longitude,
  description: row.description,
  category: row.category,
  priority: row.priority,
  recommended_responder: row.recommended_responder,
  classification_source: row.classification_source,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

module.exports = EmergencyRequest;
