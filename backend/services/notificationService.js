// services/notificationService.js
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      logger: true,
      debug: true
    });
  }

  /**
   * HTML Template pour les emails
   */
  getHtmlTemplate(contenu, titre) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #2a5298; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .info-box { background: #e8f4f8; padding: 15px; border-left: 4px solid #2a5298; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏛️ SIGES-MINPOSTEL</h1>
            <p>Gestion des Salles de Réunion</p>
          </div>
          <div class="content">
            <h2>${titre}</h2>
            ${contenu}
          </div>
          <div class="footer">
            <p>© 2024 SIGES-MINPOSTEL - Gestion des Réservations de Salles</p>
            <p>Cette notification a été générée automatiquement. Merci de ne pas répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envoie une notification de nouvelle réservation à l'admin
   */
  async notifierNouvelleReservation(admin, reservation, utilisateur, salle) {
    try {
      const contenu = `
        <p>Une nouvelle demande de réservation a été soumise :</p>
        <div class="info-box">
          <strong>De :</strong> ${utilisateur.prenom} ${utilisateur.nom} (${utilisateur.email})<br/>
          <strong>Salle :</strong> ${salle.nom}<br/>
          <strong>Date :</strong> ${reservation.date}<br/>
          <strong>Horaires :</strong> ${reservation.heure_debut} - ${reservation.heure_fin}<br/>
          <strong>Objet :</strong> ${reservation.objet}<br/>
          <strong>Participants :</strong> ${reservation.nb_participants}
        </div>
        <p>Veuillez examiner cette demande dans votre tableau de bord d'administration.</p>
      `;

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: admin.email,
        subject: `[SIGES] Nouvelle réservation : ${salle.nom} - ${reservation.date}`,
        html: this.getHtmlTemplate(contenu, '📋 Nouvelle Demande de Réservation')
      });

      console.log('✅ Email de nouvelle réservation envoyé à', admin.email);
    } catch (error) {
      console.error('❌ Erreur envoi email nouvelle réservation:', error);
      // Ne pas lever l'erreur - l'email est accessoire
    }
  }

  /**
   * Envoie une notification de validation de réservation à l'utilisateur
   */
  async notifierValidationReservation(utilisateur, reservation, salle) {
    try {
      const contenu = `
        <p>Félicitations ! Votre réservation a été approuvée.</p>
        <div class="info-box">
          <strong>Salle :</strong> ${salle.nom}<br/>
          <strong>Date :</strong> ${reservation.date}<br/>
          <strong>Horaires :</strong> ${reservation.heure_debut} - ${reservation.heure_fin}<br/>
          <strong>Objet :</strong> ${reservation.objet}<br/>
          <strong>Participants :</strong> ${reservation.nb_participants}
        </div>
        <p><strong>Statut :</strong> ✅ VALIDÉE</p>
        <p>Présentez-vous 10 minutes avant l'horaire prévu.</p>
      `;

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: utilisateur.email,
        subject: `[SIGES] Réservation validée : ${salle.nom} - ${reservation.date}`,
        html: this.getHtmlTemplate(contenu, '✅ Réservation Approuvée')
      });

      console.log('✅ Email de validation envoyé à', utilisateur.email);
    } catch (error) {
      console.error('❌ Erreur envoi email validation:', error);
    }
  }

  /**
   * Envoie une notification de refus de réservation à l'utilisateur
   */
  async notifierRefusReservation(utilisateur, reservation, salle, motifRefus) {
    try {
      const contenu = `
        <p>Nous regrettons de vous informer que votre réservation a été refusée.</p>
        <div class="info-box">
          <strong>Salle :</strong> ${salle.nom}<br/>
          <strong>Date :</strong> ${reservation.date}<br/>
          <strong>Horaires :</strong> ${reservation.heure_debut} - ${reservation.heure_fin}
        </div>
        <p><strong>Motif du refus :</strong></p>
        <div class="info-box" style="border-left-color: #e74c3c;">
          ${motifRefus}
        </div>
        <p>Pour toute question, veuillez contacter l'équipe d'administration.</p>
      `;

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: utilisateur.email,
        subject: `[SIGES] Réservation refusée : ${salle.nom} - ${reservation.date}`,
        html: this.getHtmlTemplate(contenu, '❌ Réservation Refusée')
      });

      console.log('✅ Email de refus envoyé à', utilisateur.email);
    } catch (error) {
      console.error('❌ Erreur envoi email refus:', error);
    }
  }

  /**
   * Test de connexion SMTP
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Configuration SMTP valide');
      return true;
    } catch (error) {
      console.error('❌ Erreur configuration SMTP:', error);
      return false;
    }
  }
}

module.exports = new NotificationService();
