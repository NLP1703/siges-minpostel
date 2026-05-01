-- Script pour mettre à jour les photos des salles existantes
-- À exécuter dans PhpMyAdmin (onglet SQL)

USE siges_minpostel;

UPDATE salles SET photo_url = 'https://th.bing.com/th/id/OIP.Hej1Kd46bZyVv-4O9g-UkgHaF5?w=203&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' 
WHERE nom LIKE '%10 places%';

UPDATE salles SET photo_url = 'https://tse2.mm.bing.net/th/id/OIP.YcHxTIFvScqTCWTWhx9f2QHaE8?rs=1&pid=ImgDetMain&o=7&rm=3' 
WHERE nom LIKE '%20 places%';

UPDATE salles SET photo_url = 'https://tse2.mm.bing.net/th/id/OIP.Cfzln5ouT4ztFtOQhoLTAAHaEP?rs=1&pid=ImgDetMain&o=7&rm=3' 
WHERE nom LIKE '%50 places%';

UPDATE salles SET photo_url = 'https://tse3.mm.bing.net/th/id/OIP.eMna-k4AmlEIOWQkqo2begHaFj?rs=1&pid=ImgDetMain&o=7&rm=3' 
WHERE nom LIKE '%5 places%';

SELECT 'Photos mises à jour avec succès !' AS Message;
SELECT id, nom, photo_url FROM salles;
