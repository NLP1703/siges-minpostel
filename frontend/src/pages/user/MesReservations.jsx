import React, { useEffect, useState } from 'react';
import { reservationsApi } from '../../api/reservationsApi';
import { useNavigate } from 'react-router-dom';
import { StatutBadge } from '../../components/ui/StatutBadge';
import { ModalConfirmation } from '../../components/ui/ModalConfirmation';
import { Loader } from '../../components/ui/Loader';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { formatDisplayDate } from '../../utils/formatDate';
import './MesReservations.css';

export function MesReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ statut: '', date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelId, setCancelId] = useState(null);
  const [editReservation, setEditReservation] = useState(null);
  const [editForm, setEditForm] = useState({ objet: '', nb_participants: 1 });
  const navigate = useNavigate();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filters.statut) params.statut = filters.statut;
      if (filters.date) params.date = filters.date;
      const res = await reservationsApi.getAll(params);
      setReservations(res.data.data?.data || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (err) {
      setError('Erreur lors du chargement des reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page, filters]);

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await reservationsApi.delete(cancelId);
      setCancelId(null);
      fetchReservations();
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    }
  };

  const handleEditOpen = (r) => {
    setEditReservation(r);
    setEditForm({ objet: r.objet || '', nb_participants: r.nb_participants || 1 });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editReservation) return;
    try {
      await reservationsApi.update(editReservation.id, editForm);
      setEditReservation(null);
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  if (loading && reservations.length === 0) return <Loader />;

  return (
    <div className="mes-reservations-page">
      <h1 className="page-title">Mes reservations</h1>

      {error && <AlertMessage type="error" message={error} />}

      <div className="filters-bar">
        <select value={filters.statut} onChange={e => { setFilters({ ...filters, statut: e.target.value }); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="validee">Validee</option>
          <option value="refusee">Refusee</option>
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={e => { setFilters({ ...filters, date: e.target.value }); setPage(1); }}
        />
      </div>

      {reservations.length === 0 ? (
        <p className="empty-message">Aucune reservation trouvee</p>
      ) : (
        <div className="reservations-table-wrapper">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Salle</th>
                <th>Date</th>
                <th>Heure debut</th>
                <th>Heure fin</th>
                <th>Objet</th>
                <th>Participants</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id}>
                  <td>{r.salle_nom}</td>
                  <td>{formatDisplayDate(r.date)}</td>
                  <td>{r.heure_debut}</td>
                  <td>{r.heure_fin}</td>
                  <td>{r.objet}</td>
                  <td>{r.nb_participants}</td>
                  <td><StatutBadge statut={r.statut} /></td>
                  <td>
                    {r.statut === 'en_attente' && (
                      <>
                        <button className="btn-edit" onClick={() => handleEditOpen(r)}>Modifier</button>
                        <button className="btn-cancel" onClick={() => setCancelId(r.id)}>Annuler</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Precedent</button>
              <span>Page {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Suivant</button>
            </div>
          )}
        </div>
      )}

      {cancelId && (
        <ModalConfirmation
          isOpen={true}
          title="Confirmer l'annulation"
          message="Êtes-vous sûr de vouloir annuler cette réservation ?"
          onConfirm={handleCancel}
          onCancel={() => setCancelId(null)}
          confirmLabel="Oui, annuler"
          cancelLabel="Non"
        />
      )}

      {editReservation && (
        <div className="modal-overlay" onClick={() => setEditReservation(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Modifier la réservation</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-field">
                <label>Objet de la réunion</label>
                <textarea
                  value={editForm.objet}
                  onChange={e => setEditForm({ ...editForm, objet: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="form-field">
                <label>Nombre de participants</label>
                <input
                  type="number"
                  min={1}
                  value={editForm.nb_participants}
                  onChange={e => setEditForm({ ...editForm, nb_participants: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditReservation(null)}>Annuler</button>
                <button type="submit" className="btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
