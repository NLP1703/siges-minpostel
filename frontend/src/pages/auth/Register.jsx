import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { AlertMessage } from '../../components/ui/AlertMessage';
import './Auth.css';

export function Register() {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: ''
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!form.prenom.trim()) newErrors.prenom = 'Le prenom est obligatoire';
    if (!form.email) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!form.motDePasse) {
      newErrors.motDePasse = 'Le mot de passe est obligatoire';
    } else if (form.motDePasse.length < 8) {
      newErrors.motDePasse = 'Minimum 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.motDePasse)) {
      newErrors.motDePasse = 'Doit contenir minuscules, majuscules et chiffres';
    }
    if (form.motDePasse !== form.confirmMotDePasse) {
      newErrors.confirmMotDePasse = 'Les mots de passe ne correspondent pas';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setSuccess('');

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        motDePasse: form.motDePasse
      });
      setSuccess('Compte cree avec succes ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">CM</div>
          <h1 className="auth-title">SIGES-MINPOSTEL</h1>
          <p className="auth-subtitle">Creer votre compte</p>
        </div>

        {globalError && <AlertMessage type="error" message={globalError} />}
        {success && <AlertMessage type="success" message={success} />}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" value={form.nom} onChange={handleChange}
              placeholder="Votre nom" className={errors.nom ? 'auth-input-error' : ''} />
            {errors.nom && <span className="auth-error-text">{errors.nom}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="prenom">Prenom</label>
            <input id="prenom" name="prenom" value={form.prenom} onChange={handleChange}
              placeholder="Votre prenom" className={errors.prenom ? 'auth-input-error' : ''} />
            {errors.prenom && <span className="auth-error-text">{errors.prenom}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="votre@email.cm" className={errors.email ? 'auth-input-error' : ''} />
            {errors.email && <span className="auth-error-text">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="motDePasse">Mot de passe</label>
            <input id="motDePasse" name="motDePasse" type="password" value={form.motDePasse}
              onChange={handleChange} placeholder="********"
              className={errors.motDePasse ? 'auth-input-error' : ''} />
            {errors.motDePasse && <span className="auth-error-text">{errors.motDePasse}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="confirmMotDePasse">Confirmer le mot de passe</label>
            <input id="confirmMotDePasse" name="confirmMotDePasse" type="password"
              value={form.confirmMotDePasse} onChange={handleChange} placeholder="********"
              className={errors.confirmMotDePasse ? 'auth-input-error' : ''} />
            {errors.confirmMotDePasse && <span className="auth-error-text">{errors.confirmMotDePasse}</span>}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creation...' : 'Creer mon compte'}
          </button>
        </form>

        <p className="auth-footer">
          Deja un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
