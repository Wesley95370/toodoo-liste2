const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'TodooPass2025!',
  database: process.env.DB_NAME || 'todoo_db',
  port: process.env.DB_PORT || 5432
});

pool.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à PostgreSQL:', err);
    return;
  }
  console.log('Connexion à PostgreSQL réussie:', {
    host: pool.options.host,
    user: pool.options.user,
    database: pool.options.database,
    port: pool.options.port
  });
});

module.exports = pool;