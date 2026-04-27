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
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
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
