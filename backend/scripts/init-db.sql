-- scripts/init-db.sql
-- Script d'initialisation de la base de donnees SIGES-MINPOSTEL

-- Creer la base de donnees
CREATE DATABASE IF NOT EXISTS siges_minpostel
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE siges_minpostel;

-- Table utilisateurs
CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table salles
CREATE TABLE salles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  capacite INT NOT NULL,
  equipements JSON,
  photo_url VARCHAR(500),
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_actif (actif),
  INDEX idx_capacite (capacite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table reservations
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  salle_id INT NOT NULL,
  date DATE NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  objet VARCHAR(300) NOT NULL,
  nb_participants INT NOT NULL,
  statut ENUM('en_attente', 'validee', 'refusee') DEFAULT 'en_attente',
  motif_refus TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (salle_id) REFERENCES salles(id) ON DELETE CASCADE,
  INDEX idx_salle_date (salle_id, date),
  INDEX idx_user (utilisateur_id),
  INDEX idx_statut (statut),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserer un administrateur par defaut (passwd: AdminMinpostel123)
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role)
VALUES (
  'Admin',
  'SIGES',
  'admin@siges-minpostel.cm',
  '$2a$12$vNcxEWL5kzp60FRQsA9L4OI6RzfRY8tVfq6.2PN/9mewiGMZvJVq2',
  'admin'
);

-- Inserer quelques salles de test
INSERT INTO salles (nom, capacite, equipements, photo_url) VALUES
('Salle de Reunion A - 10 places', 10, '["Videoprojecteur", "Climatisation", "Table ovale"]', NULL),
('Salle de Reunion B - 20 places', 20, '["Videoprojecteur", "Climatisation", "Tableau blanc", "WiFi"]', NULL),
('Salle de Conference - 50 places', 50, '["Ecran geant", "Systeme audio", "Climatisation"]', NULL),
('Salle Informelle - 5 places', 5, '["WiFi", "Canape"]', NULL);

-- Afficher les tables creees
SELECT 'Base de donnees initialisee avec succes !' as Message;
SHOW TABLES;

