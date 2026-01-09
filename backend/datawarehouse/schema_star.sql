
DROP TABLE IF EXISTS fait_reservations
CASCADE;
DROP TABLE IF EXISTS dim_temps
CASCADE;
DROP TABLE IF EXISTS dim_chambres
CASCADE;
DROP TABLE IF EXISTS dim_hotels
CASCADE;
DROP TABLE IF EXISTS dim_clients
CASCADE;
DROP TABLE IF EXISTS dim_statut
CASCADE;


CREATE TABLE dim_temps
(
    temps_id SERIAL PRIMARY KEY,
    date_complete DATE NOT NULL UNIQUE,
    annee INTEGER NOT NULL,
    mois INTEGER NOT NULL,
    jour INTEGER NOT NULL,
    trimestre INTEGER NOT NULL,
    nom_mois VARCHAR(20),
    jour_semaine INTEGER,
    nom_jour VARCHAR(20),
    semaine_annee INTEGER,
    est_weekend BOOLEAN,
    CONSTRAINT chk_mois CHECK (mois BETWEEN 1 AND 12),
    CONSTRAINT chk_jour CHECK (jour BETWEEN 1 AND 31),
    CONSTRAINT chk_trimestre CHECK (trimestre BETWEEN 1 AND 4)
);

CREATE INDEX idx_temps_date ON dim_temps(date_complete);
CREATE INDEX idx_temps_annee_mois ON dim_temps(annee, mois);

COMMENT ON TABLE dim_temps IS 'Dimension temporelle pour analyse chronologique';
COMMENT ON COLUMN dim_temps.temps_id IS 'Clé primaire (surrogate key)';
COMMENT ON COLUMN dim_temps.date_complete IS 'Date complète';


CREATE TABLE dim_hotels
(
    hotel_id SERIAL PRIMARY KEY,
    hotel_code VARCHAR(50) UNIQUE,
    nom_hotel VARCHAR(200) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    adresse TEXT,
    etoiles INTEGER,
    telephone VARCHAR(20),
    email VARCHAR(100),
    description TEXT,
    CONSTRAINT chk_etoiles CHECK (etoiles BETWEEN 1 AND 5)
);

CREATE INDEX idx_hotels_ville ON dim_hotels(ville);
CREATE INDEX idx_hotels_etoiles ON dim_hotels(etoiles);

COMMENT ON TABLE dim_hotels IS 'Dimension des hôtels';
COMMENT ON COLUMN dim_hotels.hotel_id IS 'Clé primaire (surrogate key)';
COMMENT ON COLUMN dim_hotels.hotel_code IS 'Code métier de l''hôtel (ObjectId MongoDB)';


CREATE TABLE dim_chambres
(
    chambre_id SERIAL PRIMARY KEY,
    chambre_code VARCHAR(50) UNIQUE,
    hotel_id INTEGER REFERENCES dim_hotels(hotel_id),
    numero_chambre VARCHAR(20),
    type_chambre VARCHAR(50) NOT NULL,
    capacite INTEGER,
    prix_base DECIMAL(10, 2),
    vue VARCHAR(50),
    CONSTRAINT chk_capacite CHECK (capacite > 0),
    CONSTRAINT chk_prix CHECK (prix_base >= 0)
);

CREATE INDEX idx_chambres_hotel ON dim_chambres(hotel_id);
CREATE INDEX idx_chambres_type ON dim_chambres(type_chambre);
CREATE INDEX idx_chambres_prix ON dim_chambres(prix_base);

COMMENT ON TABLE dim_chambres IS 'Dimension des chambres';
COMMENT ON COLUMN dim_chambres.chambre_id IS 'Clé primaire (surrogate key)';
COMMENT ON COLUMN dim_chambres.type_chambre IS 'Type: SIMPLE, DOUBLE, DELUXE, SUITE';


CREATE TABLE dim_clients
(
    client_id SERIAL PRIMARY KEY,
    client_code VARCHAR(50) UNIQUE,
    nom_client VARCHAR(200),
    email VARCHAR(100),
    role VARCHAR(50),
    actif BOOLEAN DEFAULT TRUE,
    date_inscription DATE
);

CREATE INDEX idx_clients_email ON dim_clients(email);
CREATE INDEX idx_clients_actif ON dim_clients(actif);

COMMENT ON TABLE dim_clients IS 'Dimension des clients';
COMMENT ON COLUMN dim_clients.client_id IS 'Clé primaire (surrogate key)';
COMMENT ON COLUMN dim_clients.client_code IS 'Code métier du client (ObjectId MongoDB)';


