# 📋 CONTRATS D'API - SIGES-MINPOSTEL
## Documentation complète des endpoints pour l'équipe Frontend

**Date:** April 2026
**Stack:** Node.js/Express - MySQL - JWT
**Base URL:** `http://localhost:5000/api`
**Format:** JSON
**Authentification:** Bearer Token (JWT)

---

## 🔐 AUTHENTIFICATION

### POST /auth/register
**Description:** Créer un nouveau compte utilisateur
**Auth:** NON

**Request:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@minpostel.cm",
  "motDePasse": "SecurePass123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "userId": 123
}
```

**Erreurs:**
- 400: Champs manquants ou invalides
- 409: Email déjà utilisé

---

### POST /auth/login
**Description:** Se connecter et obtenir un JWT
**Auth:** NON

**Request:**
```json
{
  "email": "jean.dupont@minpostel.cm",
  "motDePasse": "SecurePass123"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@minpostel.cm",
    "role": "user"
  }
}
```

**JWT Payload (décodé):**
```json
{
  "id": 123,
  "email": "jean.dupont@minpostel.cm",
  "nom": "Dupont",
  "prenom": "Jean",
  "role": "user",
  "iat": 1687460000,
  "exp": 1687492000
}
```

**Propriétés:**
- `iat`: Timestamp émission (secondes depuis epoch)
- `exp`: Timestamp expiration (8h après)
- **Durée:** 8 heures

**Erreurs:**
- 401: Email ou mot de passe incorrect
- 403: Compte suspendu

---

### GET /auth/me
**Description:** Récupérer le profil de l'utilisateur connecté
**Auth:** ✅ REQUIS

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@minpostel.cm",
    "role": "user",
    "actif": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🏢 SALLES

### GET /salles
**Description:** Lister toutes les salles
**Auth:** ✅ REQUIS (tous rôles)

**Query Parameters (optionnels):**
- `actif=true|false` - Filtrer par activité
- `capacite_min=10` - Capacité minimale

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Salle de Réunion A - 10 places",
      "capacite": 10,
      "equipements": ["Vidéoprojecteur", "Climatisation", "Table ovale"],
      "photo_url": null,
      "actif": true,
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-10T08:00:00Z"
    },
    {
      "id": 2,
      "nom": "Salle de Conférence - 50 places",
      "capacite": 50,
      "equipements": ["Écran géant", "Système audio", "Climatisation"],
      "photo_url": null,
      "actif": true,
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-10T08:00:00Z"
    }
  ]
}
```

---

