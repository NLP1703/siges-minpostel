import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { AlertMessage } from '../../components/ui/AlertMessage';
import './Auth.css';

export function Login() {
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});

    const newErrors = {};
    if (!form.email) newErrors.email = 'L\'email est obligatoire';
    if (!form.motDePasse) newErrors.motDePasse = 'Le mot de passe est obligatoire';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur de connexion';
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
          <p className="auth-subtitle">Gestion des Salles de Reunion</p>
        </div>

        {globalError && <AlertMessage type="error" message={globalError} />}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="votre@email.cm"
              className={errors.email ? 'auth-input-error' : ''}
            />
            {errors.email && <span className="auth-error-text">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="motDePasse">Mot de passe</label>
            <input
              id="motDePasse"
              name="motDePasse"
              type="password"
              value={form.motDePasse}
              onChange={handleChange}
              placeholder="********"
              className={errors.motDePasse ? 'auth-input-error' : ''}
            />
            {errors.motDePasse && <span className="auth-error-text">{errors.motDePasse}</span>}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">Creer un compte</Link>
        </p>
      </div>
    </div>
  );
}
