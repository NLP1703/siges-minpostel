const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Written:', fullPath);
}

// 1. ModalConfirmation.jsx
writeFile('frontend/src/components/ui/ModalConfirmation.jsx', `import React, { useEffect } from 'react';
import './ModalConfirmation.css';

export function ModalConfirmation({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = 'Confirmer', 
  cancelLabel = 'Annuler',
  singleButton = false,
  onConfirm, 
  onCancel,
  children
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">
          {message && <p className="modal-message">{message}</p>}
          {children}
        </div>
        <div className="modal-footer">
          {!singleButton && (
            <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
    </div>
  );
}
`);

// 2. MesReservations.jsx - with edit functionality
writeFile('frontend/src/pages/user/MesReservations.jsx', `import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsApi } from '../../api/reservationsApi';
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
      setError('Erreur lors du chargement des réservations');
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
      setError('Erreur lors de l\\'annulation');
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
    <div className="mes-reservations-page page-fade-in">
      <h1 className="page-title">Mes réservations</h1>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      <div className="filters-bar">
        <select value={filters.statut} onChange={e => { setFilters({ ...filters, statut: e.target.value }); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="validee">Validée</option>
          <option value="refusee">Refusée</option>
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={e => { setFilters({ ...filters, date: e.target.value }); setPage(1); }}
        />
      </div>

      {reservations.length === 0 ? (
        <p className="empty-message">Aucune réservation trouvée</p>
      ) : (
        <div className="reservations-table-wrapper">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Salle</th>
                <th>Date</th>
                <th>Heure début</th>
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
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button>
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
      )}
    </div>
  );
}
`);

// 3. GestionUtilisateurs.jsx - with edit functionality
writeFile('frontend/src/pages/admin/GestionUtilisateurs.jsx', `import React, { useEffect, useState } from 'react';
import { usersApi } from '../../api/usersApi';
import { ModalConfirmation } from '../../components/ui/ModalConfirmation';
import { Loader } from '../../components/ui/Loader';
import { AlertMessage } from '../../components/ui/AlertMessage';
import './GestionUtilisateurs.css';

export function GestionUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', prenom: '', email: '', role: 'user' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ limit: 100 });
      setUsers(res.data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActif = async (user) => {
    try {
      await usersApi.update(user.id, { actif: !user.actif });
      setSuccess(\`Utilisateur \${user.actif ? 'suspendu' : 'activé'}\`);
      fetchUsers();
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await usersApi.delete(deleteId);
      setSuccess('Utilisateur supprimé');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleEditOpen = (user) => {
    setEditUser(user);
    setEditForm({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      role: user.role || 'user'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await usersApi.update(editUser.id, editForm);
      setSuccess('Utilisateur mis à jour');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const filteredUsers = users.filter(u =>
    \\`\${u.nom} \${u.prenom} \${u.email}\\`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && users.length === 0) return <Loader />;

  return (
    <div className="gestion-utilisateurs-page page-fade-in">
      <h1 className="page-title">Gestion des Utilisateurs</h1>
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>{u.nom}</td>
                <td>{u.prenom}</td>
                <td>{u.email}</td>
                <td>
                  <span className={\\`role-badge role-\${u.role}\\`}>{u.role}</span>
                </td>
                <td>
                  <span className={\\`status-badge \${u.actif ? 'status-active' : 'status-inactive'}\\`}>
                    {u.actif ? 'Actif' : 'Suspendu'}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditOpen(u)}>Modifier</button>
                  <button className={u.actif ? 'btn-cancel' : 'btn-validate'} onClick={() => handleToggleActif(u)}>
                    {u.actif ? 'Suspendre' : 'Activer'}
                  </button>
                  <button className="btn-delete" onClick={() => setDeleteId(u.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <ModalConfirmation
          isOpen={true}
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          confirmLabel="Oui, supprimer"
          cancelLabel="Annuler"
        />
      )}

      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Modifier l'utilisateur</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-field">
                <label>Nom</label>
                <input value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Prénom</label>
                <input value={editForm.prenom} onChange={e => setEditForm({ ...editForm, prenom: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Rôle</label>
                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditUser(null)}>Annuler</button>
                <button type="submit" className="btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
      )}
    </div>
  );
}
`);

