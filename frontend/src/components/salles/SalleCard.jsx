import React, { useState } from 'react';

export function SalleCard({ salle, selected, onClick }) {
  const [imgError, setImgError] = useState(false);
  
  const equipementLabels = {
    videoprojecteur: 'Video-projecteur',
    'tableau blanc': 'Tableau blanc',
    climatisation: 'Climatisation',
    microphone: 'Microphone',
    visioconference: 'Visioconference'
  };

  // Validation stricte de l'URL de la photo (reject data:image et URLs invalides)
  const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    // Rejeter les URLs data:image (base64 inline)
    if (trimmed.toLowerCase().startsWith('data:')) return false;
    // Vérifier que c'est une URL HTTP/HTTPS valide
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const hasPhoto = isValidUrl(salle.photo_url);
  const showImage = hasPhoto && !imgError;

  return (
    <div
      className={`salle-card ${selected ? 'salle-card-selected' : ''}`}
      onClick={() => onClick(salle)}
    >
      <div className="salle-card-image-wrapper">
        {showImage ? (
          <img 
            src={salle.photo_url} 
            alt={salle.nom} 
            className="salle-card-image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="salle-card-placeholder">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="40" height="40" rx="4" />
              <circle cx="12" cy="12" r="2" />
              <path d="M32 30l-4-4-2 2" />
            </svg>
            <span>{salle.nom}</span>
          </div>
        )}
      </div>
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

