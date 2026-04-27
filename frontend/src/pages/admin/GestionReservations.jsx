import React, { useEffect, useState } from 'react';
import { reservationsApi } from '../../api/reservationsApi';
import { sallesApi } from '../../api/sallesApi';
import { StatutBadge } from '../../components/ui/StatutBadge';
import { ModalConfirmation } from '../../components/ui/ModalConfirmation';
import { Loader } from '../../components/ui/Loader';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { formatDisplayDate } from '../../utils/formatDate';
import './GestionReservations.css';

export function GestionReservations() {
  const [reservations, setReservations] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ statut: '', date: '', salle_id: '' });
  const [refuseId, setRefuseId] = useState(null);
  const [motifRefus, setMotifRefus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filters.statut) params.statut = filters.statut;
      if (filters.date) params.date = filters.date;
      if (filters.salle_id) params.salle_id = filters.salle_id;

      const [resRes, sallesRes] = await Promise.all([
        reservationsApi.getAll(params),
        sallesApi.getAll()
      ]);
      setReservations(resRes.data.data?.data || []);
      setSalles(sallesRes.data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleValider = async (id) => {
    try {
      await reservationsApi.valider(id);
      setSuccess('Reservation validee');
      fetchData();
    } catch (err) {
      setError('Erreur lors de la validation');
    }
  };

  const handleRefuser = async () => {
    if (!refuseId || !motifRefus || motifRefus.length < 10) {
      setError('Le motif doit contenir au moins 10 caracteres');
      return;
    }
    try {
      await reservationsApi.refuser(refuseId, motifRefus);
      setSuccess('Reservation refusee');
      setRefuseId(null);
      setMotifRefus('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du refus');
    }
  };

  if (loading && reservations.length === 0) return React.createElement(Loader);

  return React.createElement('div', { className: 'gestion-reservations-page page-fade-in' },
    React.createElement('h1', { className: 'page-title' }, 'Gestion des Reservations'),
    success && React.createElement(AlertMessage, { type: 'success', message: success, onClose: () => setSuccess('') }),
    error && React.createElement(AlertMessage, { type: 'error', message: error, onClose: () => setError('') }),
    React.createElement('div', { className: 'filters-bar' },
      React.createElement('select', {
        value: filters.statut,
        onChange: e => setFilters({ ...filters, statut: e.target.value })
      },
        React.createElement('option', { value: '' }, 'Tous les statuts'),
        React.createElement('option', { value: 'en_attente' }, 'En attente'),
        React.createElement('option', { value: 'validee' }, 'Validee'),
        React.createElement('option', { value: 'refusee' }, 'Refusee')
      ),
      React.createElement('input', {
        type: 'date',
        value: filters.date,
        onChange: e => setFilters({ ...filters, date: e.target.value })
      }),
      React.createElement('select', {
        value: filters.salle_id,
        onChange: e => setFilters({ ...filters, salle_id: e.target.value })
      },
        React.createElement('option', { value: '' }, 'Toutes les salles'),
        salles.map(s => React.createElement('option', { key: s.id, value: s.id }, s.nom))
      )
    ),
    React.createElement('div', { className: 'table-wrapper' },
      React.createElement('table', { className: 'data-table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Utilisateur'),
            React.createElement('th', null, 'Salle'),
            React.createElement('th', null, 'Date'),
            React.createElement('th', null, 'Horaire'),
            React.createElement('th', null, 'Objet'),
            React.createElement('th', null, 'Participants'),
            React.createElement('th', null, 'Statut'),
            React.createElement('th', null, 'Motif'),
            React.createElement('th', null, 'Actions')
          )
        ),
        React.createElement('tbody', null,
          reservations.map(r => React.createElement('tr', { key: r.id },
            React.createElement('td', null, r.utilisateur_prenom + ' ' + r.utilisateur_nom),
            React.createElement('td', null, r.salle_nom),
            React.createElement('td', null, formatDisplayDate(r.date)),
            React.createElement('td', null, r.heure_debut + ' - ' + r.heure_fin),
            React.createElement('td', null, r.objet),
            React.createElement('td', null, r.nb_participants),
            React.createElement('td', null, React.createElement(StatutBadge, { statut: r.statut })),
            React.createElement('td', null, r.motif_refus || '-'),
            React.createElement('td', null,
              r.statut === 'en_attente' && React.createElement(React.Fragment, null,
                React.createElement('button', { className: 'btn-validate', onClick: () => handleValider(r.id) }, 'Valider'),
                React.createElement('button', { className: 'btn-reject', onClick: () => setRefuseId(r.id) }, 'Refuser')
              )
            )
          ))
        )
      )
    ),
    refuseId && React.createElement('div', { className: 'modal-overlay', onClick: () => { setRefuseId(null); setMotifRefus(''); } },
      React.createElement('div', { className: 'modal', onClick: e => e.stopPropagation() },
        React.createElement('h3', null, 'Motif du refus'),
        React.createElement('textarea', {
          value: motifRefus,
          onChange: e => setMotifRefus(e.target.value),
          rows: 4,
          placeholder: 'Indiquez le motif du refus (minimum 10 caracteres)...'
        }),
        React.createElement('div', { className: 'modal-actions' },
          React.createElement('button', { className: 'btn-secondary', onClick: () => { setRefuseId(null); setMotifRefus(''); } }, 'Annuler'),
          React.createElement('button', { className: 'btn-primary', onClick: handleRefuser, disabled: motifRefus.length < 10 }, 'Confirmer le refus')
        )
      )
    )
  );
}
