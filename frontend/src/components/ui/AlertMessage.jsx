import React from 'react';
import './AlertMessage.css';

export function AlertMessage({ type = 'info', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert-message alert-${type}`}>
      <span className="alert-text">{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>×</button>
      )}
    </div>
  );
}

