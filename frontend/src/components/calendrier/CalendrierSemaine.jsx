import React from 'react';
import { CreneauCell } from './CreneauCell';
import './CalendrierSemaine.css';

const HEURES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

export function CalendrierSemaine({ 
  reservations = [], 
  onCreneauClick,
  selectedDate = null,
  onDateChange 
}) {
  // Generate dates for the week
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    return JOURS.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        jour: JOURS[index],
        date: date.toISOString().split('T')[0],
        numero: date.getDate()
      };
    });
  };

  const weekDates = getWeekDates();

  // Get status for a specific cell
  const getCreneauStatus = (jourIndex, heure) => {
    const date = weekDates[jourIndex].date;
    const res = reservations.find(r => {
      const resDate = r.date || r.date_reservation;
      const debut = r.heure_debut;
      const fin = r.heure_fin;
      return resDate === date && heure >= debut && heure < fin;
    });
    
    if (res) {
      return res.statut === 'validee' ? 'occupe' : 'tampon';
    }
    return 'libre';
  };

  return (
    <div className="calendrier-semaine">
      <div className="calendrier-header">
        <div className="calendrier-corner"></div>
        {JOURS.map((jour, index) => (
          <div 
            key={jour} 
            className={`calendrier-day-header ${selectedDate === weekDates[index].date ? 'selected' : ''}`}
            onClick={() => onDateChange && onDateChange(weekDates[index].date)}
          >
            <span className="day-name">{jour}</span>
            <span className="day-number">{weekDates[index].numero}</span>
          </div>
        ))}
      </div>
      
      <div className="calendrier-body">
        {HEURES.map((heure) => (
          <div key={heure} className="calendrier-row">
            <div className="calendrier-time">{heure}</div>
            {JOURS.map((_, jourIndex) => {
              const status = getCreneauStatus(jourIndex, heure);
              return (
                <div key={`${jourIndex}-${heure}`} className="calendrier-cell">
                  <CreneauCell 
                    heure={heure}
                    statut={status}
                    onClick={(h) => onCreneauClick && onCreneauClick(weekDates[jourIndex].date, h)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}