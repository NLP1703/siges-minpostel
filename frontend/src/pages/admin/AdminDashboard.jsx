import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { reservationsApi } from '../../api/reservationsApi';
import { StatutBadge } from '../../components/ui/StatutBadge';
import { Loader } from '../../components/ui/Loader';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { StatCard } from '../../components/stats/StatCard';
import { GraphiqueBarres } from '../../components/stats/GraphiqueBarres';
import { GraphiqueCamembert } from '../../components/stats/GraphiqueCamembert';
import './AdminDashboard.css';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          dashboardApi.getStats(),
          reservationsApi.getAll({ statut: 'en_attente', limit: 10 })
        ]);
        setStats(statsRes.data.data);
        setPendingReservations(pendingRes.data.data?.data || []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleValider = async (id) => {
    try {
      await reservationsApi.valider(id);
      setActionMsg('Réservation validée');
      refreshData();
    } catch (err) {
      setError('Erreur lors de la validation');
    }
  };

  const handleRefuser = async (id) => {
    const motif = prompt('Motif du refus (minimum 10 caractères) :');
    if (!motif || motif.length < 10) {
      setError('Le motif doit contenir au moins 10 caractères');
      return;
    }
    try {
      await reservationsApi.refuser(id, motif);
      setActionMsg('Réservation refusée');
      refreshData();
    } catch (err) {
      setError('Erreur lors du refus');
    }
  };

  const refreshData = async () => {
    const [statsRes, pendingRes] = await Promise.all([
      dashboardApi.getStats(),
      reservationsApi.getAll({ statut: 'en_attente', limit: 10 })
    ]);
    setStats(statsRes.data.data);
    setPendingReservations(pendingRes.data.data?.data || []);
  };

  if (loading) return <Loader />;

  const barresData = stats?.reservations_par_salle_7j?.map(item => ({
    label: item.nom,
    valeur: item.reservations_count
  })) || [];

  const camembertData = stats?.repartition_statuts ? [
    { label: 'En attente', valeur: stats.repartition_statuts.en_attente, color: '#FFC107' },
    { label: 'Validées', valeur: stats.repartition_statuts.validee, color: '#28A745' },
    { label: 'Refusées', valeur: stats.repartition_statuts.refusee, color: '#DC3545' }
  ] : [];

  return (
    <div className="admin-dashboard-page page-fade-in">
      <h1 className="page-title">Dashboard Administrateur</h1>

      {actionMsg && <AlertMessage type="success" message={actionMsg} onClose={() => setActionMsg('')} />}
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      <div className="kpi-grid">
        <StatCard
          title="Réservations aujourd'hui"
          value={stats?.reservations_aujourd_hui || 0}
          color="#007A5E"
        />
        <StatCard
          title="En attente"
          value={stats?.en_attente || 0}
          color="#FFA500"
        />
        <StatCard
          title="Validées ce mois"
          value={stats?.validees_ce_mois || 0}
          color="#28A745"
        />
        <StatCard
          title="Refusées ce mois"
          value={stats?.refusees_ce_mois || 0}
          color="#DC3545"
        />
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <GraphiqueBarres
            data={barresData}
            title="Réservations par salle (7 derniers jours)"
          />
        </div>
        <div className="chart-card">
          <GraphiqueCamembert
            data={camembertData}
            title="Répartition des statuts"
          />
        </div>
      </div>

      <div className="pending-section">
        <h3>Demandes en attente ({pendingReservations.length})</h3>
        {pendingReservations.length === 0 ? (
          <p className="empty-message">Aucune demande en attente</p>
        ) : (
          <table className="pending-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Salle</th>
                <th>Date</th>
                <th>Horaire</th>
                <th>Objet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingReservations.map(r => (
                <tr key={r.id}>
                  <td>{r.utilisateur_prenom} {r.utilisateur_nom}</td>
                  <td>{r.salle_nom}</td>
                  <td>{r.date}</td>
                  <td>{r.heure_debut} - {r.heure_fin}</td>
                  <td>{r.objet}</td>
                  <td>
                    <button className="btn-validate" onClick={() => handleValider(r.id)}>Valider</button>
                    <button className="btn-reject" onClick={() => handleRefuser(r.id)}>Refuser</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

