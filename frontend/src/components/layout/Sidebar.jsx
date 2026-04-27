import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const userLinks = [
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/nouvelle-reservation', label: 'Nouvelle reservation' },
  { to: '/mes-reservations', label: 'Mes reservations' },
  { to: '/mon-profil', label: 'Mon profil' }
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard Admin' },
  { to: '/admin/salles', label: 'Gestion Salles' },
  { to: '/admin/reservations', label: 'Gestion Reservations' },
  { to: '/admin/utilisateurs', label: 'Gestion Utilisateurs' }
];

export function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-text">SIGES</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <span className="sidebar-user-name">{user.prenom} {user.nom}</span>
              <span className="sidebar-user-role">{role === 'admin' ? 'Administrateur' : 'Utilisateur'}</span>
            </div>
          )}
          <button className="sidebar-logout" onClick={handleLogout}>
            Deconnexion
          </button>
        </div>
      </aside>
    </>
  );
}

