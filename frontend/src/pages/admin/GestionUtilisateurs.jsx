import React, { useEffect, useState } from 'react';
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

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', prenom: '', email: '', role: 'user' });

  const handleToggleActif = async (user) => {
    try {
      await usersApi.update(user.id, { actif: !user.actif });
      setSuccess(`Utilisateur ${user.actif ? 'suspendu' : 'activé'}`);
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
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
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
                  <span className={`role-badge role-${u.role}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`status-badge ${u.actif ? 'status-active' : 'status-inactive'}`}>
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
        </div>
      )}
    </div>
  );
}
