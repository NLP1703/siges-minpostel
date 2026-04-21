// controllers/salleController.js
const SalleModel = require('../models/Salle');
const { ApiError, handleError } = require('../utils/errorHandler');
const creneauService = require('../services/creneauService');

exports.getAll = async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.actif !== undefined) {
      filters.actif = req.query.actif === 'true';
    }
    
    if (req.query.capacite_min) {
      filters.capaciteMin = parseInt(req.query.capacite_min);
    }

    const salles = await SalleModel.findAll(filters);

    res.json({
      success: true,
      data: salles
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getById = async (req, res) => {
  try {
    const salle = await SalleModel.findById(req.params.id);
    
    if (!salle) {
      throw new ApiError('Salle non trouvée', 404);
    }

    res.json({
      success: true,
      data: salle
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const { nom, capacite, equipements, photo_url } = req.body;

    const salle = await SalleModel.creer({
      nom,
      capacite,
      equipements,
      photoUrl: photo_url
    });

    res.status(201).json({
      success: true,
      message: 'Salle créée',
      salle
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const salle = await SalleModel.update(req.params.id, req.body);
    
    if (!salle) {
      throw new ApiError('Salle non trouvée', 404);
    }

    res.json({
      success: true,
      message: 'Salle mise à jour',
      salle
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.delete = async (req, res) => {
  try {
    // Vérifier qu'il n'y a pas de réservations futures validées
    const hasActiveReservations = await SalleModel.hasActiveReservations(req.params.id);
    
    if (hasActiveReservations) {
      throw new ApiError(
        'Impossible de supprimer une salle avec des réservations futures validées',
        409
      );
    }

    const result = await SalleModel.delete(req.params.id);
    
    if (!result) {
      throw new ApiError('Salle non trouvée', 404);
    }

    res.json({
      success: true,
      message: 'Salle supprimée'
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getDisponibilites = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      throw new ApiError('Le paramètre "date" est obligatoire', 400);
    }

    // Valider le format de la date
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
      throw new ApiError('Format de date invalide (attendu: YYYY-MM-DD)', 400);
    }

    // Vérifier que la salle existe
    const salle = await SalleModel.findById(id);
    if (!salle) {
      throw new ApiError('Salle non trouvée', 404);
    }

    // Récupérer les créneaux disponibles
    const creneaux = await creneauService.getCreneauxDisponibles(id, date);

    res.json({
      success: true,
      data: creneaux
    });
  } catch (error) {
    handleError(res, error);
  }
};
