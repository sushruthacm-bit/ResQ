require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'resq_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Users ──────────────────────────────────────────────────────────────
    const usersResult = await client.query(`
      INSERT INTO users (name, email, phone, role) VALUES
        ('Alice Johnson',  'alice@example.com',   '+1-555-0101', 'citizen'),
        ('Bob Martinez',   'bob@example.com',     '+1-555-0102', 'citizen'),
        ('Carol White',    'carol@example.com',   '+1-555-0103', 'dispatcher'),
        ('David Lee',      'david@example.com',   '+1-555-0104', 'citizen'),
        ('Eva Brown',      'eva@example.com',     '+1-555-0105', 'admin')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);
    console.log(`✅ Seeded ${usersResult.rowCount} users`);

    // ── Responders ─────────────────────────────────────────────────────────
    const respondersResult = await client.query(`
      INSERT INTO responders (name, type, phone, status, latitude, longitude) VALUES
        ('Unit Alpha – Paramedic',    'Paramedic',      '+1-555-0201', 'available', 40.7128,  -74.0060),
        ('Unit Bravo – Firefighter',  'Firefighter',    '+1-555-0202', 'available', 40.7138,  -74.0070),
        ('Unit Charlie – Police',     'Police Officer', '+1-555-0203', 'available', 40.7148,  -74.0080),
        ('Unit Delta – Paramedic',    'Paramedic',      '+1-555-0204', 'available', 40.7158,  -74.0090),
        ('Unit Echo – Police',        'Police Officer', '+1-555-0205', 'available', 40.7168,  -74.0100)
      RETURNING id
    `);
    console.log(`✅ Seeded ${respondersResult.rowCount} responders`);

    // Fetch real user IDs for emergencies
    const { rows: users } = await client.query('SELECT id FROM users ORDER BY id LIMIT 5');

    // ── Emergency Requests ─────────────────────────────────────────────────
    const emergenciesResult = await client.query(`
      INSERT INTO emergency_requests
        (user_id, latitude, longitude, description, category, priority, recommended_responder, classification_source, status)
      VALUES
        ($1, 40.7128, -74.0060, 'Person collapsed on the street, not breathing.',       'Medical', 'critical', 'Paramedic',      'rule_engine', 'pending'),
        ($2, 40.7200, -74.0100, 'Building on fire, smoke visible from third floor.',     'Fire',    'high',     'Firefighter',    'rule_engine', 'pending'),
        ($3, 40.7300, -74.0200, 'Armed robbery in progress at convenience store.',       'Police',  'high',     'Police Officer', 'rule_engine', 'pending'),
        ($4, 40.7400, -74.0300, 'Car accident with injuries on highway.',                'Medical', 'high',     'Paramedic',      'rule_engine', 'pending'),
        ($5, 40.7500, -74.0400, 'Suspicious person breaking into a parked vehicle.',     'Police',  'medium',   'Police Officer', 'rule_engine', 'pending')
      RETURNING id
    `, [users[0].id, users[1].id, users[2].id, users[3].id, users[4].id]);
    console.log(`✅ Seeded ${emergenciesResult.rowCount} emergency requests`);

    await client.query('COMMIT');
    console.log('✅ Seeding completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
