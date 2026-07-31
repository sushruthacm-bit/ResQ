/**
 * User model – plain object factory representing the users table schema.
 */
const User = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  role: row.role,
  created_at: row.created_at,
});

module.exports = User;