### GET /salles/:id
**Description:** Récupérer les détails d'une salle
**Auth:** ✅ REQUIS

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Salle de Réunion A - 10 places",
    "capacite": 10,
    "equipements": ["Vidéoprojecteur", "Climatisation", "Table ovale"],
    "photo_url": null,
    "actif": true,
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-10T08:00:00Z"
  }
}
```

**Erreurs:**
- 404: Salle non trouvée

---

### GET /salles/:id/disponibilites?date=YYYY-MM-DD
**Description:** Afficher les créneaux disponibles pour une salle à une date
**Auth:** ✅ REQUIS

**Query:**
```
GET /salles/1/disponibilites?date=2024-06-15
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "date": "2024-06-15",
    "salle_id": 1,
    "creneaux": [
      {
        "heure": "08:00",
        "statut": "libre",
        "disponible": true
      },
      {
        "heure": "09:00",
        "statut": "occupe",
        "disponible": false
      },
      {
        "heure": "10:00",
        "statut": "tampon",
        "disponible": false
      },
      {
        "heure": "11:00",
        "statut": "libre",
        "disponible": true
      },
      {
        "heure": "12:00",
        "statut": "libre",
        "disponible": true
      },
      {
        "heure": "13:00",
        "statut": "libre",
        "disponible": true
      },
      {
        "heure": "14:00",
        "statut": "libre",
        "disponible": true
      },
      {
        "heure": "15:00",
        "statut": "libre",
        "disponible": true
      },
      {
        "heure": "16:00",
        "statut": "libre",
        "disponible": true
      },
      {
        "heure": "17:00",
        "statut": "libre",
        "disponible": true
      }
    ],
    "resume": {
      "total": 10,
      "libres": 7,
      "occupes": 2,
      "tampons": 1
    }
  }
}
```

**Créneaux statuts:**
- `libre`: Créneau disponible pour réservation
- `occupe`: Créneau occupé par une réservation
- `tampon`: Zone tampon (30 min avant/après réservation) - non réservable

**Créneaux horaires:** 08:00, 09:00, ..., 17:00 (10 créneaux de 1h)

**Erreurs:**
- 400: Format date invalide
- 404: Salle non trouvée

---

### POST /salles (Admin uniquement)
**Description:** Créer une new salle
**Auth:** ✅ REQUIS (role: admin)

**Request:**
```json
{
  "nom": "Salle VIP",
  "capacite": 30,
  "equipements": ["Vidéoprojecteur", "Climatisation", "Système vidéoconférence"],
  "photo_url": "https://example.com/salle-vip.jpg"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Salle créée",
  "salle": {
    "id": 5,
    "nom": "Salle VIP",
    "capacite": 30,
    "equipements": ["Vidéoprojecteur", "Climatisation", "Système vidéoconférence"],
    "photo_url": "https://example.com/salle-vip.jpg",
    "actif": true,
    "created_at": "2024-06-15T14:30:00Z"
  }
}
```

**Erreurs:**
- 403: Rôle insuffisant (admin requis)

---

### PUT /salles/:id (Admin uniquement)
**Description:** Modifier une salle
**Auth:** ✅ REQUIS (role: admin)

**Request (champs partiels acceptés):**
```json
{
  "nom": "Salle VIP Rénovée",
  "capacite": 35
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Salle mise à jour",
  "salle": {
    "id": 5,
    "nom": "Salle VIP Rénovée",
    "capacite": 35,
    "equipements": ["Vidéoprojecteur", "Climatisation", "Système vidéoconférence"],
    "photo_url": "https://example.com/salle-vip.jpg",
    "actif": true,
    "updated_at": "2024-06-15T15:00:00Z"
  }
}
```

**Erreurs:**
- 404: Salle non trouvée
- 403: Rôle insuffisant

---

### DELETE /salles/:id (Admin uniquement)
**Description:** Supprimer une salle
**Auth:** ✅ REQUIS (role: admin)

**Response 200:**
```json
{
  "success": true,
  "message": "Salle supprimée"
}
```

**Erreurs:**
- 404: Salle non trouvée
- 409: Réservations futures validées existantes
- 403: Rôle insuffisant

**409 Response:**
```json
{
  "success": false,
  "message": "Impossible de supprimer une salle avec des réservations futures validées"
}
```

---

## 📅 RÉSERVATIONS

### GET /reservations
**Description:** Lister les réservations
**Auth:** ✅ REQUIS

**Logique:**
- **User** → retourne uniquement ses réservations
- **Admin** → retourne toutes les réservations

**Query Parameters:**
- `statut=en_attente|validee|refusee` - Filtrer par statut
- `date=YYYY-MM-DD` - Filtrer par date
- `salle_id=1` - Filtrer par salle
- `page=1` - Page actuelle (défaut: 1)
- `limit=10` - Éléments par page (défaut: 10)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "utilisateur_id": 123,
      "utilisateur_nom": "Dupont",
      "utilisateur_prenom": "Jean",
      "utilisateur_email": "jean.dupont@minpostel.cm",
      "salle_id": 1,
      "salle_nom": "Salle de Réunion A",
      "date": "2024-06-20",
      "heure_debut": "09:00",
      "heure_fin": "10:00",
      "objet": "Réunion d'équipe",
      "nb_participants": 8,
      "statut": "validee",
      "motif_refus": null,
      "created_at": "2024-06-15T10:00:00Z",
      "updated_at": "2024-06-16T14:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### POST /reservations
**Description:** Créer une réservation
**Auth:** ✅ REQUIS (user)

**Request:**
```json
{
  "salle_id": 1,
  "date": "2024-06-20",
  "heure_debut": "09:00",
  "heure_fin": "10:00",
  "objet": "Réunion d'équipe",
  "nb_participants": 8
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Réservation créée",
  "reservation": {
    "id": 101,
    "utilisateur_id": 123,
    "salle_id": 1,
    "date": "2024-06-20",
    "heure_debut": "09:00",
    "heure_fin": "10:00",
    "objet": "Réunion d'équipe",
    "nb_participants": 8,
    "statut": "en_attente",
    "created_at": "2024-06-15T10:00:00Z"
  }
}
```

**Validations:**
- Heure début < heure fin
- Date >= aujourd'hui
- nb_participants <= capacité salle
- Pas de conflit créneau

**Erreurs:**
- 400: Données invalides
- 409: Créneau indisponible

**409 Response (Conflit):**
```json
{
  "success": false,
  "message": "Créneau indisponible. Réservation existante de 09:00 à 10:30",
  "type": "CONFLICT",
  "conflit": {
    "reservation_id": 100,
    "heure_debut": "09:00",
    "heure_fin": "10:30",
    "objet": "Présentation",
    "message": "Créneau indisponible..."
  }
}
```

---

### PUT /reservations/:id/valider (Admin uniquement)
**Description:** Valider une réservation
**Auth:** ✅ REQUIS (role: admin)

**Request:** (vide)
```json
{}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Réservation validée",
  "reservation": {
    "id": 101,
    "statut": "validee",
    "updated_at": "2024-06-16T14:30:00Z"
  }
}
```

**Erreurs:**
- 404: Réservation non trouvée
- 400: Réservation n'est pas en attente

---

### PUT /reservations/:id/refuser (Admin uniquement)
**Description:** Refuser une réservation
**Auth:** ✅ REQUIS (role: admin)

**Request:**
```json
{
  "motif_refus": "La salle doit rester disponible pour maintenance"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Réservation refusée",
  "reservation": {
    "id": 101,
    "statut": "refusee",
    "motif_refus": "La salle doit rester disponible pour maintenance",
    "updated_at": "2024-06-16T14:35:00Z"
  }
}
```

**Validations:**
- motif_refus minimum 10 caractères

**Erreurs:**
- 404: Réservation non trouvée
- 400: Données invalides
- 400: Réservation n'est pas en attente

---

### DELETE /reservations/:id
**Description:** Annuler une réservation
**Auth:** ✅ REQUIS

**Restrictions:**
- **User** → peut annuler uniquement ses réservations en attente
- **Admin** → peut annuler n'importe quelle réservation en attente

**Response 200:**
```json
{
  "success": true,
  "message": "Réservation annulée"
}
```

**Erreurs:**
- 404: Réservation non trouvée
- 403: Accès refusé (propriété, ou réservation validée)

---

## 📊 DASHBOARD (Admin uniquement)

### GET /dashboard/stats
**Description:** Récupérer les statistiques du dashboard
**Auth:** ✅ REQUIS (role: admin)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reservations_aujourd_hui": 3,
    "en_attente": 5,
    "validees_ce_mois": 32,
    "refusees_ce_mois": 2,
    "taux_occupation_par_salle": [
      {
        "salle_id": 1,
        "nom": "Salle de Réunion A",
        "reservations_validees": 15,
        "taux": 32.5
      },
      {
        "salle_id": 2,
        "nom": "Salle de Conférence",
        "reservations_validees": 10,
        "taux": 21.7
      }
    ],
    "reservations_par_jour_7j": [
      {
        "date": "2024-06-10",
        "count": 2
      },
      {
        "date": "2024-06-11",
        "count": 5
      },
      {
        "date": "2024-06-12",
        "count": 3
      }
    ],
    "repartition_statuts": {
      "en_attente": 5,
      "validee": 32,
      "refusee": 2
    }
  }
}
```

