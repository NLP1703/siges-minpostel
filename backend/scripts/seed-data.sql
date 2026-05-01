-- Script de restauration complète SIGES-MINPOSTEL
-- Après suppression manuelle des fichiers .ibd

USE siges_minpostel;

SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer les tables (les .ibd ont déjà été supprimés manuellement)
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS salles;
DROP TABLE IF EXISTS utilisateurs;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Étape 1 : Recréer la table utilisateurs
-- ============================================
CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telephone VARCHAR(20),
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Étape 2 : Recréer la table salles
-- ============================================
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

-- ============================================
-- Étape 3 : Recréer la table reservations
-- ============================================
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  salle_id INT NOT NULL,
  date DATE NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  objet VARCHAR(300) NOT NULL,
  nb_participants INT NOT NULL,
  equipements JSON,
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

-- ============================================
-- Étape 4 : Insérer l'administrateur
-- ============================================
-- Email    : admin@siges-minpostel.cm
-- Mot de passe : AdminMinpostel123

INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role)
VALUES (
  'Admin',
  'SIGES',
  'admin@siges-minpostel.cm',
  '$2a$12$vNcxEWL5kzp60FRQsA9L4OI6RzfRY8tVfq6.2PN/9mewiGMZvJVq2',
  'admin'
);

-- ============================================
-- Étape 5 : Insérer les salles avec photos
-- ============================================
INSERT INTO salles (nom, capacite, equipements, photo_url, actif) VALUES
('Salle de Reunion A - 10 places', 10, '["Videoprojecteur", "Climatisation", "Table ovale"]', 'https://th.bing.com/th/id/OIP.Hej1Kd46bZyVv-4O9g-UkgHaF5?w=203&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', TRUE),
('Salle de Reunion B - 20 places', 20, '["Videoprojecteur", "Climatisation", "Tableau blanc", "WiFi"]', 'https://tse2.mm.bing.net/th/id/OIP.YcHxTIFvScqTCWTWhx9f2QHaE8?rs=1&pid=ImgDetMain&o=7&rm=3', TRUE),
('Salle de Conference - 50 places', 50, '["Ecran geant", "Systeme audio", "Climatisation"]', 'https://tse2.mm.bing.net/th/id/OIP.Cfzln5ouT4ztFtOQhoLTAAHaEP?rs=1&pid=ImgDetMain&o=7&rm=3', TRUE),
('Salle Informelle - 5 places', 5, '["WiFi", "Canape"]', 'https://tse3.mm.bing.net/th/id/OIP.eMna-k4AmlEIOWQkqo2begHaFj?rs=1&pid=ImgDetMain&o=7&rm=3', TRUE);

SELECT 'Base de donnees restaurée avec succès !' AS Message;
SHOW TABLES;
