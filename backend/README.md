# 🏗️ SIGES-MINPOSTEL Backend API

**API REST complète de réservation de salles pour le MINPOSTEL (Cameroun)**

## 📋 Stack Technique

- **Runtime:** Node.js v18+
- **Framework:** Express.js 4.18
- **Base de données:** MySQL 8.0+
- **Authentification:** JWT (JsonWebToken)
- **Hash:** bcryptjs
- **ORM:** mysql2 (promesses natives)
- **Mailing:** Nodemailer

## 🚀 Installation

### 1. Prérequis
```bash
# Node.js v18+
node --version

# MySQL 8.0+
mysql --version

# Clone du repository
cd backend
```

### 2. Installation des dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# ⚠️ Éditer .env avec vos paramètres :
# - DB_HOST, DB_USER, DB_PASS
# - JWT_SECRET (min 64 caractères)
# - SMTP_* pour les emails
# - FRONTEND_URL pour CORS
```

### 4. Initialisation de la base de données
```bash
# Se connecter à MySQL
mysql -u root -p

# Exécuter le script
mysql -u root -p siges_minpostel < scripts/init-db.sql

# Ou importer via UI MySQL
```

### 5. Démarrage du serveur
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

**✅ Output attendu:**
```
🚀 Serveur SIGES-MINPOSTEL démarré sur le port 5000
📍 Environment: development
📚 Documentation API:
   POST   /api/auth/register        - Créer un compte
   ...
```

## 📚 Documentation API

La documentation complète des endpoints est disponible dans [`API-CONTRACTS.md`](../API-CONTRACTS.md)

### Quick Reference

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Créer un compte | ❌ |
| POST | `/api/auth/login` | Se connecter | ❌ |
| GET | `/api/auth/me` | Profil utilisateur | ✅ |
| GET | `/api/salles` | Lister les salles | ✅ |
| GET | `/api/salles/:id/disponibilites` | Créneaux disponibles | ✅ |
| POST | `/api/salles` | Créer salle | ✅ (admin) |
| GET | `/api/reservations` | Lister réservations | ✅ |
| POST | `/api/reservations` | Créer réservation | ✅ |
| PUT | `/api/reservations/:id/valider` | Valider | ✅ (admin) |
| PUT | `/api/reservations/:id/refuser` | Refuser | ✅ (admin) |
| DELETE | `/api/reservations/:id` | Annuler | ✅ |
| GET | `/api/dashboard/stats` | Stats | ✅ (admin) |

## 🔐 Authentification

### JWT (JsonWebToken)

1. **Login** → Récupérer le token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@siges-minpostel.cm","motDePasse":"AdminMinpostel123"}'
```

2. **Utiliser le token** → Header `Authorization`
```bash
curl -X GET http://localhost:5000/api/salles \
  -H "Authorization: Bearer <votre_token>"
```

3. **Durée:** 8 heures

### Admins par défaut
- **Email:** `admin@siges-minpostel.cm`
- **Mot de passe:** `AdminMinpostel123`
- ⚠️ **À changer en production!**

## 🏗️ Architecture du projet

```
backend/
├── config/
│   ├── db.js                 # Pool MySQL
│   └── jwt.js                # Config JWT
├── controllers/
│   ├── authController.js     # Authentification
│   ├── salleController.js    # Gestion salles
│   ├── reservationController.js  # Gestion réservations
│   └── dashboardController.js    # Stats admin
├── middlewares/
│   ├── authMiddleware.js     # Vérif. JWT
│   ├── roleMiddleware.js     # Contrôle rôles
│   └── validateMiddleware.js # Validation données
├── models/
│   ├── Utilisateur.js        # Opérations users
│   ├── Salle.js              # Opérations salles
│   └── Reservation.js        # Opérations réservations
├── routes/
│   ├── authRoutes.js
│   ├── salleRoutes.js
│   ├── reservationRoutes.js
│   └── dashboardRoutes.js
├── services/
│   ├── creneauService.js     # 🔴 LOGIQUE CRITIQUE créneaux
│   └── notificationService.js # Emails
├── utils/
│   └── errorHandler.js       # Gestion erreurs
├── scripts/
│   └── init-db.sql           # Init base de données
├── app.js                    # Application Express
├── server.js                 # Entrypoint
├── package.json
└── .env.example
```

