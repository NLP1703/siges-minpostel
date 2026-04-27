# TODO FRONTEND — Fin du projet SIGES-MINPOSTEL

## 🔥 Phase 1 : Bugs bloquants
- [x] Corriger AdminDashboard.jsx (balises non fermées)
- [x] Corriger Header.jsx (balises non fermées, encodage, placeholders)
- [ ] Corriger Header.css (supprimer gradient, flat design)
- [ ] Corriger Sidebar.css (synchroniser sidebar-open / .sidebar.open)
- [ ] Corriger axiosConfig.js (redirection /login sur 401)

## ⚡ Phase 2 : Features manquantes
- [x] Modifier réservation dans MesReservations.jsx
- [x] Modifier utilisateur dans GestionUtilisateurs.jsx
- [x] Gérer 409 conflit dans NouvReservation.jsx
- [x] ModalConfirmation singleButton support
- [ ] useCalendrier.js hook

## 🎨 Phase 3 : Refactor & Polish
- [x] Refactor React.createElement → JSX (AdminDashboard, GestionSalles)
- [x] Utiliser StatCard, GraphiqueBarres, GraphiqueCamembert dans AdminDashboard
- [x] Appliquer page-fade-in globalement
- [ ] Créer Footer.jsx
- [ ] Créer SalleForm.jsx, ReservationForm.jsx, etc.
- [ ] Intégrer couleurs institutionnelles Rouge/Jaune
