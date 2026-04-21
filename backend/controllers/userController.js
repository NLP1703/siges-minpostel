// controllers/userController.js
const UtilisateurModel = require('../models/Utilisateur');
const { ApiError, handleError } = require('../utils/errorHandler');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const filters = {};

    // Appliquer les filtres optionnels
    if (req.query.role) filters.role = req.query.role;
    if (req.query.actif !== undefined) filters.actif = req.query.actif === 'true';
    if (req.query.page) filters.page = parseInt(req.query.page);
    if (req.query.limit) filters.limit = parseInt(req.query.limit);

    const result = await UtilisateurModel.findAll(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await UtilisateurModel.findById(id);
    if (!utilisateur) {
      throw new ApiError('Utilisateur non trouvé', 404);
    }

    res.json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, actif } = req.body;

    // Vérifier que l'utilisateur existe
    const utilisateur = await UtilisateurModel.findById(id);
    if (!utilisateur) {
      throw new ApiError('Utilisateur non trouvé', 404);
    }

    // Empêcher un utilisateur de se retirer ses propres droits admin
    if (req.user.id === parseInt(id) && role === 'user' && req.user.role === 'admin') {
      throw new ApiError('Vous ne pouvez pas vous retirer vos propres droits administrateur', 400);
    }

    // Préparer les données de mise à jour
    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (actif !== undefined) updateData.actif = actif;

    const utilisateurMaj = await UtilisateurModel.update(id, updateData);

    res.json({
      success: true,
      message: 'Utilisateur mis à jour',
      data: utilisateurMaj
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      throw new ApiError('Le nouveau mot de passe doit contenir au minimum 8 caractères', 400);
    }

    // Vérifier que l'utilisateur existe
    const utilisateur = await UtilisateurModel.findById(id);
    if (!utilisateur) {
      throw new ApiError('Utilisateur non trouvé', 404);
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await UtilisateurModel.updatePassword(id, hashedPassword);

    res.json({
      success: true,
      message: 'Mot de passe mis à jour'
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const utilisateur = await UtilisateurModel.findById(id);
    if (!utilisateur) {
      throw new ApiError('Utilisateur non trouvé', 404);
    }

    // Empêcher la suppression de son propre compte
    if (req.user.id === parseInt(id)) {
      throw new ApiError('Vous ne pouvez pas supprimer votre propre compte', 400);
    }

    const result = await UtilisateurModel.delete(id);
    if (!result) {
      throw new ApiError('Utilisateur non trouvé', 404);
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé'
    });
  } catch (error) {
    handleError(res, error);
  }
};