// models/Salle.js
const pool = require('../config/db');

class SalleModel {
  /**
   * Crée une nouvelle salle
   */
  async creer(salleData) {
    const { nom, capacite, equipements, photoUrl } = salleData;
    
    const query = `
      INSERT INTO salles (nom, capacite, equipements, photo_url, actif)
      VALUES (?, ?, ?, ?, TRUE)
    `;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [
        nom,
        capacite,
        JSON.stringify(equipements || []),
        photoUrl || null
      ]);

      return {
        id: result.insertId,
        nom,
        capacite,
        equipements: equipements || [],
        photo_url: photoUrl,
        actif: true,
        created_at: new Date()
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Récupère une salle par ID
   */
  async findById(id) {
    const query = `
      SELECT id, nom, capacite, equipements, photo_url, actif, created_at, updated_at
      FROM salles
      WHERE id = ?
    `;

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, [id]);
      if (rows.length) {
        return {
          ...rows[0],
          equipements: JSON.parse(rows[0].equipements || '[]')
        };
      }
      return null;
    } finally {
      connection.release();
    }
  }

  /**
   * Récupère toutes les salles avec filtres optionnels
   */
  async findAll(filters = {}) {
    let query = `
      SELECT id, nom, capacite, equipements, photo_url, actif, created_at, updated_at
      FROM salles
      WHERE 1=1
    `;

    const params = [];

    if (filters.actif !== undefined) {
      query += ` AND actif = ?`;
      params.push(filters.actif);
    }

    if (filters.capaciteMin) {
      query += ` AND capacite >= ?`;
      params.push(filters.capaciteMin);
    }

    query += ` ORDER BY nom ASC`;

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, params);
      return rows.map(row => ({
        ...row,
        equipements: JSON.parse(row.equipements || '[]')
      }));
    } finally {
      connection.release();
    }
  }

  /**
   * Mise à jour d'une salle
   */
  async update(id, updateData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'equipements') {
        fields.push('equipements = ?');
        values.push(JSON.stringify(value));
      } else if (['nom', 'capacite', 'photo_url', 'actif'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE salles SET ${fields.join(', ')} WHERE id = ?`;

    const connection = await pool.getConnection();
    try {
      await connection.execute(query, values);
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Supprime une salle (soft delete)
   */
  async delete(id) {
    const query = `UPDATE salles SET actif = FALSE, updated_at = NOW() WHERE id = ?`;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Vérifie les réservations futures validées pour une salle
   */
  async hasActiveReservations(salleId) {
    const query = `
      SELECT COUNT(*) as count
      FROM reservations
      WHERE salle_id = ?
        AND date >= CURDATE()
        AND statut = 'validee'
    `;

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, [salleId]);
      return rows[0].count > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = new SalleModel();
