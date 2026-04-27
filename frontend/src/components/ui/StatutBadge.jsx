import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import './StatutBadge.css';

export function StatutBadge({ statut }) {
  const label = STATUS_LABELS[statut] || statut;
  const color = STATUS_COLORS[statut] || '#6b7280';

  return (
    <span 
      className={`statut-badge statut-${statut}`}
      style={{ 
        backgroundColor: `${color}20`,
        color: color,
        borderColor: color
      }}
    >
      {statut === 'validee' && <span className="statut-icon">✓</span>}
      {statut === 'refusee' && <span className="statut-icon">✕</span>}
      {label}
    </span>
  );
}
