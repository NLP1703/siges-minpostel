import React, { useState, useEffect } from 'react';
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

const STEPS = ['Choisir une salle', 'Choisir un creneau', 'Confirmer'];

const EQUIPEMENTS_DISPONIBLES = [
  { id: 'videoprojecteur', label: 'Vidéoprojecteur' },
  { id: 'tableau_blanc', label: 'Tableau blanc' },
  { id: 'climatisation', label: 'Climatisation' },
  { id: 'microphone', label: 'Microphone' },
  { id: 'visioconference', label: 'Visioconférence' }
];

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
  const [equipements, setEquipements] = useState([]);
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
        .catch(() => setError('Erreur lors du chargement des creneaux'))
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
        nb_participants: parseInt(nbParticipants),
        equipements: equipements
      });
      setShowConfirm(true);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 409) {
        setError(msg || 'Ce creneau est deja reserve. Veuillez en choisir un autre.');
      } else {
        setError(msg || 'Erreur lors de la reservation');
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
    <div className="nouv-reservation-page">
      <h1 className="page-title">Nouvelle reservation</h1>

      <div className="stepper">
        {STEPS.map((label, idx) => (
          <div key={idx} className={`step ${idx === step ? 'step-active' : ''} ${idx < step ? 'step-completed' : ''}`}>
            <div className="step-circle">{idx < step ? '✓' : idx + 1}</div>
            <span className="step-label">{label}</span>
            {idx < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      {step === 0 && (
        <div className="step-content fade-in">
          <h2>Selectionnez une salle</h2>
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
        </div>
      )}

      {step === 1 && (
        <div className="step-content fade-in">
          <h2>Choisissez la date et le creneau pour {selectedSalle?.nom}</h2>
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
                Selectionnez l heure de debut, puis l heure de fin.
                {heureDebut && !heureFin && <span> Debut : {heureDebut}</span>}
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
          <h2>Details de la reservation</h2>
          <div className="reservation-form">
            <div className="form-field">
              <label>Objet de la reunion</label>
              <textarea
                value={objet}
                onChange={e => setObjet(e.target.value)}
                rows={3}
                placeholder="Decrivez l'objet de votre reunion..."
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
            <div className="form-field">
              <label>Equipements souhaites (optionnel)</label>
              <div className="equipements-grid">
                {EQUIPEMENTS_DISPONIBLES.map(eq => (
                  <label key={eq.id} className="equipement-checkbox">
                    <input
                      type="checkbox"
                      checked={equipements.includes(eq.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEquipements([...equipements, eq.id]);
                        } else {
                          setEquipements(equipements.filter(id => id !== eq.id));
                        }
                      }}
                    />
                    <span>{eq.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="reservation-recap">
              <h3>Recapitulatif</h3>
              <p><strong>Salle : </strong>{selectedSalle?.nom}</p>
              <p><strong>Date : </strong>{selectedDate}</p>
              <p><strong>Horaire : </strong>{heureDebut} - {heureFin}</p>
              <p><strong>Participants : </strong>{nbParticipants}</p>
              {equipements.length > 0 && (
                <p><strong>Equipements : </strong>{equipements.map(id => EQUIPEMENTS_DISPONIBLES.find(e => e.id === id)?.label).join(', ')}</p>
              )}
              <p><strong>Objet : </strong>{objet}</p>
            </div>
          </div>
        </div>
      )}

      <div className="step-actions">
        {step > 0 && (
          <button className="btn-secondary" onClick={() => setStep(step - 1)}>
            Precedent
          </button>
        )}
        {step < 2 ? (
          <button className="btn-primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Suivant
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit} disabled={!canProceed()}>
            Confirmer la reservation
          </button>
        )}
      </div>

      {showConfirm && (
        <ModalConfirmation
          isOpen={true}
          title="Reservation confirmee"
          message={`Votre reservation pour ${selectedSalle?.nom} le ${selectedDate} de ${heureDebut} a ${heureFin} a ete creee avec succes.`}
          onConfirm={() => navigate('/mes-reservations')}
          confirmLabel="Voir mes reservations"
          singleButton
        />
      )}
    </div>
  );
}

