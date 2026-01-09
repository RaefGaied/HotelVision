# 📊 Guide de Configuration du Data Warehouse PostgreSQL

## ✅ Prérequis

### 1. Installer PostgreSQL

**Windows:**
```powershell
# Télécharger depuis: https://www.postgresql.org/download/windows/
# Ou via Chocolatey:
choco install postgresql
```

**Vérifier l'installation:**
```powershell
psql --version
```

### 2. Installer le driver Python

```powershell
pip install psycopg2-binary
```

---

## 🗄️ Création de la Base de Données

### Étape 1: Se connecter à PostgreSQL

```powershell
# Ouvrir psql
psql -U postgres
```

### Étape 2: Créer la base de données

```sql
-- Créer la base
CREATE DATABASE gestion_hoteliere_dw;

-- Se connecter à la nouvelle base
\c gestion_hoteliere_dw

-- Vérifier
SELECT current_database();
```

---

## 📋 Exécution du Schéma

### Méthode 1: Via psql (Recommandé)

```powershell
cd C:\Users\raefg\OneDrive\Documents\GitHub\projet_semestriel\backend\datawarehouse

# Exécuter le script SQL
psql -U postgres -d gestion_hoteliere_dw -f schema_star.sql
```

### Méthode 2: Via pgAdmin

1. Ouvrir **pgAdmin**
2. Se connecter au serveur PostgreSQL
3. Créer la base `gestion_hoteliere_dw`
4. Clic droit sur la base → **Query Tool**
5. Ouvrir le fichier `schema_star.sql`
6. Cliquer sur **Execute** (F5)

---

## 🔧 Configuration du Script Python

### Modifier les credentials dans `load_data_warehouse.py`:

```python
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'gestion_hoteliere_dw',
    'user': 'postgres',
    'password': 'VOTRE_MOT_DE_PASSE'  # ⚠️ À MODIFIER
}
```

---

## 📥 Chargement des Données

### Étape 1: Vérifier les CSV

Les fichiers doivent être dans le même dossier:
- `reservations_clean.csv`
- `chambres_clean.csv`
- `hotels_clean.csv`
- `users_clean.csv`

### Étape 2: Exécuter le chargement

```powershell
cd C:\Users\raefg\OneDrive\Documents\GitHub\projet_semestriel

python backend/datawarehouse/load_data_warehouse.py
```

**Résultat attendu:**
```
================================================================================
📦 CHARGEMENT DATA WAREHOUSE POSTGRESQL
================================================================================

✅ Connexion PostgreSQL établie

📥 Lecture des fichiers CSV...
✅ 142 réservations
✅ 610 chambres
✅ 20 hôtels
✅ 101 utilisateurs

⏰ Chargement DIM_TEMPS...
   ✅ 365 dates insérées

🏨 Chargement DIM_HOTELS...
   ✅ 20 hôtels insérés

🛏️  Chargement DIM_CHAMBRES...
   ✅ 610 chambres insérées

👤 Chargement DIM_CLIENTS...
   ✅ 101 clients insérés

📊 Chargement FAIT_RESERVATIONS...
   ✅ 142 réservations insérées

================================================================================
📊 STATISTIQUES DU DATA WAREHOUSE
================================================================================

   dim_chambres                      610 lignes
   dim_clients                       101 lignes
   dim_hotels                         20 lignes
   dim_statut                          5 lignes
   dim_temps                         365 lignes
   fait_reservations                 142 lignes

✅ CHARGEMENT TERMINÉ AVEC SUCCÈS!
```

---

## ✅ Vérification des Données

### Requêtes de test:

```sql
-- Statistiques globales
SELECT * FROM v_statistiques_dw;

-- Afficher les premières réservations avec toutes les dimensions
SELECT * FROM v_analyse_reservations LIMIT 10;

-- Montant total par ville
SELECT 
    ville, 
    COUNT(*) AS nb_reservations,
    SUM(montant_total) AS montant_total,
    AVG(montant_total) AS montant_moyen
FROM v_analyse_reservations
GROUP BY ville
ORDER BY montant_total DESC;

-- Réservations par mois
SELECT 
    annee_debut,
    mois_debut,
    nom_mois_debut,
    COUNT(*) AS nb_reservations,
    SUM(montant_total) AS montant_total
FROM v_analyse_reservations
GROUP BY annee_debut, mois_debut, nom_mois_debut
ORDER BY annee_debut, mois_debut;

-- Top 10 clients
SELECT 
    nom_client,
    email_client,
    COUNT(*) AS nb_reservations,
    SUM(montant_total) AS montant_total
FROM v_analyse_reservations
GROUP BY nom_client, email_client
ORDER BY montant_total DESC
LIMIT 10;
```

---

## 🎯 Prochaines Étapes

### 1. Connexion Power BI

Dans Power BI Desktop:
1. **Obtenir les données** → **Base de données** → **PostgreSQL**
2. **Serveur:** `localhost`
3. **Base de données:** `gestion_hoteliere_dw`
4. **Importer la vue:** `v_analyse_reservations`

### 2. Création des Mesures DAX

```dax
Montant Total = SUM(v_analyse_reservations[montant_total])
Nombre Réservations = COUNTROWS(v_analyse_reservations)
Montant Moyen = AVERAGE(v_analyse_reservations[montant_total])
Durée Moyenne Séjour = AVERAGE(v_analyse_reservations[duree_sejour])
```

### 3. Dashboard Power BI

- **KPI:** Montant total, Nombre de réservations, Panier moyen
- **Graphiques:**
  - Évolution temporelle (ligne)
  - Répartition par ville (carte)
  - Top hôtels (barres)
  - Distribution types chambres (pie)
- **Filtres:** Dates, Ville, Type chambre, Statut

---

## 🔧 Dépannage

### Erreur: "password authentication failed"

```powershell
# Réinitialiser le mot de passe
psql -U postgres
ALTER USER postgres PASSWORD 'nouveau_mot_de_passe';
```

### Erreur: "could not connect to server"

```powershell
# Vérifier que PostgreSQL est lancé
Get-Service postgresql*

# Démarrer le service
Start-Service postgresql-x64-15  # Adapter le nom
```

### Erreur: "relation does not exist"

```powershell
# Recréer le schéma
psql -U postgres -d gestion_hoteliere_dw -f schema_star.sql
```

---

## 📚 Ressources

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **psycopg2 Docs:** https://www.psycopg.org/docs/
- **Power BI + PostgreSQL:** https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connect-to-data

---

## ✅ Checklist Finale

- [ ] PostgreSQL installé et lancé
- [ ] Base `gestion_hoteliere_dw` créée
- [ ] Schéma SQL exécuté (5 dimensions + 1 fait)
- [ ] CSV générés et disponibles
- [ ] Script Python configuré (mot de passe)
- [ ] Données chargées avec succès
- [ ] Requêtes de vérification passées
- [ ] Power BI connecté et testé

🎉 **Data Warehouse prêt pour Power BI!**
