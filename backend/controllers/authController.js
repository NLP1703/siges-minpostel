// controllers/authController.js
const jwt = require('jsonwebtoken');
const UtilisateurModel = require('../models/Utilisateur');
const { ApiError, handleError } = require('../utils/errorHandler');
const jwtConfig = require('../config/jwt');

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse } = req.body;

    // Vérifier si l'email existe déjà
    const utilisateurExistant = await UtilisateurModel.findByEmail(email);
    if (utilisateurExistant) {
      throw new ApiError('Email déjà utilisé', 409);
    }

    // Créer l'utilisateur
    const utilisateur = await UtilisateurModel.creer({
      nom,
      prenom,
      email,
      motDePasse
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      userId: utilisateur.id
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Trouver l'utilisateur
    const utilisateur = await UtilisateurModel.findByEmail(email);
    if (!utilisateur) {
      throw new ApiError('Email ou mot de passe incorrect', 401);
    }

    // Vérifier le mot de passe
    const motDePasseValide = await UtilisateurModel.verifierMotDePasse(
      motDePasse,
      utilisateur.mot_de_passe
    );
    if (!motDePasseValide) {
      throw new ApiError('Email ou mot de passe incorrect', 401);
    }

    // Vérifier que le compte est actif
    if (!utilisateur.actif) {
      throw new ApiError('Compte suspendu', 403);
    }

    // Générer le JWT
    const token = jwt.sign(
      {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role
      },
      jwtConfig.SECRET,
      {
        algorithm: jwtConfig.ALGORITHM,
        expiresIn: jwtConfig.EXPIRY
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.me = async (req, res) => {
  try {
    const utilisateur = await UtilisateurModel.findById(req.user.id);
    
    if (!utilisateur) {
      throw new ApiError('Utilisateur non trouvé', 404);
    }

    res.json({
      success: true,
      user: utilisateur
    });
  } catch (error) {
    handleError(res, error);
  }
};
