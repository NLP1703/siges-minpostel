import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

export function Header({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-brand">
        {onMenuToggle && (
          <button className="header-menu-btn" onClick={onMenuToggle} aria-label="Menu">
            ☰
          </button>
        )}
        <div className="header-logo">
          <span role="img" aria-label="Cameroun">🇨🇲</span>
        </div>
        <div className="header-text">
          <h1>SIGES-MINPOSTEL</h1>
          <span>Gestion des Salles de Réunion</span>
        </div>
      </div>
      {user && (
        <div className="header-user">
          <span className="header-user-name">{user.prenom} {user.nom}</span>
          <button className="header-logout" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
}

