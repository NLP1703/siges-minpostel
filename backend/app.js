// app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/authRoutes');
const salleRoutes = require('./routes/salleRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares de sécurité
app.use(helmet()); // Défense contre les attaques courantes
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting sur les routes auth
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 10,
  message: 'Trop de tentatives, réessayez plus tard',
  standardHeaders: true,
  legacyHeaders: false
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', limiter, authRoutes);
app.use('/api/salles', salleRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('❌ Erreur non gérée:', error);
  
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

module.exports = app;
