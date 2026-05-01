-- Script pour nettoyer les URLs de photos invalides dans la base de données
-- À exécuter dans PhpMyAdmin (onglet SQL)

USE siges_minpostel;

-- Afficher les URLs actuelles avant nettoyage
SELECT id, nom, photo_url FROM salles;

-- Nettoyer les URLs invalides (data:image, URLs malformées, etc.)
UPDATE salles 
SET photo_url = NULL 
WHERE photo_url IS NOT NULL 
AND (
    photo_url LIKE 'data:%' 
    OR photo_url NOT LIKE 'http://%' 
    AND photo_url NOT LIKE 'https://%'
    OR photo_url = ''
);

-- Vérifier le résultat après nettoyage
SELECT id, nom, photo_url FROM salles;

SELECT 'Nettoyage terminé ! Les URLs invalides ont été supprimées.' AS Message;