// config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'siges_minpostel',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

// Test de la connexion au démarrage
pool.getConnection().then(connection => {
  console.log('✅ Connexion MySQL établie avec succès');
  connection.release();
}).catch(err => {
  console.error('❌ Erreur connexion MySQL:', err.message);
  process.exit(1);
});

module.exports = pool;
