// server.js
require('dotenv').config();
const app = require('./app');
const notificationService = require('./services/notificationService');

const PORT = process.env.PORT || 5000;

// Test notification service configuration
notificationService.testConnection().then(isValid => {
  if (isValid) {
    console.log('✅ Service de notifications configuré');
  } else {
    console.warn('⚠️  Service de notifications non opérationnel - vérifiez .env');
  }
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Serveur SIGES-MINPOSTEL démarré sur le port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📚 Documentation API:`);
  console.log(`   POST   /api/auth/register        - Créer un compte`);
  console.log(`   POST   /api/auth/login            - Se connecter`);
  console.log(`   GET    /api/auth/me               - Profil utilisateur`);
  console.log(`   GET    /api/salles                - Lister les salles`);
  console.log(`   GET    /api/salles/:id            - Détail d'une salle`);
  console.log(`   GET    /api/salles/:id/disponibilites - Créneaux disponibles`);
  console.log(`   POST   /api/salles                - Créer une salle (admin)`);
  console.log(`   PUT    /api/salles/:id            - Modifier une salle (admin)`);
  console.log(`   DELETE /api/salles/:id            - Supprimer une salle (admin)`);
  console.log(`   GET    /api/reservations          - Lister réservations`);
  console.log(`   POST   /api/reservations          - Créer une réservation`);
  console.log(`   PUT    /api/reservations/:id/valider  - Valider (admin)`);
  console.log(`   PUT    /api/reservations/:id/refuser  - Refuser (admin)`);
  console.log(`   DELETE /api/reservations/:id      - Annuler réservation`);
  console.log(`   GET    /api/dashboard/stats       - Stats (admin)\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏹️  Signal SIGTERM reçu, arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⏹️  Signal SIGINT reçu, arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});
