// controllers/dashboardController.js
const pool = require('../config/db');
const { ApiError, handleError } = require('../utils/errorHandler');

exports.getStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Réservations d'aujourd'hui
    const [statsAujourd] = await connection.execute(`
      SELECT COUNT(*) as count FROM reservations 
      WHERE date = CURDATE()
    `);

    // En attente
    const [statsEnAttente] = await connection.execute(`
      SELECT COUNT(*) as count FROM reservations 
      WHERE statut = 'en_attente'
    `);

    // Validées ce mois-ci
    const [statsValidees] = await connection.execute(`
      SELECT COUNT(*) as count FROM reservations 
      WHERE statut = 'validee' AND MONTH(date) = MONTH(NOW()) AND YEAR(date) = YEAR(NOW())
    `);

    // Refusées ce mois-ci
    const [statsRefusees] = await connection.execute(`
      SELECT COUNT(*) as count FROM reservations 
      WHERE statut = 'refusee' AND MONTH(date) = MONTH(NOW()) AND YEAR(date) = YEAR(NOW())
    `);

    // Taux d'occupation par salle
    const [occupationParSalle] = await connection.execute(`
      SELECT 
        s.id,
        s.nom,
        COUNT(r.id) as reservations_validees,
        ROUND((COUNT(r.id) :: FLOAT / (SELECT COUNT(*) FROM reservations WHERE statut = 'validee')) * 100, 2) as taux
      FROM salles s
      LEFT JOIN reservations r ON s.id = r.salle_id AND r.statut = 'validee'
      GROUP BY s.id, s.nom
      ORDER BY taux DESC
    `);

    // Réservations par jour (7 derniers jours)
    const [reservationsParJour] = await connection.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        COUNT(*) as count
      FROM reservations
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(date, '%Y-%m-%d')
      ORDER BY date ASC
    `);

    // Répartition des statuts
    const [repartitionStatuts] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as en_attente,
        COUNT(CASE WHEN statut = 'validee' THEN 1 END) as validee,
        COUNT(CASE WHEN statut = 'refusee' THEN 1 END) as refusee
      FROM reservations
    `);

    connection.release();

    res.json({
      success: true,
      data: {
        reservations_aujourd_hui: statsAujourd[0].count,
        en_attente: statsEnAttente[0].count,
        validees_ce_mois: statsValidees[0].count,
        refusees_ce_mois: statsRefusees[0].count,
        taux_occupation_par_salle: occupationParSalle,
        reservations_par_jour_7j: reservationsParJour,
        repartition_statuts: repartitionStatuts[0]
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};
