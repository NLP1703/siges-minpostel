/**
 * Formatte une date en YYYY-MM-DD
 */
export function toISODate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatte une date pour affichage local (DD/MM/YYYY)
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  
  // Si c'est déjà au format DD/MM/YYYY, le retourner tel quel
  if (dateStr.includes('/')) return dateStr;
  
  // Si c'est un objet Date ou une date avec temps
  let datePart = dateStr;
  if (dateStr.includes('T')) {
    // Format ISO: 2024-01-15T00:00:00.000Z
    datePart = dateStr.split('T')[0];
  } else if (dateStr.includes(' ')) {
    // Format avec espace: 2024-01-15 00:00:00
    datePart = dateStr.split(' ')[0];
  }
  
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    // Vérifier que c'est des nombres valides
    if (!isNaN(parseInt(year)) && !isNaN(parseInt(month)) && !isNaN(parseInt(day))) {
      return `${day}/${month}/${year}`;
    }
  }
  
  // Fallback: retourner la chaîne originale
  return dateStr;
}

/**
 * Retourne aujourd'hui au format YYYY-MM-DD
 */
export function getTodayISO() {
  return toISODate(new Date());
}

/**
 * Formate une heure HH:MM
 */
export function formatHeure(heure) {
  return heure || '';
}

/**
 * Compare deux dates au format YYYY-MM-DD
 */
export function compareDates(a, b) {
  return new Date(a) - new Date(b);
}
