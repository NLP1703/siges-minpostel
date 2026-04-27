import React from 'react';

export function SalleCard({ salle, selected, onClick }) {
  const equipementLabels = {
    videoprojecteur: 'Video-projecteur',
    'tableau blanc': 'Tableau blanc',
    climatisation: 'Climatisation',
    microphone: 'Microphone',
    visioconference: 'Visioconference'
  };

  return (
    <div
      className={`salle-card ${selected ? 'salle-card-selected' : ''}`}
      onClick={() => onClick(salle)}
    >
      {salle.photo_url && (
        <img src={salle.photo_url} alt={salle.nom} className="salle-card-image" />
      )}
      <div className="salle-card-content">
        <h3 className="salle-card-title">{salle.nom}</h3>
        <p className="salle-card-capacite">
          <span role="img" aria-label="capacite">👥</span> {salle.capacite} personnes
        </p>
        {salle.equipements && salle.equipements.length > 0 && (
          <div className="salle-card-equipements">
            {salle.equipements.map(eq => (
              <span key={eq} className="salle-equipement-tag">
                {equipementLabels[eq] || eq}
              </span>
            ))}
          </div>
        )}
      </div>
      {selected && <div className="salle-card-check">✓</div>}
    </div>
  );
}

