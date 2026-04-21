// routes/userRoutes.js
const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validateMiddleware');

const router = express.Router();

// Toutes les routes utilisateurs nécessitent une authentification admin
router.use(authMiddleware);
router.use(checkRole('admin'));

// GET /api/users
router.get('/', userController.getAll);

// GET /api/users/:id
router.get('/:id', userController.getById);

// PUT /api/users/:id
router.put('/:id',
  [
    body('nom').optional().trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au minimum 2 caractères'),
    body('prenom').optional().trim().isLength({ min: 2 }).withMessage('Le prénom doit contenir au minimum 2 caractères'),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Rôle invalide'),
    body('actif').optional().isBoolean().withMessage('Le champ actif doit être un booléen')
  ],
  handleValidationErrors,
  userController.update
);

// PUT /api/users/:id/password
router.put('/:id/password',
  [
    body('newPassword').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au minimum 8 caractères')
  ],
  handleValidationErrors,
  userController.updatePassword
);

// DELETE /api/users/:id
router.delete('/:id', userController.delete);

module.exports = router;