/**
 * Utilitaires pour le calcul et la manipulation des creaneaux horaires
 */

const HEURE_DEBUT = 8;
const HEURE_FIN = 17;
const MARGE_TAMPON = 30; // minutes

/**
 * Genere les creaneaux de base (08:00 a 17:00)
 * @returns {string[]} Tableau d'heures au format HH:MM
 */
export function getHeuresBase() {
  const creneaux = [];
  for (let h = HEURE_DEBUT; h <= HEURE_FIN; h++) {
    creneaux.push(`${String(h).padStart(2, '0')}:00`);
  }
  return creneaux;
}

/**
 * Convertit une heure HH:MM en minutes depuis minuit
 */
export function heureToMinutes(heure) {
  const [h, m] = heure.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convertit des minutes en heure HH:MM
 */
export function minutesToHeure(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Verifie si un creaneau est dans la marge tampon d'une reservation existante
 * @param {string} heure - Heure a verifier (HH:MM)
 * @param {Array} reservations - Reservations existantes [{heure_debut, heure_fin}]
 */
export function estDansTampon(heure, reservations) {
  const heureMin = heureToMinutes(heure);

  for (const res of reservations) {
    const debut = heureToMinutes(res.heure_debut);
    const fin = heureToMinutes(res.heure_fin);

    // Zone tampon avant
    if (heureMin >= debut - MARGE_TAMPON && heureMin < debut) {
      return true;
    }
    // Zone tampon apres
    if (heureMin >= fin && heureMin < fin + MARGE_TAMPON) {
      return true;
    }
  }
  return false;
}

/**
 * Determine le statut d'un creaneau par rapport aux reservations existantes
 * @param {string} heure - Heure du creaneau (HH:MM)
 * @param {Array} reservations - Reservations existantes
 * @returns {'libre'|'occupe'|'tampon'}
 */
export function getStatutCreneau(heure, reservations) {
  const heureMin = heureToMinutes(heure);

  for (const res of reservations) {
    const debut = heureToMinutes(res.heure_debut);
    const fin = heureToMinutes(res.heure_fin);

    // Occupe pendant la reservation
    if (heureMin >= debut && heureMin < fin) {
      return 'occupe';
    }
  }

  // Verifier les tampons
  if (estDansTampon(heure, reservations)) {
    return 'tampon';
  }

  return 'libre';
}

/**
 * Genere une grille complete de creaneaux avec statuts
 * @param {Array} reservations - Reservations du jour
 * @returns {Array<{heure:string, statut:string}>}
 */
export function genererGrilleCreneaux(reservations = []) {
  const heures = getHeuresBase();
  return heures.map(heure => ({
    heure,
    statut: getStatutCreneau(heure, reservations)
  }));
}

