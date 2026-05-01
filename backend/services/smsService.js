// services/smsService.js
/**
 * Service d'envoi de SMS pour Orange et MTN Cameroun
 * Utilise l'API Orange SMS API ou MTN MoMo API
 */

class SmsService {
  constructor() {
    // Configuration pour Orange Cameroun
    this.orangeConfig = {
      url: process.env.ORANGE_SMS_URL || 'https://api.orange.cm/smsm/v1',
      senderName: process.env.ORANGE_SMS_SENDER || 'SIGES-MINPOSTEL',
      clientId: process.env.ORANGE_CLIENT_ID,
      clientSecret: process.env.ORANGE_CLIENT_SECRET
    };

    // Configuration pour MTN Cameroun
    this.mtnConfig = {
      url: process.env.MTN_SMS_URL || 'https://api.mtn.cm/sms/v1',
      senderName: process.env.MTN_SMS_SENDER || 'SIGES-MINPOSTEL',
      subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY,
      targetEnvironment: process.env.MTN_TARGET_ENV || 'sandbox'
    };
  }

  /**
   * Formate un numéro de téléphone camerounais
   * @param {string} phoneNumber - Numéro de téléphone
   * @returns {string} Numéro formaté avec indicateur pays
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;

    // Supprimer tous les espaces et caractères spéciaux
    let cleaned = phoneNumber.replace(/\s/g, '').replace(/[-.]/g, '');

    // Si le numéro commence par 00 ou +, le remplacer par 237
    if (cleaned.startsWith('00')) {
      cleaned = '237' + cleaned.substring(2);
    } else if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    // Si le numéro n'a pas l'indicateur pays, l'ajouter
    if (!cleaned.startsWith('237') && cleaned.length === 9) {
      cleaned = '237' + cleaned;
    }

    return cleaned;
  }

  /**
   * Détecte l'opérateur basé sur le préfixe
   * @param {string} phoneNumber - Numéro de téléphone formaté
   * @returns {string} 'orange' ou 'mtn'
   */
  detectOperator(phoneNumber) {
    if (!phoneNumber) return null;

    const prefix = phoneNumber.substring(3, 5); // Après 237

    // Orange: préfixes 6, 7
    const orangePrefixes = ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79'];
    // MTN: préfixes 5
    const mtnPrefixes = ['50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];

    if (orangePrefixes.includes(prefix)) {
      return 'orange';
    } else if (mtnPrefixes.includes(prefix)) {
      return 'mtn';
    }

    // Par défaut, essayer Orange
    return 'orange';
  }

  /**
   * Envoie un SMS via Orange
   * @param {string} phoneNumber - Numéro du destinataire
   * @param {string} message - Message à envoyer
   */
  async sendOrangeSms(phoneNumber, message) {
    try {
      const response = await fetch(`${this.orangeConfig.url}/textsms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getOrangeToken()}`,
          'X-Sender-Name': this.orangeConfig.senderName
        },
        body: JSON.stringify({
          recipientPhoneNumber: phoneNumber,
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`Orange SMS API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ SMS Orange envoyé à', phoneNumber);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi SMS Orange:', error);
      throw error;
    }
  }

  /**
   * Envoie un SMS via MTN
   * @param {string} phoneNumber - Numéro du destinataire
   * @param {string} message - Message à envoyer
   */
  async sendMtnSms(phoneNumber, message) {
    try {
      const response = await fetch(`${this.mtnConfig.url}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': this.mtnConfig.subscriptionKey,
          'X-Target-Environment': this.mtnConfig.targetEnvironment
        },
        body: JSON.stringify({
          from: this.mtnConfig.senderName,
          to: phoneNumber,
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`MTN SMS API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ SMS MTN envoyé à', phoneNumber);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi SMS MTN:', error);
      throw error;
    }
  }

  /**
   * Obtient un token d'accès Orange
   */
  async getOrangeToken() {
    // Implémenter la logique de récupération du token OAuth
    // Pour l'instant, retourne une chaîne vide - à implémenter avec la configuration réelle
    return process.env.ORANGE_ACCESS_TOKEN || '';
  }

  /**
   * Envoie un SMS en détectant automatiquement l'opérateur
   * @param {string} phoneNumber - Numéro du destinataire
   * @param {string} message - Message à envoyer
   */
  async sendSms(phoneNumber, message) {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    
    if (!formattedNumber) {
      throw new Error('Numéro de téléphone invalide');
    }

    const operator = this.detectOperator(formattedNumber);

    if (operator === 'orange') {
      return this.sendOrangeSms(formattedNumber, message);
    } else {
      return this.sendMtnSms(formattedNumber, message);
    }
  }

  /**
   * Envoie une notification de réservation validée
   * @param {object} utilisateur - Objet utilisateur avec telephone
   * @param {object} reservation - Objet réservation
   * @param {object} salle - Objet salle
   */
  async notifierReservationValidee(utilisateur, reservation, salle) {
    if (!utilisateur.telephone) {
      console.log('ℹ️ Pas de numéro de téléphone pour', utilisateur.email);
      return;
    }

    const message = `SIGES-MINPOSTEL: Votre reservation pour la salle "${salle.nom}" 
le ${reservation.date} de ${reservation.heure_debut} a ${reservation.heure_fin} 
a ete APPROUVEE. Objet: ${reservation.objet}`;

    try {
      await this.sendSms(utilisateur.telephone, message);
      console.log('✅ Notification SMS de validation envoyée à', utilisateur.telephone);
    } catch (error) {
      console.error('❌ Échec notification SMS:', error);
      // Ne pas lever l'erreur - le SMS est secondaire
    }
  }

  /**
   * Envoie une notification de réservation rejetée
   * @param {object} utilisateur - Objet utilisateur avec telephone
   * @param {object} reservation - Objet réservation
   * @param {object} salle - Objet salle
   * @param {string} motif - Motif du rejet
   */
  async notifierReservationRejetee(utilisateur, reservation, salle, motif) {
    if (!utilisateur.telephone) {
      console.log('ℹ️ Pas de numéro de téléphone pour', utilisateur.email);
      return;
    }

    const message = `SIGES-MINPOSTEL: Votre reservation pour la salle "${salle.nom}" 
le ${reservation.date} a ete REJETEE. Motif: ${motif}`;

    try {
      await this.sendSms(utilisateur.telephone, message);
      console.log('✅ Notification SMS de rejet envoyée à', utilisateur.telephone);
    } catch (error) {
      console.error('❌ Échec notification SMS:', error);
    }
  }
}

module.exports = new SmsService();