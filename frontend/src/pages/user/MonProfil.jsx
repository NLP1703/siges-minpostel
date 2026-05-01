import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Loader } from '../../components/ui/Loader';
import './MonProfil.css';

export function MonProfil() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || ''
  });

  const [passwords, setPasswords] = useState({
    actuel: '',
    nouveau: '',
    confirmation: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authApi.updateMe(form);
      setSuccess('Profil mis à jour avec succès');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwords.nouveau !== passwords.confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwords.nouveau.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authApi.updatePassword({
        motDePasseActuel: passwords.actuel,
        nouveauMotDePasse: passwords.nouveau
      });
      setSuccess('Mot de passe mis à jour avec succès');
      setPasswords({ actuel: '', nouveau: '', confirmation: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loader />;

  return (
    <div className="mon-profil-page page-fade-in">
      <h1 className="page-title">Mon Profil</h1>

      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      <div className="profil-sections">
        <section className="profil-section">
          <h2>Informations personnelles</h2>
          <form onSubmit={handleUpdateProfile} className="profil-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom">Nom</label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  value={form.nom}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="prenom">Prénom</label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  value={form.prenom}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                value={form.telephone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </section>

        <section className="profil-section">
          <h2>Changer le mot de passe</h2>
          <form onSubmit={handleUpdatePassword} className="profil-form">
            <div className="form-group">
              <label htmlFor="actuel">Mot de passe actuel</label>
              <input
                id="actuel"
                name="actuel"
                type="password"
                value={passwords.actuel}
                onChange={handlePasswordChange}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nouveau">Nouveau mot de passe</label>
                <input
                  id="nouveau"
                  name="nouveau"
                  type="password"
                  value={passwords.nouveau}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Min. 8 caractères"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmation">Confirmer</label>
                <input
                  id="confirmation"
                  name="confirmation"
                  type="password"
                  value={passwords.confirmation}
                  onChange={handlePasswordChange}
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" className="btn-secondary" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
            </button>
          </form>
        </section>

        <section className="profil-section profil-info">
          <h2>Détails du compte</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Rôle</span>
              <span className="info-value">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Statut</span>
              <span className="info-value statut-actif">Actif</span>
            </div>
            <div className="info-item">
              <span className="info-label">Membre depuis</span>
              <span className="info-value">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}