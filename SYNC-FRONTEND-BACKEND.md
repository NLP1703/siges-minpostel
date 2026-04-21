# 🔄 SYNCHRONISATION BACKEND-FRONTEND

## ✅ Backend - État d'implémentation

### Complétement implémenté ✅

- [x] **Configuration MySQL** (pool connection)
- [x] **Authentification JWT** (8h expiry, 12-round bcrypt)
- [x] **Gestion des utilisateurs** (register, login, me)
- [x] **Gestion des salles** (CRUD + disponibilités)
- [x] **Logique des créneaux** (marge tampon 30 min, statuts libre/occupe/tampon)
- [x] **Gestion des réservations** (create, validate, refuse, delete)
- [x] **Dashboard stats** (admin uniquement)
- [x] **Validation des données** (express-validator)
- [x] **Gestion des erreurs centralisée** (ApiError class)
- [x] **Rate limiting** (10 req/15min sur auth)
- [x] **CORS configuré** (configurable en .env)
- [x] **Helmet** (sécurité headers)
- [x] **Notifications email** (Nodemailer)
- [x] **Middlewares d'authenticat** (auth, role, validate)
- [x] **Tous les endpoints** selon spec

### À faire côté backend (optionnel avancé)

- [ ] Tester les créneaux avec des scénarios complexes
- [ ] Mettre en place les logs (winston)
- [ ] Tester la performance (stress test)
- [ ] Ajouter les timestamps updated_at automatiques
- [ ] Soft delete sur les salles

---

## 📋 Checklist Frontend

### Avant de commencer (REQUIS)

- [ ] **Lire** [`API-CONTRACTS.md`](../API-CONTRACTS.md) en détail
- [ ] **Tester** tous les endpoints avec Postman/curl
- [ ] **Valider** les formats de réponse JSON
- [ ] **Configurer** FRONTEND_URL dans `.env` backend
- [ ] **Démarrer** le backend (`npm run dev`)

### À implémenter - Authentification

- [ ] **Register form:** nom, prenom, email, mot_de_passe
  - Validation: password force (min 8, majuscules, minuscules, chiffres)
  - Error handling: email déjà utilisé (409)
  
- [ ] **Login form:** email, password
  - Stocker token en localStorage/sessionStorage
  - Redirection après succès
  - Error handling: mauvais identifiants (401)
  
- [ ] **Protected routes**
  - Vérifier présence du token au démarrage
  - Rediriger vers login si absent/expiré
  
- [ ] **Logout**
  - Supprimer le token
  - Rediriger vers login

### À implémenter - Salles

- [ ] **Liste des salles** (GET /api/salles)
  - Affichage en cards/grid
  - Filtres optionnels: `capacite_min`, `actif`
  - Clic sur salle → détail
  
- [ ] **Détail salle** (GET /api/salles/:id)
  - Afficher tous les équipements
  - Lien vers réservations
  
- [ ] **Vérifier disponibilités** (GET /api/salles/:id/disponibilites?date=YYYY-MM-DD)
  - **Affichage calendar/timeline**
  - Créneaux: `libre` (vert), `occupe` (rouge), `tampon` (gris/disabled)
  - Sélectionner un créneau libre pour réserver
  - Afficher le résumé: X libres, Y occupés, Z tampons

### À implémenter - Réservations

- [ ] **Formulaire de réservation**
  - Champs: salle, date, heure_debut, heure_fin, objet, nb_participants
  - Valider avant envoi
  - Gérer erreur 409 (conflit créneau) avec message clair
  
- [ ] **Liste mes réservations** (GET /api/reservations)
  - Filtrer par statut: en_attente, validee, refusee
  - Afficher le statut avec couleurs
  - Actions: voir détail, annuler (si en_attente)
  
- [ ] **Annuler réservation** (DELETE /api/reservations/:id)
  - Confirmation avant suppression
  - Impossible si statut = validee
  - Message de succès
  
