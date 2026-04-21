// routes/dashboardRoutes.js
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// GET /api/dashboard/stats (admin uniquement)
router.get('/stats', authMiddleware, checkRole('admin'), dashboardController.getStats);

module.exports = router;
