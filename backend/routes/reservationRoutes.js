// routes/reservationRoutes.js
const express = require('express');
const { body } = require('express-validator');
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validateMiddleware');

const router = express.Router();

// GET /api/reservations
router.get('/', authMiddleware, reservationController.getAll);

// POST /api/reservations (user)
router.post('/', authMiddleware,
  [
    body('salle_id').isInt({ min: 1 }).withMessage('salle_id invalide'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Format date invalide (YYYY-MM-DD)'),
    body('heure_debut').matches(/^\d{2}:\d{2}$/).withMessage('Format heure_debut invalide (HH:MM)'),
    body('heure_fin').matches(/^\d{2}:\d{2}$/).withMessage('Format heure_fin invalide (HH:MM)'),
    body('objet').trim().isLength({ min: 3 }).withMessage('L\'objet doit contenir au minimum 3 caractères'),
    body('nb_participants').isInt({ min: 1 }).withMessage('nb_participants doit être au minimum 1')
  ],
  handleValidationErrors,
  reservationController.create
);

// PUT /api/reservations/:id/valider (admin)
router.put('/:id/valider', authMiddleware, checkRole('admin'), reservationController.valider);

// PUT /api/reservations/:id/refuser (admin)
router.put('/:id/refuser', authMiddleware, checkRole('admin'),
  [
    body('motif_refus').trim().isLength({ min: 10 }).withMessage('Le motif doit contenir au minimum 10 caractères')
  ],
  handleValidationErrors,
  reservationController.refuser
);

// PUT /api/reservations/:id (user propriétaire, en_attente uniquement)
router.put('/:id', authMiddleware,
  [
    body('salle_id').optional().isInt({ min: 1 }).withMessage('salle_id invalide'),
    body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Format date invalide (YYYY-MM-DD)'),
    body('heure_debut').optional().matches(/^\d{2}:\d{2}$/).withMessage('Format heure_debut invalide (HH:MM)'),
    body('heure_fin').optional().matches(/^\d{2}:\d{2}$/).withMessage('Format heure_fin invalide (HH:MM)'),
    body('objet').optional().trim().isLength({ min: 3 }).withMessage('L\'objet doit contenir au minimum 3 caractères'),
    body('nb_participants').optional().isInt({ min: 1 }).withMessage('nb_participants doit être au minimum 1')
  ],
  handleValidationErrors,
  reservationController.modifier
);

// DELETE /api/reservations/:id (user propriétaire)
router.delete('/:id', authMiddleware, reservationController.supprimer);

module.exports = router;
