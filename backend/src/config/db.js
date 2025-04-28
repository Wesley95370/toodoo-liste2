const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'TodooPass2025!',
  database: process.env.DB_NAME || 'todoo_db',
  port: process.env.DB_PORT || 5432
});

// Test de la connexion au démarrage
pool.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à PostgreSQL:', err.stack);
    return;
  }
  console.log('Connexion à PostgreSQL réussie:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    database: process.env.DB_NAME || 'todoo_db',
    port: process.env.DB_PORT || 5432
  });
});

module.exports = pool;