CREATE TABLE dim_statut
(
    statut_id SERIAL PRIMARY KEY,
    code_statut VARCHAR(20) UNIQUE NOT NULL,
    libelle_statut VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE INDEX idx_statut_code ON dim_statut(code_statut);

COMMENT ON TABLE dim_statut IS 'Dimension des statuts de réservation';
COMMENT ON COLUMN dim_statut.statut_id IS 'Clé primaire (surrogate key)';


INSERT INTO dim_statut
    (code_statut, libelle_statut, description)
VALUES
    ('VALIDEE', 'Validée', 'Réservation confirmée et validée'),
    ('TERMINEE', 'Terminée', 'Séjour terminé avec succès'),
    ('ANNULEE', 'Annulée', 'Réservation annulée par le client ou l''hôtel'),
    ('EN_ATTENTE', 'En attente', 'Réservation en attente de confirmation'),
    ('CONFIRMEE', 'Confirmée', 'Réservation confirmée');


CREATE TABLE fait_reservations
(
    reservation_id SERIAL PRIMARY KEY,
    reservation_code VARCHAR(50) UNIQUE,

    -- Clés étrangères vers les dimensions
    temps_debut_id INTEGER REFERENCES dim_temps(temps_id),
    temps_fin_id INTEGER REFERENCES dim_temps(temps_id),
    temps_creation_id INTEGER REFERENCES dim_temps(temps_id),
    hotel_id INTEGER REFERENCES dim_hotels(hotel_id),
    chambre_id INTEGER REFERENCES dim_chambres(chambre_id),
    client_id INTEGER REFERENCES dim_clients(client_id),
    statut_id INTEGER REFERENCES dim_statut(statut_id),

    -- Mesures (métriques)
    montant_total DECIMAL(10, 2) NOT NULL,
    montant_abs DECIMAL(10, 2),
    duree_sejour INTEGER,
    nombre_services INTEGER DEFAULT 0,

    -- Attributs dégénérés
    mode_paiement VARCHAR(50),

    -- Colonnes techniques
    date_chargement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_montant CHECK (montant_total >= 0),
    CONSTRAINT chk_duree CHECK (duree_sejour >= 0)
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_fait_temps_debut ON fait_reservations(temps_debut_id);
CREATE INDEX idx_fait_temps_fin ON fait_reservations(temps_fin_id);
CREATE INDEX idx_fait_temps_creation ON fait_reservations(temps_creation_id);
CREATE INDEX idx_fait_hotel ON fait_reservations(hotel_id);
CREATE INDEX idx_fait_chambre ON fait_reservations(chambre_id);
CREATE INDEX idx_fait_client ON fait_reservations(client_id);
CREATE INDEX idx_fait_statut ON fait_reservations(statut_id);
CREATE INDEX idx_fait_montant ON fait_reservations(montant_total);

COMMENT ON TABLE fait_reservations IS 'Table de faits centrale - Réservations hôtelières';
COMMENT ON COLUMN fait_reservations.reservation_id IS 'Clé primaire (surrogate key)';
COMMENT ON COLUMN fait_reservations.montant_total IS 'Montant total de la réservation (métrique principale)';
COMMENT ON COLUMN fait_reservations.duree_sejour IS 'Nombre de jours de séjour (métrique)';



-- Vue pour faciliter les analyses
CREATE OR REPLACE VIEW v_analyse_reservations AS
SELECT
    f.reservation_id,
    f.reservation_code,

    -- Dimensions temporelles
    td.date_complete AS date_debut,
    td.annee AS annee_debut,
    td.mois AS mois_debut,
    td.nom_mois AS nom_mois_debut,
    td.trimestre AS trimestre_debut,

    tf.date_complete AS date_fin,
    tc.date_complete AS date_creation,

    -- Dimension hôtel
    h.nom_hotel,
    h.ville,
    h.etoiles,

    -- Dimension chambre
    ch.type_chambre,
    ch.numero_chambre,
    ch.capacite,
    ch.prix_base,

    -- Dimension client
    cl.nom_client,
    cl.email AS email_client,

    -- Dimension statut
    s.code_statut,
    s.libelle_statut,

    -- Métriques
    f.montant_total,
    f.duree_sejour,
    f.nombre_services,
    f.mode_paiement,

    -- Métriques calculées
    CASE 
        WHEN f.duree_sejour > 0 THEN f.montant_total / f.duree_sejour 
        ELSE 0 
    END AS montant_moyen_par_jour

FROM fait_reservations f
    LEFT JOIN dim_temps td ON f.temps_debut_id = td.temps_id
    LEFT JOIN dim_temps tf ON f.temps_fin_id = tf.temps_id
    LEFT JOIN dim_temps tc ON f.temps_creation_id = tc.temps_id
    LEFT JOIN dim_hotels h ON f.hotel_id = h.hotel_id
    LEFT JOIN dim_chambres ch ON f.chambre_id = ch.chambre_id
    LEFT JOIN dim_clients cl ON f.client_id = cl.client_id
    LEFT JOIN dim_statut s ON f.statut_id = s.statut_id;

COMMENT ON VIEW v_analyse_reservations IS 'Vue dénormalisée pour faciliter les analyses Power BI';



-- Vue de statistiques du Data Warehouse
CREATE OR REPLACE VIEW v_statistiques_dw AS
    SELECT
        'dim_temps' AS table_name, COUNT(*) AS nb_lignes
    FROM dim_temps
UNION ALL
    SELECT 'dim_hotels', COUNT(*)
    FROM dim_hotels
UNION ALL
    SELECT 'dim_chambres', COUNT(*)
    FROM dim_chambres
UNION ALL
    SELECT 'dim_clients', COUNT(*)
    FROM dim_clients
UNION ALL
    SELECT 'dim_statut', COUNT(*)
    FROM dim_statut
UNION ALL
    SELECT 'fait_reservations', COUNT(*)
    FROM fait_reservations;



-- Afficher les statistiques
SELECT *
FROM v_statistiques_dw
ORDER BY table_name;

COMMENT ON DATABASE gestion_hoteliere_dw IS 'Data Warehouse - Gestion Hôtelière (Modèle en Étoile)';