## 🧠 Logique Métier Critique

### CreneauService

**Créneaux horaires:**
- Base: 08:00 - 17:00 (tranches de 1h)
- Max fin: 18:00

**Marge tampon:** 30 minutes obligatoire avant/après chaque réservation

**Algorithme de vérification (verifierDisponibilite):**
```
1. Récupérer réservations existantes (statut: en_attente, validée)
2. Pour chaque réservation:
   - Calculer plage bloquée = [debut - 30min, fin + 30min]
   - Vérifier chevauchement avec nouvelle réservation
   - Si conflit → retourner {disponible: false}
3. Si aucun conflit → retourner {disponible: true}
```

**Statuts de créneaux:**
- `libre`: Disponible
- `occupe`: Réservation existante
- `tampon`: Zone tampon (non réservable)

## 📧 Notifications Email

Événements configurés:
1. **Nouvelle réservation** → Email admin
2. **Réservation validée** → Email utilisateur
3. **Réservation refusée** → Email utilisateur + motif

**Configuration SMTP (`.env`):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@siges-minpostel.cm
```

**Test:**
```bash
# Logs au démarrage
✅ Service de notifications configuré
```

## 🧪 Tests

### Tester manuellement avec curl

**1. Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Test",
    "prenom":"User",
    "email":"test@siges.cm",
    "motDePasse":"TestPass123"
  }'
```

**2. Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@siges-minpostel.cm",
    "motDePasse":"AdminMinpostel123"
  }'
```

**3. Lister salles (avec token)**
```bash
curl -X GET http://localhost:5000/api/salles \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**4. Créer réservation**
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "salle_id":1,
    "date":"2024-06-20",
    "heure_debut":"09:00",
    "heure_fin":"10:00",
    "objet":"Réunion",
    "nb_participants":5
  }'
```

## 🐛 Troubleshooting

### Erreur de connexion MySQL
```
❌ Connexion MySQL établie avec succès
```

**Solutions:**
- Vérifier que MySQL est démarré
- Vérifier les credentials dans `.env`
- Vérifier que la base existe (`siges_minpostel`)

### Token invalide
```
401: Token invalide
```

**Solutions:**
- Vérifier le format: `Authorization: Bearer <token>`
- Vérifier l'expiration (8h)
- Vérifier que `JWT_SECRET` est correct

### Erreur SMTP
```
⚠️ Service de notifications non opérationnel
```

**Solutions:**
- Vérifier les paramètres SMTP dans `.env`
- Gmail: utiliser un "App Password", pas le mot de passe compte
- Tester avec `telnet smtp.gmail.com 587`

## 🔄 Variables d'environnement

```env
# ========== DATABASE ==========
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=siges_minpostel
DB_PORT=3306

# ========== JWT ==========
JWT_SECRET=your_very_long_secret_key_minimum_64_characters
JWT_EXPIRY=8h

# ========== SERVER ==========
PORT=5000
NODE_ENV=development

# ========== FRONTEND ==========
FRONTEND_URL=http://localhost:3000

# ========== EMAIL ==========
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@siges-minpostel.cm

# ========== RATE LIMITING ==========
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

## 📊 Statistiques attendues

Après un démarrage réussi:
- ✅ Connexion MySQL établie
- ✅ Configuration SMTP validée
- ✅ 4 salles créées par défaut
- ✅ 1 administrator créé

## 🤝 Coordination Frontend

**Avant que le frontend commence:**
1. ✅ Consulter [`API-CONTRACTS.md`](../API-CONTRACTS.md)
2. ✅ Tester les endpoints avec Postman/curl
3. ✅ Confirmer les formats JSON et codes HTTP
4. ✅ Configurer les headers d'authenticatio

## 📞 Support & Contribution

- **Issues:** Signal les bugs via GitHub Issues
- **Documentation:** Mise à jour dans ce README
- **Tests:** Ajouter des tests Jest pour les nouvelles features

---

**Développé pour MINPOSTEL - Gestion des Salles de Réunion**
**Last updated: April 2026**