- [ ] **Historique réservations**
  - Paginer avec limit/page
  - Trier par date

### À implémenter - Admin Dashboard (Admin uniquement)

- [ ] **Vue admin** (accessible si role === 'admin')
  - Réservations aujourd'hui
  - En attente: afficher liste avec actions
  - Validées ce mois: statistique
  - Refusées ce mois: statistique
  
- [ ] **Liste réservations en attente** (GET /api/reservations?statut=en_attente)
  - Afficher: utilisateur, salle, date, heure, objet, nb_participants
  - Actions: Valider / Refuser
  
- [ ] **Valider réservation** (PUT /api/reservations/:id/valider)
  - Confirmation
  - Message de succès + notification email utilisateur (côté backend)
  - Rafraîchir la liste
  
- [ ] **Refuser réservation** (PUT /api/reservations/:id/refuser)
  - Modal avec champ motif_refus (min 10 car)
  - Confirmation
  - Message de succès + notification email utilisateur
  - Rafraîchir la liste
  
- [ ] **Statistiques dashboard** (GET /api/dashboard/stats)
  - KPI: réservations aujourd'hui, en attente, validées mois, refusées mois
  - Graphique: taux occupation par salle
  - Graphique: réservations par jour (7j)
  - Graphique: répartition statuts (pie chart)

### À implémenter - Gestion Salles (Admin uniquement)

- [ ] **Créer salle** (POST /api/salles)
  - Formulaire: nom, capacite, equipements (multi), photo_url
  
- [ ] **Modifier salle** (PUT /api/salles/:id)
  - Formulaire pré-rempli
  
- [ ] **Supprimer salle** (DELETE /api/salles/:id)
  - Confirmation
  - Erreur si réservations futures existantes

### À implémenter - Gestion Utilisateurs (Admin uniquement)

- [ ] **Liste utilisateurs** (GET /api/users)
  - Filtres: role (user/admin), actif (true/false)
  - Colonnes: nom, prenom, email, role, actif, created_at
  - Actions: modifier, changer mot de passe, supprimer
  
- [ ] **Modifier utilisateur** (PUT /api/users/:id)
  - Formulaire: nom, prenom, email, role, actif
  - Validation: email unique, pas supprimer ses propres droits admin
  
- [ ] **Changer mot de passe** (PUT /api/users/:id/password)
  - Champ nouveau mot de passe (min 8 car)
  - Confirmation
  
- [ ] **Supprimer utilisateur** (DELETE /api/users/:id)
  - Confirmation
  - Erreur si suppression de son propre compte

---

## 🔑 Points clés à respecter

### Authentification
```javascript
// ✅ Format du header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// ❌ Format invalide
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Bearer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Durée: 8 heures
// Propriétés du payload: id, email, nom, prenom, role, iat, exp
```

### Dates et Heures
```javascript
// Dates: ISO 8601 format
"date": "2024-06-20"

// Heures: HH:MM 24h
"heure_debut": "09:00"
"heure_fin": "10:00"

// Timestamps ISO avec timezone
"created_at": "2024-06-15T14:30:00Z"
```

### Gestion des erreurs
```javascript
// 400: Données invalides
{
  "success": false,
  "message": "Données invalides",
  "errors": [
    { "field": "email", "message": "Email invalide" },
    { "field": "motDePasse", "message": "Min 8 caractères" }
  ]
}

// 409: Conflit créneau (SPÉCIFIQUE)
{
  "success": false,
  "message": "Créneau indisponible...",
  "type": "CONFLICT",
  "conflit": {
    "reservation_id": 100,
    "heure_debut": "09:00",
    "heure_fin": "10:30"
  }
}

// 401: Non authentifié
{ "success": false, "message": "Token expiré", "type": "TOKEN_EXPIRED" }

// 403: Accès refusé
{ "success": false, "message": "Accès refusé", "type": "INSUFFICIENT_ROLE" }
```