---

## � UTILISATEURS (Admin uniquement)

### GET /users
**Description:** Récupérer tous les utilisateurs avec filtres et pagination
**Auth:** OUI (Admin uniquement)

**Query Parameters:**
- `role` (optionnel): 'user' ou 'admin'
- `actif` (optionnel): true/false
- `page` (optionnel): numéro de page (défaut: 1)
- `limit` (optionnel): nombre d'éléments par page (défaut: 50)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@minpostel.cm",
      "role": "user",
      "actif": true,
      "created_at": "2024-06-15T10:30:00Z",
      "updated_at": "2024-06-15T10:30:00Z"
    },
    {
      "id": 2,
      "nom": "Admin",
      "prenom": "SIGES",
      "email": "admin@siges-minpostel.cm",
      "role": "admin",
      "actif": true,
      "created_at": "2024-06-15T09:00:00Z",
      "updated_at": "2024-06-15T09:00:00Z"
    }
  ]
}
```

---

### GET /users/:id
**Description:** Récupérer un utilisateur spécifique
**Auth:** OUI (Admin uniquement)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@minpostel.cm",
    "role": "user",
    "actif": true,
    "created_at": "2024-06-15T10:30:00Z",
    "updated_at": "2024-06-15T10:30:00Z"
  }
}
```

