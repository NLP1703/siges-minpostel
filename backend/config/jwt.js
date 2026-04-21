// config/jwt.js
require('dotenv').config();

module.exports = {
  SECRET: process.env.JWT_SECRET || 'default_secret_key_change_in_production_minimum_64_chars',
  EXPIRY: process.env.JWT_EXPIRY || '8h',
  ALGORITHM: 'HS256'
};
