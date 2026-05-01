import React, { useEffect, useState } from 'react';
import { sallesApi } from '../../api/sallesApi';
import { ModalConfirmation } from '../../components/ui/ModalConfirmation';
import { Loader } from '../../components/ui/Loader';
import { AlertMessage } from '../../components/ui/AlertMessage';
import './GestionSalles.css';

const EQUIPEMENTS_LIST = [
  'videoprojecteur',
  'tableau blanc',
  'climatisation',
  'microphone',
  'visioconference'
];

export function GestionSalles() {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSalle, setEditingSalle] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [photoPreviewError, setPhotoPreviewError] = useState(false);

  // Validation stricte de l'URL (reject data:image et URLs invalides)
  const isValidPhotoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    // Rejeter les URLs data:image (base64 inline)
    if (trimmed.toLowerCase().startsWith('data:')) return false;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const [form, setForm] = useState({
    nom: '',
    capacite: '',
    equipements: [],
    photo_url: '',
    actif: true
  });

  const fetchSalles = async () => {
    setLoading(true);
    try {
      const res = await sallesApi.getAll();
      setSalles(res.data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des salles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalles();
  }, []);

  const resetForm = () => {
    setForm({ nom: '', capacite: '', equipements: [], photo_url: '', actif: true });
    setEditingSalle(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (salle) => {
    setEditingSalle(salle);
    setForm({
      nom: salle.nom,
      capacite: salle.capacite,
      equipements: salle.equipements || [],
      photo_url: salle.photo_url || '',
      actif: salle.actif
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation stricte de l'URL de la photo (reject data:image)
    if (form.photo_url && form.photo_url.trim()) {
      if (!isValidPhotoUrl(form.photo_url)) {
        setError('URL invalide. Utilisez une URL HTTPS externe (ex: https://exemple.com/image.jpg). Les images embeddées (data:image) ne sont pas supportées.');
        return;
      }
    }
    
    try {
      if (editingSalle) {
        await sallesApi.update(editingSalle.id, form);
        setSuccess('Salle mise a jour');
      } else {
        await sallesApi.create(form);
        setSuccess('Salle creee');
      }
      setShowForm(false);
      resetForm();
      fetchSalles();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await sallesApi.delete(deleteId);
      setSuccess('Salle supprimee');
      setDeleteId(null);
      fetchSalles();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const toggleEquipement = (eq) => {
    setForm(prev => ({
      ...prev,
      equipements: prev.equipements.includes(eq)
        ? prev.equipements.filter(e => e !== eq)
        : [...prev.equipements, eq]
    }));
  };

  if (loading && salles.length === 0) return React.createElement(Loader);

  return React.createElement('div', { className: 'gestion-salles-page page-fade-in' },
    React.createElement('div', { className: 'page-header' },
      React.createElement('h1', { className: 'page-title' }, 'Gestion des Salles'),
      React.createElement('button', { className: 'btn-primary', onClick: openCreate }, '+ Ajouter une salle')
    ),
    success && React.createElement(AlertMessage, { type: 'success', message: success, onClose: () => setSuccess('') }),
    error && React.createElement(AlertMessage, { type: 'error', message: error, onClose: () => setError('') }),
    React.createElement('div', { className: 'table-wrapper' },
      React.createElement('table', { className: 'data-table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Nom'),
            React.createElement('th', null, 'Capacite'),
            React.createElement('th', null, 'Equipements'),
            React.createElement('th', null, 'Statut'),
            React.createElement('th', null, 'Actions')
          )
        ),
        React.createElement('tbody', null,
          salles.map(salle => React.createElement('tr', { key: salle.id },
            React.createElement('td', null, salle.nom),
            React.createElement('td', null, salle.capacite),
            React.createElement('td', null,
              React.createElement('div', { className: 'tags' },
                salle.equipements?.map(eq => React.createElement('span', { key: eq, className: 'tag' }, eq))
              )
            ),
            React.createElement('td', null,
              React.createElement('span', { className: 'status-badge ' + (salle.actif ? 'status-active' : 'status-inactive') },
                salle.actif ? 'Actif' : 'Inactif'
              )
            ),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-edit', onClick: () => openEdit(salle) }, 'Modifier'),
              React.createElement('button', { className: 'btn-cancel', onClick: () => setDeleteId(salle.id) }, 'Supprimer')
            )
          ))
        )
      )
    ),
    showForm && React.createElement('div', { className: 'modal-overlay', onClick: () => setShowForm(false) },
      React.createElement('div', { className: 'modal', onClick: e => e.stopPropagation() },
        React.createElement('h3', null, editingSalle ? 'Modifier la salle' : 'Nouvelle salle'),
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement('div', { className: 'form-field' },
            React.createElement('label', null, 'Nom'),
            React.createElement('input', { value: form.nom, onChange: e => setForm({ ...form, nom: e.target.value }), required: true })
          ),
          React.createElement('div', { className: 'form-field' },
            React.createElement('label', null, 'Capacite'),
            React.createElement('input', { type: 'number', min: 1, value: form.capacite, onChange: e => setForm({ ...form, capacite: e.target.value }), required: true })
          ),
          React.createElement('div', { className: 'form-field' },
            React.createElement('label', null, 'URL Photo'),
            React.createElement('input', { value: form.photo_url, onChange: e => { setForm({ ...form, photo_url: e.target.value }); setPhotoPreviewError(false); }, placeholder: 'https://exemple.com/image.jpg' }),
            form.photo_url && React.createElement('div', { className: 'image-preview', style: { marginTop: '0.5rem' } },
              !photoPreviewError ? (
                React.createElement('img', { 
                  src: form.photo_url, 
                  alt: 'Apercu', 
                  style: { maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' },
                  onError: () => setPhotoPreviewError(true)
                })
              ) : (
                React.createElement('div', { style: { padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.875rem' } }, '⚠️ Image invalide ou inaccessible')
              )
            )
          ),
          React.createElement('div', { className: 'form-field' },
            React.createElement('label', null, 'Equipements'),
            React.createElement('div', { className: 'checkbox-group' },
              EQUIPEMENTS_LIST.map(eq => React.createElement('label', { key: eq, className: 'checkbox-label' },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: form.equipements.includes(eq),
                  onChange: () => toggleEquipement(eq)
                }),
                eq
              ))
            )
          ),
          React.createElement('div', { className: 'form-field' },
            React.createElement('label', { className: 'checkbox-label' },
              React.createElement('input', {
                type: 'checkbox',
                checked: form.actif,
                onChange: e => setForm({ ...form, actif: e.target.checked })
              }),
              'Salle active'
            )
          ),
          React.createElement('div', { className: 'modal-actions' },
            React.createElement('button', { type: 'button', className: 'btn-secondary', onClick: () => setShowForm(false) }, 'Annuler'),
            React.createElement('button', { type: 'submit', className: 'btn-primary' }, editingSalle ? 'Mettre a jour' : 'Creer')
          )
        )
      )
    ),
    deleteId && React.createElement(ModalConfirmation, {
      isOpen: true,
      title: 'Confirmer la suppression',
      message: 'Etes-vous sur de vouloir supprimer cette salle ?',
      onConfirm: handleDelete,
      onCancel: () => setDeleteId(null),
      confirmLabel: 'Oui, supprimer',
      cancelLabel: 'Annuler'
    })
  );
}
