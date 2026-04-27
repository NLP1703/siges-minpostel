// models/Reservation.js
const pool = require('../config/db');

class ReservationModel {
  /**
   * Crée une nouvelle réservation
   */
  async creer(reservationData) {
    const {
      utilisateurId,
      salleId,
      date,
      heureDebut,
      heureFin,
      objet,
      nbParticipants
    } = reservationData;

    const query = `
      INSERT INTO reservations 
        (utilisateur_id, salle_id, date, heure_debut, heure_fin, objet, nb_participants, statut)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente')
    `;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [
        utilisateurId,
        salleId,
        date,
        heureDebut,
        heureFin,
        objet,
        nbParticipants
      ]);

      return {
        id: result.insertId,
        utilisateur_id: utilisateurId,
        salle_id: salleId,
        date,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        objet,
        nb_participants: nbParticipants,
        statut: 'en_attente',
        created_at: new Date()
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Récupère une réservation par ID (avec jointures)
   */
  async findById(id) {
    const query = `
      SELECT 
        r.*,
        u.nom as utilisateur_nom,
        u.prenom as utilisateur_prenom,
        u.email as utilisateur_email,
        s.nom as salle_nom,
        s.capacite as salle_capacite
      FROM reservations r
      LEFT JOIN utilisateurs u ON r.utilisateur_id = u.id
      LEFT JOIN salles s ON r.salle_id = s.id
      WHERE r.id = ?
    `;

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, [id]);
      return rows.length ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Récupère les réservations avec filtres et pagination
   */
  async findAll(filters = {}) {
    let query = `
      SELECT 
        r.*,
        u.nom as utilisateur_nom,
        u.prenom as utilisateur_prenom,
        u.email as utilisateur_email,
        s.nom as salle_nom
      FROM reservations r
      LEFT JOIN utilisateurs u ON r.utilisateur_id = u.id
      LEFT JOIN salles s ON r.salle_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.utilisateurId) {
      query += ` AND r.utilisateur_id = ?`;
      params.push(filters.utilisateurId);
    }

    if (filters.salleId) {
      query += ` AND r.salle_id = ?`;
      params.push(filters.salleId);
    }

    if (filters.statut) {
      query += ` AND r.statut = ?`;
      params.push(filters.statut);
    }

    if (filters.date) {
      query += ` AND r.date = ?`;
      params.push(filters.date);
    }

    query += ` ORDER BY r.date DESC, r.heure_debut ASC`;

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, params);

      // Récupérer le total
      let countQuery = `
        SELECT COUNT(*) as total FROM reservations r
        WHERE 1=1
      `;
      const countParams = [];

      if (filters.utilisateurId) {
        countQuery += ` AND r.utilisateur_id = ?`;
        countParams.push(filters.utilisateurId);
      }
      if (filters.salleId) {
        countQuery += ` AND r.salle_id = ?`;
        countParams.push(filters.salleId);
      }
      if (filters.statut) {
        countQuery += ` AND r.statut = ?`;
        countParams.push(filters.statut);
      }
      if (filters.date) {
        countQuery += ` AND r.date = ?`;
        countParams.push(filters.date);
      }

      const [countRows] = await connection.execute(countQuery, countParams);
      const total = countRows[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        data: rows,
        total,
        page,
        limit,
        totalPages
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Met à jour une réservation (champs modifiables)
   */
  async update(id, reservationData) {
    const fields = [];
    const params = [];

    if (reservationData.salle_id !== undefined) {
      fields.push('salle_id = ?');
      params.push(reservationData.salle_id);
    }
    if (reservationData.date !== undefined) {
      fields.push('date = ?');
      params.push(reservationData.date);
    }
    if (reservationData.heure_debut !== undefined) {
      fields.push('heure_debut = ?');
      params.push(reservationData.heure_debut);
    }
    if (reservationData.heure_fin !== undefined) {
      fields.push('heure_fin = ?');
      params.push(reservationData.heure_fin);
    }
    if (reservationData.objet !== undefined) {
      fields.push('objet = ?');
      params.push(reservationData.objet);
    }
    if (reservationData.nb_participants !== undefined) {
      fields.push('nb_participants = ?');
      params.push(reservationData.nb_participants);
    }

    if (fields.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    const query = `
      UPDATE reservations
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `;
    params.push(id);

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, params);
      if (result.affectedRows === 0) return null;
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Change le statut d'une réservation
   */
  async updateStatut(id, nouveauStatut, motifRefus = null) {
    let query = `UPDATE reservations SET statut = ?, updated_at = NOW()`;
    const params = [nouveauStatut];

    if (motifRefus) {
      query += `, motif_refus = ?`;
      params.push(motifRefus);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, params);
      if (result.affectedRows === 0) return null;
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Supprime une réservation
   */
  async delete(id) {
    const query = `DELETE FROM reservations WHERE id = ?`;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = new ReservationModel();
