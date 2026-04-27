import React from 'react';

export function CreneauCell({ heure, statut, selected, onClick }) {
  const statutClasses = {
    libre: 'creneau-libre',
    occupe: 'creneau-occupe',
    tampon: 'creneau-tampon'
  };

  const statutTooltips = {
    libre: 'Creaneau disponible',
    occupe: 'Salle occupee',
    tampon: 'Marge de 30 min requise'
  };

  const isClickable = statut === 'libre';

  return (
    <div
      className={`creneau-cell ${statutClasses[statut] || ''} ${selected ? 'creneau-selected' : ''}`}
      onClick={() => isClickable && onClick(heure)}
      title={statutTooltips[statut] || ''}
    >
      <span className="creneau-heure">{heure}</span>
    </div>
  );
}

