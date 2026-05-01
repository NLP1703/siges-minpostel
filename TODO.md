# TODO - Fix Calendrier Semaine & Créneaux

## Problèmes identifiés
1. Les réservations ne s'affichaient pas dans le calendrier de la semaine
2. Les créneaux réservés apparaissaient toujours comme "disponibles"
3. Le backend ne traitait pas les filtres `date_debut`/`date_fin`

## Fichiers modifiés
- [x] `frontend/src/components/calendrier/CalendrierSemaine.jsx` - Normalisation date/heure pour comparaison
- [x] `frontend/src/components/calendrier/CreneauCell.jsx` - Correction tooltips (orthographe)
- [x] `backend/controllers/reservationController.js` - Ajout date_debut/date_fin

## Corrections appliquées

### 1. CalendrierSemaine.jsx
- Normalisation de `r.date` : gère les objets `Date` JavaScript et les strings ISO retournées par MySQL
- Normalisation de `r.heure_debut` / `r.heure_fin` : tronque les secondes (`HH:MM:SS` → `HH:MM`) pour permettre la comparaison lexicographique avec les créneaux du calendrier

### 2. CreneauCell.jsx
- `Creaneau disponible` → `Créneau disponible`
- `Salle occupee` → `Salle occupée`

### 3. reservationController.js
- Ajout des filtres `date_debut` → `dateDebut` et `date_fin` → `dateFin` transmis au modèle

## Résultat attendu
- Les réservations s'affichent correctement sur le calendrier de la semaine (couleur rouge pour validées, orange pour tampon)
- Les créneaux occupés affichent le tooltip "Salle occupée" et ne sont plus cliquables
- Le Dashboard filtre correctement les réservations sur la plage de la semaine en cours

