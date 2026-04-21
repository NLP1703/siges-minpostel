// models/Utilisateur.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

class UtilisateurModel {
  /**
   * Crée un nouvel utilisateur
   */
  async creer(utilisateurData) {
    const { nom, prenom, email, motDePasse } = utilisateurData;
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(12);
    const motDePasseHash = await bcrypt.hash(motDePasse, salt);

    const query = `
      INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe)
      VALUES (?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [
        nom,
        prenom,
        email,
        motDePasseHash
      ]);
      
      return {
        id: result.insertId,
        nom,
        prenom,
        email,
        role: 'user',
        actif: true,
        created_at: new Date()
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Récupère un utilisateur par email
   */
  async findByEmail(email) {
    const query = `SELECT * FROM utilisateurs WHERE email = ? AND actif = TRUE LIMIT 1`;
    
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, [email]);
      return rows.length ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Récupère un utilisateur par ID
   */
  async findById(id) {
    const query = `SELECT id, nom, prenom, email, role, actif, created_at, updated_at FROM utilisateurs WHERE id = ?`;
    
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, [id]);
      return rows.length ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Vérifie le mot de passe
   */
  async verifierMotDePasse(motDePasseEntré, motDePasseHash) {
    return await bcrypt.compare(motDePasseEntré, motDePasseHash);
  }

  /**
   * Récupère tous les administrateurs (pour notifications)
   */
  async findAllAdmins() {
    const query = `SELECT id, nom, prenom, email FROM utilisateurs WHERE role = 'admin' AND actif = TRUE`;
    
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Récupère tous les utilisateurs avec filtres et pagination
   */
  async findAll(filters = {}) {
    let query = `
      SELECT id, nom, prenom, email, role, actif, created_at, updated_at
      FROM utilisateurs
      WHERE 1=1
    `;
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.actif !== undefined) {
      query += ' AND actif = ?';
      params.push(filters.actif);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);

      if (filters.page) {
        const offset = (filters.page - 1) * filters.limit;
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Met à jour un utilisateur
   */
  async update(id, updateData) {
    const fields = [];
    const params = [];

    if (updateData.nom !== undefined) {
      fields.push('nom = ?');
      params.push(updateData.nom);
    }
    if (updateData.prenom !== undefined) {
      fields.push('prenom = ?');
      params.push(updateData.prenom);
    }
    if (updateData.email !== undefined) {
      fields.push('email = ?');
      params.push(updateData.email);
    }
    if (updateData.role !== undefined) {
      fields.push('role = ?');
      params.push(updateData.role);
    }
    if (updateData.actif !== undefined) {
      fields.push('actif = ?');
      params.push(updateData.actif);
    }

    if (fields.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    const query = `
      UPDATE utilisateurs
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    params.push(id);

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, params);
      
      if (result.affectedRows === 0) {
        return null;
      }

      // Récupérer l'utilisateur mis à jour
      return await this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Met à jour le mot de passe d'un utilisateur
   */
  async updatePassword(id, hashedPassword) {
    const query = `
      UPDATE utilisateurs
      SET mot_de_passe = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [hashedPassword, id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Supprime un utilisateur
   */
  async delete(id) {
    const query = `DELETE FROM utilisateurs WHERE id = ?`;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = new UtilisateurModel();
