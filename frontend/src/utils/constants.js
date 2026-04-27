export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const STATUS_COLORS = {
  libre: '#28A745',
  occupe: '#DC3545',
  tampon: '#FFA500',
  en_attente: '#FFC107',
  validee: '#28A745',
  refusee: '#DC3545'
};

export const STATUS_LABELS = {
  en_attente: 'En attente',
  validee: 'Validée',
  refusee: 'Refusée',
  libre: 'Libre',
  occupe: 'Occupé',
  tampon: 'Tampon'
};

export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1440
};
