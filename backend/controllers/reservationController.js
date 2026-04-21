// controllers/reservationController.js
const ReservationModel = require('../models/Reservation');
const SalleModel = require('../models/Salle');
const UtilisateurModel = require('../models/Utilisateur');
const { ApiError, handleError } = require('../utils/errorHandler');
const creneauService = require('../services/creneauService');
const notificationService = require('../services/notificationService');

exports.getAll = async (req, res) => {
  try {
    const filters = {};

    // Si utilisateur simple, retourner uniquement ses réservations
    if (req.user.role === 'user') {
      filters.utilisateurId = req.user.id;
    }

    // Appliquer les filtres optionnels
    if (req.query.statut) filters.statut = req.query.statut;
    if (req.query.date) filters.date = req.query.date;
    if (req.query.salle_id) filters.salleId = req.query.salle_id;
    if (req.query.page) filters.page = parseInt(req.query.page);
    if (req.query.limit) filters.limit = parseInt(req.query.limit);

    const result = await ReservationModel.findAll(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const { salle_id, date, heure_debut, heure_fin, objet, nb_participants } = req.body;

    // Vérifier que la salle existe
    const salle = await SalleModel.findById(salle_id);
    if (!salle) {
      throw new ApiError('Salle non trouvée', 404);
    }

    // Valider les paramètres
    const validation = creneauService.validerParametresReservation({
      date,
      heureDeb: heure_debut,
      heureFin: heure_fin,
      nbParticipants: nb_participants,
      capaciteSalle: salle.capacite
    });

    if (!validation.valid) {
      throw new ApiError(validation.error, 400);
    }

    // Vérifier la disponibilité
    const disponibilite = await creneauService.verifierDisponibilite(
      salle_id,
      date,
      heure_debut,
      heure_fin
    );

    if (!disponibilite.disponible) {
      res.status(409).json({
        success: false,
        message: disponibilite.conflit.message,
        type: 'CONFLICT',
        conflit: disponibilite.conflit
      });
      return;
    }

    // Créer la réservation
    const reservation = await ReservationModel.creer({
      utilisateurId: req.user.id,
      salleId: salle_id,
      date,
      heureDebut: heure_debut,
      heureFin: heure_fin,
      objet,
      nbParticipants: nb_participants
    });

    // Envoyer notification à l'admin
    const utilisateur = await UtilisateurModel.findById(req.user.id);
    const admins = await UtilisateurModel.findAllAdmins();
    
    for (const admin of admins) {
      await notificationService.notifierNouvelleReservation(admin, reservation, utilisateur, salle);
    }

    res.status(201).json({
      success: true,
      message: 'Réservation créée',
      reservation
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.valider = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await ReservationModel.findById(id);
    if (!reservation) {
      throw new ApiError('Réservation non trouvée', 404);
    }

    if (reservation.statut !== 'en_attente') {
      throw new ApiError('Seules les réservations en attente peuvent être validées', 400);
    }

    // Mettre à jour le statut
    const reservationMaj = await ReservationModel.updateStatut(id, 'validee');

    // Envoyer notification à l'utilisateur
    const utilisateur = await UtilisateurModel.findById(reservation.utilisateur_id);
    const salle = await SalleModel.findById(reservation.salle_id);
    
    await notificationService.notifierValidationReservation(utilisateur, reservationMaj, salle);

    res.json({
      success: true,
      message: 'Réservation validée',
      reservation: reservationMaj
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.refuser = async (req, res) => {
  try {
    const { id } = req.params;
    const { motif_refus } = req.body;

    if (!motif_refus || motif_refus.length < 10) {
      throw new ApiError('Le motif de refus doit contenir au minimum 10 caractères', 400);
    }

    const reservation = await ReservationModel.findById(id);
    if (!reservation) {
      throw new ApiError('Réservation non trouvée', 404);
    }

    if (reservation.statut !== 'en_attente') {
      throw new ApiError('Seules les réservations en attente peuvent être refusées', 400);
    }

    // Mettre à jour le statut
    const reservationMaj = await ReservationModel.updateStatut(id, 'refusee', motif_refus);

    // Envoyer notification à l'utilisateur
    const utilisateur = await UtilisateurModel.findById(reservation.utilisateur_id);
    const salle = await SalleModel.findById(reservation.salle_id);
    
    await notificationService.notifierRefusReservation(utilisateur, reservationMaj, salle, motif_refus);

    res.json({
      success: true,
      message: 'Réservation refusée',
      reservation: reservationMaj
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.supprimer = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await ReservationModel.findById(id);
    if (!reservation) {
      throw new ApiError('Réservation non trouvée', 404);
    }

    // Vérifier propriété (utilisateur ne peut supprimer que ses propres réservations)
    if (req.user.role === 'user' && reservation.utilisateur_id !== req.user.id) {
      throw new ApiError('Accès refusé', 403);
    }

    // Impossible d'annuler une réservation validée
    if (reservation.statut === 'validee') {
      throw new ApiError('Impossible d\'annuler une réservation validée', 403);
    }

    const result = await ReservationModel.delete(id);
    if (!result) {
      throw new ApiError('Réservation non trouvée', 404);
    }

    res.json({
      success: true,
      message: 'Réservation annulée'
    });
  } catch (error) {
    handleError(res, error);
  }
};
