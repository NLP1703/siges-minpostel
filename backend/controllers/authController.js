// controllers/authController.js
const jwt = require('jsonwebtoken');
const UtilisateurModel = require('../models/Utilisateur');
const { ApiError, handleError } = require('../utils/errorHandler');
const jwtConfig = require('../config/jwt');

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, motDePasse } = req.body;

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
      telephone,
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
        telephone: utilisateur.telephone,
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

exports.updateMe = async (req, res) => {
  try {
    const { nom, prenom, telephone } = req.body;
    const userId = req.user.id;

    // Vérifier que l'utilisateur existe
    const utilisateur = await UtilisateurModel.findById(userId);
    if (!utilisateur) {
      throw new ApiError('Utilisateur non trouvé', 404);
    }

    // Mettre à jour uniquement les champs fournis
    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (telephone !== undefined) updateData.telephone = telephone;

    const utilisateurMisAJour = await UtilisateurModel.update(userId, updateData);

    res.json({
      success: true,
      message: 'Profil mis à jour',
      user: utilisateurMisAJour
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateMyPassword = async (req, res) => {
  try {
    const { motDePasseActuel, nouveauMotDePasse } = req.body;
    const userId = req.user.id;

    // Récupérer l'utilisateur actuel
    const utilisateur = await UtilisateurModel.findById(userId);
    if (!utilisateur) {
      throw new ApiError('Utilisateur non trouvé', 404);
    }

    // Vérifier le mot de passe actuel
    const motDePasseValide = await UtilisateurModel.verifierMotDePasse(
      motDePasseActuel,
      utilisateur.mot_de_passe
    );
    if (!motDePasseValide) {
      throw new ApiError('Mot de passe actuel incorrect', 401);
    }

    // Mettre à jour le mot de passe
    await UtilisateurModel.updatePassword(userId, nouveauMotDePasse);

    res.json({
      success: true,
      message: 'Mot de passe mis à jour'
    });
  } catch (error) {
    handleError(res, error);
  }
};
