// routes/salleRoutes.js
const express = require('express');
const { body } = require('express-validator');
const salleController = require('../controllers/salleController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validateMiddleware');

const router = express.Router();

// GET /api/salles
router.get('/', authMiddleware, salleController.getAll);

// GET /api/salles/:id
router.get('/:id', authMiddleware, salleController.getById);

// GET /api/salles/:id/disponibilites
router.get('/:id/disponibilites', authMiddleware, salleController.getDisponibilites);

// POST /api/salles (admin uniquement)
router.post('/', authMiddleware, checkRole('admin'),
  [
    body('nom').trim().notEmpty().withMessage('Le nom est obligatoire'),
    body('capacite').isInt({ min: 1 }).withMessage('La capacité doit être un entier positif'),
    body('equipements').optional().isArray().withMessage('Les équipements doivent être un tableau')
  ],
  handleValidationErrors,
  salleController.create
);

// PUT /api/salles/:id (admin uniquement)
router.put('/:id', authMiddleware, checkRole('admin'),
  [
    body('nom').optional().trim().notEmpty(),
    body('capacite').optional().isInt({ min: 1 }),
    body('equipements').optional().isArray()
  ],
  handleValidationErrors,
  salleController.update
);

// DELETE /api/salles/:id (admin uniquement)
router.delete('/:id', authMiddleware, checkRole('admin'), salleController.delete);

module.exports = router;
