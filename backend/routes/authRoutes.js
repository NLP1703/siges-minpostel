// routes/authRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { handleValidationErrors } = require('../middlewares/validateMiddleware');

const router = express.Router();

// POST /api/auth/register
router.post('/register',
  [
    body('nom').trim().notEmpty().withMessage('Le nom est obligatoire'),
    body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('motDePasse')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au minimum 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Le mot de passe doit contenir minuscules, majuscules et chiffres')
  ],
  handleValidationErrors,
  authController.register
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('motDePasse').notEmpty().withMessage('Le mot de passe est obligatoire')
  ],
  handleValidationErrors,
  authController.login
);

// GET /api/auth/me
router.get('/me', authMiddleware, authController.me);

// PUT /api/auth/me - Mettre à jour son propre profil
router.put('/me',
  authMiddleware,
  [
    body('nom').optional().trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au minimum 2 caractères'),
    body('prenom').optional().trim().isLength({ min: 2 }).withMessage('Le prénom doit contenir au minimum 2 caractères'),
    body('telephone').optional().trim()
  ],
  handleValidationErrors,
  authController.updateMe
);

// PUT /api/auth/me/password - Changer son propre mot de passe
router.put('/me/password',
  authMiddleware,
  [
    body('motDePasseActuel').notEmpty().withMessage('Le mot de passe actuel est obligatoire'),
    body('nouveauMotDePasse')
      .isLength({ min: 8 })
      .withMessage('Le nouveau mot de passe doit contenir au minimum 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Le mot de passe doit contenir minuscules, majuscules et chiffres')
  ],
  handleValidationErrors,
  authController.updateMyPassword
);

module.exports = router;
