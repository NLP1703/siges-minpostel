<<<<<<< HEAD
#  SIGES-MINPOSTEL - Projet Complet
=======
 SIGES-MINPOSTEL 
>>>>>>> 99a32619773915d6bf1824462540513c8865217a

 Résumé du projet

**SIGES-MINPOSTEL** est une plateforme web de **réservation de salles de réunion** pour le **Ministère des Postes et Télécommunications du Cameroun**.

###  Objectifs

- ✅ Centraliser la gestion des salles de réunion
- ✅ Automatiser le processus de réservation
- ✅ Permettre aux utilisateurs de consulter les disponibilités en temps réel
- ✅ Donner aux administrateurs une vue d'ensemble et un tableau de bord
- ✅ Envoyer des notifications automatiques par email

---

<<<<<<< HEAD
##  Structure du Projet
=======
## Structure du Projet
>>>>>>> 99a32619773915d6bf1824462540513c8865217a

```
SIGES-MINPOSTEL/
├── .github/
│   └── agents/
<<<<<<< HEAD
│       ├── backend-architect.agent.md       # Agent Backend
=======
│       ├── backend-architect.agent.md       #  Agent Backend
>>>>>>> 99a32619773915d6bf1824462540513c8865217a
│       └── frontend-developer.agent.md      #  Agent Frontend
├── backend/                                  # ←  VOUS ÊTES ICI
│   ├── config/                    # Configuration (DB, JWT)
│   ├── controllers/               # Logique métier
│   ├── middlewares/               # Auth, validation, rôles
│   ├── models/                    # Accès BD (Utilisateur, Salle, Réservation)
│   ├── routes/                    # Endpoints API
│   ├── services/                  # Services (CreneauService ⭐, Notifications)
│   ├── scripts/                   # init-db.sql
│   ├── utils/                     # Gestion erreurs
│   ├── app.js                     # Application Express
│   ├── server.js                  # Serveur principal
│   ├── package.json               # Dépendances
│   ├── .env.example               # Template env
│   ├── .gitignore
│   └── README.md                  #  Guide démarrage backend
│
├── frontend/                                  # À CRÉER
│   ├── src/
│   │   ├── pages/                 # Pages (Login, Dashboard, Réservations...)
│   │   ├── components/            # Composants réutilisables
│   │   ├── services/              # Appels API
│   │   ├── utils/                 # Helpers
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── API-CONTRACTS.md               #  Contrats JSON complets
├── SYNC-FRONTEND-BACKEND.md       #  Checklist coordination
└── README.md                      #  Guide projet global
```

---

## ✅ État d'implémentation

### Backend - 100% COMPLÉTÉ ✅

