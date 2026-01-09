-- Fix encoding for status labels
UPDATE dim_statut SET libelle_statut = 'Validée', description = 'Réservation confirmée et validée' WHERE code_statut = 'VALIDEE';
UPDATE dim_statut SET libelle_statut = 'Terminée', description = 'Séjour terminé avec succès' WHERE code_statut = 'TERMINEE';
UPDATE dim_statut SET libelle_statut = 'Annulée', description = 'Réservation annulée' WHERE code_statut = 'ANNULEE';
UPDATE dim_statut SET libelle_statut = 'Confirmée', description = 'Réservation confirmée' WHERE code_statut = 'CONFIRMEE';

-- Verify
SELECT code_statut, libelle_statut, description
FROM dim_statut
ORDER BY statut_id;
