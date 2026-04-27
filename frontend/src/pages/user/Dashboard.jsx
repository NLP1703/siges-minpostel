import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsApi } from '../../api/reservationsApi';
import { StatutBadge } from '../../components/ui/StatutBadge';
import { Loader } from '../../components/ui/Loader';
import { CalendrierSemaine } from '../../components/calendrier/CalendrierSemaine';
import { getTodayISO, formatDisplayDate } from '../../utils/formatDate';
import './Dashboard.css';

export function Dashboard() {
  const [todayReservations, setTodayReservations] = useState([]);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = getTodayISO();
        const [todayRes, upcomingRes] = await Promise.all([
          reservationsApi.getAll({ date: today, limit: 10 }),
          reservationsApi.getAll({ page: 1, limit: 5 })
        ]);
        setTodayReservations(todayRes.data.data?.data || []);
        setUpcomingReservations(upcomingRes.data.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Tableau de bord</h1>

      <section className="dashboard-section">
        <h2>Mes reservations du jour</h2>
        {todayReservations.length === 0 ? (
          <p className="dashboard-empty">Aucune reservation aujourd'hui</p>
        ) : (
          <div className="dashboard-list">
            {todayReservations.map(r => (
              <div key={r.id} className="dashboard-card">
                <div className="dashboard-card-info">
                  <span className="dashboard-card-salle">{r.salle_nom}</span>
                  <span className="dashboard-card-time">{r.heure_debut} - {r.heure_fin}</span>
                  <span className="dashboard-card-objet">{r.objet}</span>
                </div>
                <StatutBadge statut={r.statut} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Prochaines reservations</h2>
        {upcomingReservations.length === 0 ? (
          <p className="dashboard-empty">Aucune reservation a venir</p>
        ) : (
          <div className="dashboard-list">
            {upcomingReservations.slice(0, 5).map(r => (
              <div key={r.id} className="dashboard-card">
                <div className="dashboard-card-info">
                  <span className="dashboard-card-salle">{r.salle_nom}</span>
                  <span className="dashboard-card-date">{formatDisplayDate(r.date)}</span>
                  <span className="dashboard-card-time">{r.heure_debut} - {r.heure_fin}</span>
                  <span className="dashboard-card-objet">{r.objet}</span>
                </div>
                <StatutBadge statut={r.statut} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Calendrier de la semaine</h2>
        <CalendrierSemaine 
          reservations={upcomingReservations}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </section>

      <button className="fab-button" onClick={() => navigate('/nouvelle-reservation')} title="Nouvelle reservation">
        +
      </button>
    </div>
  );
}