### Créneaux disponibilités
```javascript
// Format exact du tableau retourné
"creneaux": [
  {
    "heure": "08:00",
    "statut": "libre",      // ou "occupe" ou "tampon"
    "disponible": true      // true ssi statut === "libre"
  },
  {
    "heure": "09:00",
    "statut": "occupe",
    "disponible": false
  },
  {
    "heure": "10:00",
    "statut": "tampon",     // 30 min après fin réservation
    "disponible": false
  }
]

// 10 créneaux totaux (08:00 à 17:00)
```

### Réservations - États possibles
```
statut:
  - "en_attente"  → en attente validation admin
  - "validee"     → approuvé, ne peut pas être annulée par user
  - "refusee"     → rejetée + motif_refus
```

---

## 🧪 Scénarios de test recommandés

### Test 1: Création et validation complète
```
1. Register utilisateur test
2. Login
3. Récupérer salles
4. Vérifier disponibilités jour X
5. Créer réservation créneau libre
6. Admin valide
7. Vérifier email utilisateur (si SMTP configuré)
```

### Test 2: Conflit créneau
```
1. Admin crée réservation 09:00-10:00 salle 1
2. User tente 08:30-09:00 → ❌ (tampon avant)
3. User tente 10:00-11:00 → ❌ (tampon après)
4. User tente 11:00-12:00 → ✅ (30 min après fin)
```

### Test 3: Permissions admin/user
```
1. User essaye POST /api/salles → 403 (pas admin)
2. User essaye PUT /api/reservations/:id/valider → 403
3. Admin peut faire les deux ✅
```

### Test 4: Pagination
```
GET /api/reservations?page=2&limit=10
→ Retour page 2 avec LIMIT 10
```

---

## 🚨 Points d'attention

1. **JWT Token Storage**
   - Ne JAMAIS stocker dans localStorage en https (utiliser secure cookies)
   - À considérer pour une vraie app

2. **Marge tampon = 30 minutes**
   - Après fin réservation: 30 min d'attente obligatoire
   - Avant début réservation: 30 min d'attente obligatoire

3. **Créneaux fixes**
   - Uniquement 08:00 à 17:00 (1h chacun)
   - Utilisateur ne peut pas spécifier durée arbitraire (backend l'accepte)

4. **Rate limiting**
   - 10 tentatives / 15 min sur `/api/auth/*`
   - Implémenter un message "Trop de tentatives" côté frontend

5. **CORS**
   - Backend accepte uniquement FRONTEND_URL (défaut: http://localhost:3000)
   - Si frontend sur autre port → ajuster .env backend

6. **Email notifications (optionnel pour dev)**
   - Peuvent ne pas être configurées en dev
   - Frontend n'a pas besoin de les attendre

---

## 📞 Communication Backend-Frontend

### Avant de coder
- [ ] Frontend rejoint les réunions backend weekly
- [ ] Slack/Discord channel dédié pour sync
- [ ] Checklist partagée des features

### Pendant le développement
- [ ] Chaque endpoint testé avec Postman avant utilisation
- [ ] Slack notification: "Endpoint X prêt, test en cours"
- [ ] Issues GitHub pour les bugs

### Déploiement
- [ ] Tester en staging (même serveur API)
- [ ] Admin valide les workflows complets
- [ ] Release coordonnée backend + frontend

---

## 🔗 Ressources

- **API Contracts:** [`API-CONTRACTS.md`](../API-CONTRACTS.md)
- **Backend README:** [`backend/README.md`](./README.md)
- **Database Schema:** [`backend/scripts/init-db.sql`](./scripts/init-db.sql)
- **Postman Collection:** (À créer by frontend - import API-CONTRACTS)

---

**Dernière mise à jour: April 2026**
**Statut: ✅ Backend 100% implémenté, prêt pour frontend**
