// services/creneauService.js
/**
 * Service de gestion des créneaux horaires et disponibilités
 * Logique métier CRITIQUE pour la réservation de salles
 */

const pool = require('../config/db');

class CreneauService {
  /**
   * Génère tous les créneaux disponibles pour une journée
   * Créneaux : 08:00 à 17:00 (tranches de 1 heure)
   * @returns {string[]} Array de créneaux au format "HH:MM"
   */
  getHeuresBase() {
    const creneaux = [];
    for (let hour = 8; hour <= 17; hour++) {
      creneaux.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return creneaux;
  }

  /**
   * Convertit une heure "HH:MM" en minutes depuis minuit
   * @param {string} heure Format "HH:MM"
   * @returns {number} Minutes depuis minuit
   */
  heureToMinutes(heure) {
    const [h, m] = heure.split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Convertit des minutes depuis minuit en "HH:MM"
   * @param {number} minutes Minutes depuis minuit
   * @returns {string} Format "HH:MM"
   */
  minutesToHeure(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Vérifie la disponibilité d'un créneau
   * Règles :
   * - Pas de chevauchement direct
   * - Marge tampon de 30 min obligatoire avant/après chaque réservation
   * @param {number} salleId ID de la salle
   * @param {string} date Date au format "YYYY-MM-DD"
   * @param {string} heureDebut Format "HH:MM"
   * @param {string} heureFin Format "HH:MM"
   * @param {number|null} excludeReservationId ID de réservation à exclure
   * @returns {Promise<{disponible: boolean, conflit?: object}>}
   */
  async verifierDisponibilite(salleId, date, heureDebut, heureFin, excludeReservationId = null) {
    try {
      // CORRECTION BUG : Ne bloquer que les réservations VALIDÉES
      // 'en_attente' ne bloque pas les créneaux
      const query = `
        SELECT id, heure_debut, heure_fin, objet, utilisateur_id
        FROM reservations
        WHERE salle_id = ?
          AND date = ?
          AND statut = 'validee'
        ORDER BY heure_debut ASC
      `;

      const connection = await pool.getConnection();
      const [existingReservations] = await connection.execute(query, [salleId, date]);
      connection.release();

      // Convertir les heures en minutes pour faciliter les comparaisons
      const debutMin = this.heureToMinutes(heureDebut);
      const finMin = this.heureToMinutes(heureFin);
      const marge = 30; // 30 minutes de tampon

      // Vérifier chaque réservation existante
      for (const reservation of existingReservations) {
        // Ignorer la réservation en cours de modification
        if (excludeReservationId && reservation.id === excludeReservationId) continue;

        const existDebutMin = this.heureToMinutes(reservation.heure_debut);
        const existFinMin = this.heureToMinutes(reservation.heure_fin);

        // Plage bloquée : [debut - 30min, fin + 30min]
        const plageBloqueeDebut = existDebutMin - marge;
        const plageBloqueeFin = existFinMin + marge;

        // Chevauchement si : debut_new < fin_bloquee ET fin_new > debut_bloquee
        const chevauchement = debutMin < plageBloqueeFin && finMin > plageBloqueeDebut;

        if (chevauchement) {
          return {
            disponible: false,
            conflit: {
              reservation_id: reservation.id,
              heure_debut: reservation.heure_debut,
              heure_fin: reservation.heure_fin,
              objet: reservation.objet,
              message: `Créneau indisponible. Réservation existante de ${reservation.heure_debut} à ${reservation.heure_fin}`
            }
          };
        }
      }

      return { disponible: true };
    } catch (error) {
      console.error('❌ Erreur verifierDisponibilite:', error);
      throw error;
    }
  }

  /**
   * Retourne les créneaux disponibles pour une salle à une date donnée
   * Statuts possibles : "libre", "occupe", "tampon"
   * @param {number} salleId ID de la salle
   * @param {string} date Format "YYYY-MM-DD"
   * @returns {Promise<{date: string, salle_id: number, creneaux: Array}>}
   */
  async getCreneauxDisponibles(salleId, date) {
    try {
      // CORRECTION BUG : Ne bloquer que les réservations VALIDÉES
      // 'en_attente' et 'refusee' ne bloquent pas les créneaux
      const query = `
        SELECT heure_debut, heure_fin
        FROM reservations
        WHERE salle_id = ?
          AND date = ?
          AND statut = 'validee'
        ORDER BY heure_debut ASC
      `;

      const connection = await pool.getConnection();
      const [reservations] = await connection.execute(query, [salleId, date]);
      connection.release();

      const heuresBase = this.getHeuresBase();
      const marge = 30; // minutes tampon
      const creneaux = [];

      for (const heure of heuresBase) {
        const heureMinutes = this.heureToMinutes(heure);
        let statut = 'libre';

        // Vérifier contre chaque réservation existante
        for (const res of reservations) {
          const existDebutMin = this.heureToMinutes(res.heure_debut);
          const existFinMin = this.heureToMinutes(res.heure_fin);

          // Créneau occupé si heure est dans la plage de réservation
          if (heureMinutes >= existDebutMin && heureMinutes < existFinMin) {
            statut = 'occupe';
            break;
          }

          // Zone tampon après la réservation
          if (heureMinutes >= existFinMin && heureMinutes < existFinMin + marge) {
            statut = 'tampon';
            // continue pour vérifier si c'est occupé par une autre résa
          }

          // Zone tampon avant la réservation
          if (heureMinutes >= existDebutMin - marge && heureMinutes < existDebutMin) {
            if (statut !== 'occupe') {
              statut = 'tampon';
            }
          }
        }

        creneaux.push({
          heure,
          statut,
          disponible: statut === 'libre'
        });
      }

      return {
        date,
        salle_id: salleId,
        creneaux,
        resume: {
          total: creneaux.length,
          libres: creneaux.filter(c => c.statut === 'libre').length,
          occupes: creneaux.filter(c => c.statut === 'occupe').length,
          tampons: creneaux.filter(c => c.statut === 'tampon').length
        }
      };
    } catch (error) {
      console.error('❌ Erreur getCreneauxDisponibles:', error);
      throw error;
    }
  }

  /**
   * Valide les paramètres de réservation (heures, dates, etc.)
   * @param {Object} params Paramètres de réservation
   * @returns {Object} {valid: boolean, error?: string}
   */
  validerParametresReservation(params) {
    const { date, heureDeb, heureFin, nbParticipants, capaciteSalle } = params;

    // Vérifier la date
    const dateReservation = new Date(date);
    const dateAujourd = new Date();
    dateAujourd.setHours(0, 0, 0, 0);

    if (dateReservation < dateAujourd) {
      return { valid: false, error: 'La date doit être à partir d\'aujourd\'hui' };
    }

    // Vérifier les heures
    if (heureDeb >= heureFin) {
      return { valid: false, error: 'L\'heure de début doit être avant l\'heure de fin' };
    }

    // Vérifier que heure_debut est dans les créneaux de base
    if (!this.getHeuresBase().includes(heureDeb)) {
      return { valid: false, error: `L'heure de début doit être parmi : ${this.getHeuresBase().join(', ')}` };
    }

    // Vérifier que heure_fin ne dépasse pas 18:00
    const heureFinMin = this.heureToMinutes(heureFin);
    if (heureFinMin > this.heureToMinutes('18:00')) {
      return { valid: false, error: 'L\'heure de fin ne peut pas dépasser 18:00' };
    }

    // Vérifier le nombre de participants
    if (nbParticipants > capaciteSalle) {
      return {
        valid: false,
        error: `Nombre de participants (${nbParticipants}) dépasse la capacité de la salle (${capaciteSalle})`
      };
    }

    return { valid: true };
  }
}

module.exports = new CreneauService();
