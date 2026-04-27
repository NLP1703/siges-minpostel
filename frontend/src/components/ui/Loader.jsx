import React from 'react';
import './Loader.css';

export function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <span className="loader-text">Chargement...</span>
    </div>
  );
}

