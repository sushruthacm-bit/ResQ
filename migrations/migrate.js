require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'resq_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const run = async () => {
  const sqlFile = path.join(__dirname, '001_initial_schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Running migrations...');
  try {
    await pool.query(sql);
    console.log('✅ Migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();