**Erreurs:**
- 404: Utilisateur non trouvé

---

### PUT /users/:id
**Description:** Mettre à jour un utilisateur
**Auth:** OUI (Admin uniquement)

**Request:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean-Marie",
  "email": "jean-marie.dupont@minpostel.cm",
  "role": "admin",
  "actif": true
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Utilisateur mis à jour",
  "data": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean-Marie",
    "email": "jean-marie.dupont@minpostel.cm",
    "role": "admin",
    "actif": true,
    "created_at": "2024-06-15T10:30:00Z",
    "updated_at": "2024-06-15T11:45:00Z"
  }
}
```

**Erreurs:**
- 400: Données invalides ou tentative de suppression de ses propres droits admin
- 404: Utilisateur non trouvé

---

### PUT /users/:id/password
**Description:** Changer le mot de passe d'un utilisateur
**Auth:** OUI (Admin uniquement)

**Request:**
```json
{
  "newPassword": "NouveauMotDePasse123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Mot de passe mis à jour"
}
```

**Erreurs:**
- 400: Mot de passe trop court (< 8 caractères)
- 404: Utilisateur non trouvé

---

### DELETE /users/:id
**Description:** Supprimer un utilisateur
**Auth:** OUI (Admin uniquement)

**Response 200:**
```json
{
  "success": true,
  "message": "Utilisateur supprimé"
}
```

**Erreurs:**
- 400: Tentative de suppression de son propre compte
- 404: Utilisateur non trouvé

---

## �🔒 FORMATS ET CONVENTIONS

### Format des dates
- **Date:** `YYYY-MM-DD` (ISO 8601)
- Exemple: `2024-06-20`

### Format des heures
- **Heure:** `HH:MM` (24h)
- Créneau minimum: `08:00`
- Créneau maximum: `17:00`
- Heure fin maximale: `18:00`
- Exemple: `09:00`, `14:30`

### Format des timestamps
- **Timestamp:** ISO 8601 avec timezone
- Exemple: `2024-06-15T14:30:00Z`

### Codes HTTP utilisés
- `200` → Succès
- `201` → Créé
- `400` → Données invalides
- `401` → Non authentifié
- `403` → Accès refusé
- `404` → Non trouvé
- `409` → Conflit (créneau indisponible, email dupliqué)
- `500` → Erreur serveur

### Structure de réponse standard

**Succès:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Erreur:**
```json
{
  "success": false,
  "message": "Message d'erreur",
  "type": "ERROR_TYPE" (optionnel),
  "errors": [ { "field": "...", "message": "..." } ](optionnel)
}
```

---

## 📝 NOTES DE COORDINATION

1. **Stockage du JWT:** Utiliser `localStorage` ou `sessionStorage`
2. **Envoi du JWT:** Toujours dans header `Authorization: Bearer <token>`
3. **Expiration:** Token expire après 8 heures
4. **Refresh:** Pas de refresh token - utiliser `expires_in` pour relancer login
5. **Marge tampon:** 30 minutes avant/après chaque réservation
6. **Email admin:** Configurer dans `.env` pour notifications
7. **Validation côté frontend:** Recommandé pour meilleure UX
8. **CORS:** Configuré pour `http://localhost:3000` (modifiable en `.env`)

---

## 🧪 EXEMPLES COMPLETS

### Flux de réservation complet

```javascript
// 1. Login
POST /api/auth/login
{
  "email": "utilisateur@minpostel.cm",
  "motDePasse": "Password123"
}
→ Response: token, user info

// 2. Consulter salles
GET /api/salles
→ Response: liste des salles

// 3. Vérifier disponibilités
GET /api/salles/1/disponibilites?date=2024-06-20
→ Response: créneaux libres, occupés, tampons

// 4. Créer réservation
POST /api/reservations
{
  "salle_id": 1,
  "date": "2024-06-20",
  "heure_debut": "09:00",
  "heure_fin": "10:00",
  "objet": "Réunion",
  "nb_participants": 5
}
→ Response: réservation créée (statut: en_attente)

// 5. Admin valide
PUT /api/reservations/101/valider
→ Response: réservation validée + notification email
```

---

**Version:** 1.0.0
**Dernière mise à jour:** 2024-06-15