// 4. NouvReservation.jsx - handle 409 conflict
writeFile('frontend/src/pages/user/NouvReservation.jsx', `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sallesApi } from '../../api/sallesApi';
import { reservationsApi } from '../../api/reservationsApi';
import { SalleCard } from '../../components/salles/SalleCard';
import { CreneauCell } from '../../components/calendrier/CreneauCell';
import { ModalConfirmation } from '../../components/ui/ModalConfirmation';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Loader } from '../../components/ui/Loader';
import { getTodayISO } from '../../utils/formatDate';
import './NouvReservation.css';

const STEPS = ['Choisir une salle', 'Choisir un créneau', 'Confirmer'];

export function NouvReservation() {
  const [step, setStep] = useState(0);
  const [salles, setSalles] = useState([]);
  const [selectedSalle, setSelectedSalle] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [creneaux, setCreneaux] = useState([]);
  const [heureDebut, setHeureDebut] = useState(null);
  const [heureFin, setHeureFin] = useState(null);
  const [objet, setObjet] = useState('');
  const [nbParticipants, setNbParticipants] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingSalles, setFetchingSalles] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sallesApi.getAll({ actif: true }).then(res => {
      setSalles(res.data.data || []);
      setFetchingSalles(false);
    }).catch(() => setFetchingSalles(false));
  }, []);

  useEffect(() => {
    if (selectedSalle && selectedDate) {
      setLoading(true);
      sallesApi.getDisponibilites(selectedSalle.id, selectedDate)
        .then(res => {
          setCreneaux(res.data.data?.creneaux || []);
          setHeureDebut(null);
          setHeureFin(null);
        })
        .catch(() => setError('Erreur lors du chargement des créneaux'))
        .finally(() => setLoading(false));
    }
  }, [selectedSalle, selectedDate]);

  const handleCreneauClick = (heure) => {
    if (!heureDebut) {
      setHeureDebut(heure);
    } else if (!heureFin) {
      if (heure <= heureDebut) {
        setHeureDebut(heure);
        setHeureFin(null);
      } else {
        setHeureFin(heure);
      }
    } else {
      setHeureDebut(heure);
      setHeureFin(null);
    }
  };

  const handleSubmit = async () => {
    setError('');
    try {
      await reservationsApi.create({
        salle_id: selectedSalle.id,
        date: selectedDate,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        objet,
        nb_participants: parseInt(nbParticipants)
      });
      setShowConfirm(true);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 409) {
        setError(msg || 'Ce créneau est déjà réservé. Veuillez en choisir un autre.');
      } else {
        setError(msg || 'Erreur lors de la réservation');
      }
    }
  };

  const canProceed = () => {
    if (step === 0) return selectedSalle !== null;
    if (step === 1) return heureDebut && heureFin;
    if (step === 2) return objet.length >= 3 && nbParticipants >= 1 && nbParticipants <= selectedSalle?.capacite;
    return false;
  };

  if (fetchingSalles) return <Loader />;

  return (
    <div className="nouv-reservation-page page-fade-in">
      <h1 className="page-title">Nouvelle réservation</h1>

      <div className="stepper">
        {STEPS.map((label, idx) => (
          <div key={idx} className={\\`step \\${idx === step ? 'step-active' : ''} \\${idx < step ? 'step-completed' : ''}\\`}>
            <div className="step-circle">{idx < step ? '✓' : idx + 1}</div>
            <span className="step-label">{label}</span>
            {idx < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      {step === 0 && (
        <div className="step-content fade-in">
          <h2>Sélectionnez une salle</h2>
          <div className="salles-grid">
            {salles.map(salle => (
              <SalleCard
                key={salle.id}
                salle={salle}
                selected={selectedSalle?.id === salle.id}
                onClick={setSelectedSalle}
              />
            ))}
          </div>
      )}

      {step === 1 && (
        <div className="step-content fade-in">
          <h2>Choisissez la date et le créneau pour {selectedSalle?.nom}</h2>
          <div className="date-picker">
            <label>Date :</label>
            <input
              type="date"
              value={selectedDate}
              min={getTodayISO()}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          {loading ? <Loader /> : (
            <>
              <p className="creneaux-hint">
                Sélectionnez l'heure de début, puis l'heure de fin.
                {heureDebut && !heureFin && <span> Début : {heureDebut}</span>}
                {heureDebut && heureFin && <span> {heureDebut} - {heureFin}</span>}
              </p>
              <div className="creneaux-grid">
                {creneaux.map(c => (
                  <CreneauCell
                    key={c.heure}
                    heure={c.heure}
                    statut={c.statut}
                    selected={c.heure === heureDebut || c.heure === heureFin}
                    onClick={handleCreneauClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="step-content fade-in">
          <h2>Détails de la réservation</h2>
          <div className="reservation-form">
            <div className="form-field">
              <label>Objet de la réunion</label>
              <textarea
                value={objet}
                onChange={e => setObjet(e.target.value)}
                rows={3}
                placeholder="Décrivez l'objet de votre réunion..."
              />
            </div>
            <div className="form-field">
              <label>Nombre de participants (max {selectedSalle?.capacite})</label>
              <input
                type="number"
                min={1}
                max={selectedSalle?.capacite}
                value={nbParticipants}
                onChange={e => setNbParticipants(e.target.value)}
              />
            </div>
            <div className="reservation-recap">
              <h3>Récapitulatif</h3>
              <p><strong>Salle :</strong> {selectedSalle?.nom}</p>
              <p><strong>Date :</strong> {selectedDate}</p>
              <p><strong>Horaire :</strong> {heureDebut} - {heureFin}</p>
              <p><strong>Participants :</strong> {nbParticipants}</p>
              <p><strong>Objet :</strong> {objet}</p>
            </div>
        </div>
      )}

      <div className="step-actions">
        {step > 0 && (
          <button className="btn-secondary" onClick={() => setStep(step - 1)}>
            Précédent
          </button>
        )}
        {step < 2 ? (
          <button className="btn-primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Suivant
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit} disabled={!canProceed()}>
            Confirmer la réservation
          </button>
        )}
      </div>

      {showConfirm && (
        <ModalConfirmation
          isOpen={true}
          title="Réservation confirmée"
          message={\\`Votre réservation pour \\${selectedSalle?.nom} le \\${selectedDate} de \\${heureDebut} à \\${heureFin} a été créée avec succès.\\`}
          onConfirm={() => navigate('/mes-reservations')}
          confirmLabel="Voir mes réservations"
          singleButton={true}
        />
      )}
    </div>
  );
}
`);

console.log('All files written successfully!');
