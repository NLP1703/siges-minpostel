import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsApi } from '../../api/reservationsApi';
import { StatutBadge } from '../../components/ui/StatutBadge';
import { Loader } from '../../components/ui/Loader';
import { CalendrierSemaine } from '../../components/calendrier/CalendrierSemaine';
import { getTodayISO, formatDisplayDate } from '../../utils/formatDate';
import './Dashboard.css';

// Helper function to get the Monday of the current week
const getWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

export function Dashboard() {
  const [todayReservations, setTodayReservations] = useState([]);
  const [weekReservations, setWeekReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = getTodayISO();
        const weekDates = getWeekDates();
        
        // Fetch today's reservations
        const todayRes = await reservationsApi.getAll({ date: today, limit: 10 });
        setTodayReservations(todayRes.data.data?.data || []);
        
        // Fetch all reservations for the current week
        const weekRes = await reservationsApi.getAll({ 
          date_debut: weekDates[0], 
          date_fin: weekDates[4],
          limit: 100
        });
        setWeekReservations(weekRes.data.data?.data || []);
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
        {weekReservations.length === 0 ? (
          <p className="dashboard-empty">Aucune reservation a venir</p>
        ) : (
          <div className="dashboard-list">
            {weekReservations.slice(0, 5).map(r => (
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
          reservations={weekReservations}
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