**Authentification & Utilisateurs:**
- ✅ Register avec validations
- ✅ Login JWT (8h d'expiration)
- ✅ Profil utilisateur (/me)
- ✅ Hachage bcryptjs (12 rounds)
- ✅ Rôles: user, admin

**Gestion des Salles:**
- ✅ Créer, lire, modifier, supprimer salles
- ✅ Filtres: actif, capacite_min
- ✅ Équipements (JSON)

**Créneaux & Disponibilités:**
- ✅ Créneaux: 08:00 à 17:00 (1h chacun) ⭐
- ✅ Marge tampon: 30 min avant/après
- ✅ States: libre, occupe, tampon
- ✅ Vérification de conflit avancée

**Réservations:**
- ✅ Créer réservation
- ✅ Valider (admin)
- ✅ Refuser avec motif (admin)
- ✅ Annuler (user, si en_attente)

**Admin Dashboard:**
- ✅ Stats: aujourd'hui, mois, taux
- ✅ Graphiques: occupation, tendances

**Infrastructure:**
- ✅ MySQL avec pool connections
- ✅ Express.js app.js structure
- ✅ Middlewares: auth, roles, validate
- ✅ Rate limiting: 10 req/15min auth
- ✅ CORS configurable
- ✅ Helmet pour sécurité
- ✅ Error handling centralisé
- ✅ Nodemailer notifications

---

### Frontend - À CRÉER 

**Pages à implémenter:**
- [ ] Login / Register
- [ ] Dashboard User (mes réservations)
- [ ] Catalogue Salles
- [ ] Détail Salle + Disponibilités
- [ ] Formulaire Réservation
- [ ] Dashboard Admin (stats, lister, valider)
- [ ] Gestion Salles (admin)

---

##  Démarrage Rapide

### Backend

```bash
# 1. Installation
cd backend
npm install

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos paramètres MySQL

# 3. Initialiser la base de données
mysql -u root -p < scripts/init-db.sql

# 4. Démarrer
npm run dev
#  Serveur SIGES-MINPOSTEL démarré sur le port 5000
```

### Frontend (À faire)

```bash
# À créer avec React ou Vue.js
cd frontend
npm install

npm run dev
# http://localhost:3000
```

---

##  Documentation

| Document | Contenu |
|----------|---------|
| [`API-CONTRACTS.md`](./API-CONTRACTS.md) |  Contrats JSON complets -  |
| [`SYNC-FRONTEND-BACKEND.md`](./SYNC-FRONTEND-BACKEND.md) | Checklist coordination et points clés |
| [`backend/README.md`](./backend/README.md) |  Guide complet du backend |
| [`backend/scripts/init-db.sql`](./backend/scripts/init-db.sql) | Schema MySQL |

---

##  Données de test

### Admin par défaut
- **Email:** `admin@siges-minpostel.cm`
- **Password:** `AdminMinpostel123`
- **Rôle:** admin

### Salles de test
- Salle de Réunion A - 10 places
- Salle de Réunion B - 20 places
- Salle de Conférence - 50 places
- Salle Informelle - 5 places

---

##  Architecture Backend Détaillée

### Models (Accès BD)
```javascript
Utilisateur.js
├── creer()
├── findByEmail()
├── findById()
├── verifierMotDePasse()
└── findAllAdmins()

Salle.js
├── creer()
├── findById()
├── findAll()
├── update()
├── delete()
└── hasActiveReservations()

Reservation.js
├── creer()
├── findById()
├── findAll()
├── updateStatut()
└── delete()
```

### Controllers (Logique métier)
```javascript
authController.js:
├── register → POST /api/auth/register
├── login   → POST /api/auth/login
└── me      → GET /api/auth/me

salleController.js:
├── getAll              → GET /api/salles
├── getById             → GET /api/salles/:id
├── create              → POST /api/salles (admin)
├── update              → PUT /api/salles/:id (admin)
├── delete              → DELETE /api/salles/:id (admin)
└── getDisponibilites   → GET /api/salles/:id/disponibilites

reservationController.js:
├── getAll              → GET /api/reservations
├── create              → POST /api/reservations
├── valider             → PUT /api/reservations/:id/valider (admin)
├── refuser             → PUT /api/reservations/:id/refuser (admin)
└── supprimer           → DELETE /api/reservations/:id

dashboardController.js:
└── getStats            → GET /api/dashboard/stats (admin)
```

### Services (Logique métier avancée)
```javascript
creneauService.js 
├── getHeuresBase()              # 08:00-17:00
├── heureToMinutes()             # Conversion
├── minutesToHeure()
├── verifierDisponibilite()      # Vérif de conflit
├── getCreneauxDisponibles()     # Affichage libres/occupe/tampon
└── validerParametresReservation()

notificationService.js
├── notifierNouvelleReservation()
├── notifierValidationReservation()
├── notifierRefusReservation()
└── testConnection()
```

---

##  Logique métier clé: CreneauService

### Créneaux horaires
- **Base:** 08:00, 09:00, 10:00, ..., 17:00 (10 créneaux)
- **Fin max:** 18:00
- **Marge tampon:** 30 minutes ➜ Obligatoire avant/après chaque réservation

### Exemple
```
Réservation existante: 09:00 - 10:00

Plage bloquée: [08:30, 10:30]
  ├─ 08:30 - 09:00  = tampon avant
  ├─ 09:00 - 10:00  = occupé
  └─ 10:00 - 10:30  = tampon après

Créneaux invalides:
   08:00 - 09:00  (chevauchement tampon)
   09:00 - 10:00  (occupé)
   10:00 - 11:00  (chevauchement tampon)

Créneaux valides:
  ✅ 10:30 - 11:30  (juste après tampon)
  ✅ 11:00 - 12:00  (aprèse)
  ✅ 08:00 - 09:00  (... FAUX! C'est dans le tampon avant)
```

---

##  Stack Technique

### Backend
```
Node.js 18+
├── Express.js 4.18       # Framework web
├── MySQL2               # Driver MySQL
├── jwt                  # JSON Web Tokens
├── bcryptjs             # Hachage passwords
├── nodemailer           # Emails
├── express-validator    # Validation
└── helmet/cors          # Sécurité
```

### Frontend 
```
React 18+ ou Vue 3+
├── Axios/Fetch API      # HTTP client
├── React Context/Zustand/Vuex  # State management
├── Tailwind/Material UI # CSS
├── React Router         # Routing
└── Luxon/date-fns       # Dates
```

---

<<<<<<< HEAD
##  Endpoints API 
=======
## Endpoints API (Résumé)
>>>>>>> 99a32619773915d6bf1824462540513c8865217a

| Méthode | Endpoint | Auth | Rôle | Status |
|---------|----------|------|------|--------|
| POST | `/api/auth/register` | ❌ | - | ✅ |
| POST | `/api/auth/login` | ❌ | - | ✅ |
| GET | `/api/auth/me` | ✅ | any | ✅ |
| GET | `/api/salles` | ✅ | any | ✅ |
| GET | `/api/salles/:id/disponibilites` | ✅ | any | ✅ |
| POST | `/api/salles` | ✅ | admin | ✅ |
| GET | `/api/reservations` | ✅ | any | ✅ |
| POST | `/api/reservations` | ✅ | user | ✅ |
| PUT | `/api/reservations/:id/valider` | ✅ | admin | ✅ |
| PUT | `/api/reservations/:id/refuser` | ✅ | admin | ✅ |
| DELETE | `/api/reservations/:id` | ✅ | own | ✅ |
| GET | `/api/dashboard/stats` | ✅ | admin | ✅ |

---

##  Points de sécurité

- [x] Passwords bcryptjs (12 rounds)
- [x] JWT 8h expiration
- [x] Rate limiting auth (10/15min)
- [x] CORS limité
- [x] Helmet headers
- [x] SQL injection: paramètres mysql2
- [x] Validation express-validator
- [x] Contrôle permissions (`checkRole`)
- [x] Vérification propriété réservations

---

##  Notes pour le Frontend

### AVANT DE COMMENCER

1. **Lire** [`API-CONTRACTS.md`](./API-CONTRACTS.md) COMPLÈTEMENT
2. **Tester** chaque endpoint avec Postman/curl
3. **Valider** les formats JSON
4. **Notifier** le team backend une fois prêt

### Points clés

- Format JWT: `Authorization: Bearer <token>`
- Dates: `YYYY-MM-DD`
- Heures: `HH:MM` (24h)
- Marge: 30 min! (impossible d'oublier)
- Erreur 409 sur conflit créneau (cas spécial)

---
<<<<<<< HEAD
=======

>>>>>>> 99a32619773915d6bf1824462540513c8865217a
##  Prochaines étapes

### Phase 1: Frontend Basic
- [ ] Setup React/Vue
- [ ] Pages login/register
- [ ] Authentification JWT
- [ ] Liste salles
- [ ] Créer réservation

### Phase 2: Frontend Admin
- [ ] Dashboard admin
- [ ] Valider/refuser réservations
- [ ] Gestion salles
- [ ] Stats et graphiques

### Phase 3: Améliorations
- [ ] Tests unitaires backend
- [ ] Tests E2E
- [ ] Déploiement Azure/AWS
- [ ] Performance optimization
- [ ] i18n Français/Anglais

---

##  Support

- **Docs:** Ce README + [`API-CONTRACTS.md`](./API-CONTRACTS.md) + [`backend/README.md`](./backend/README.md)
- **Tests:** Postman collection à créer
- **Issues:** GitHub Issues

---

##  License

MIT License - Libre d'utilisation

---

**Projet:** SIGES-MINPOSTEL  
**Client:** Ministère des Postes et Télécommunications (Cameroun)  
**Date:** April 2026  
**Version:** 1.0.0 (Backend complété)  
**Statut:**  **Backend 100% prêt - Frontend en development**

---

** Backend SIGES-MINPOSTEL complet et prêt pour le frontend!**
