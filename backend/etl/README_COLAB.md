# 📊 Guide d'utilisation - ETL sur Google Colab

## 🎯 Objectif
Exécuter le processus ETL complet pour nettoyer les données MongoDB et préparer le Data Warehouse.

---

## 📋 Prérequis

1. **Compte Google** avec accès à Google Colab
2. **MongoDB Atlas URI** de votre cluster
3. **Fichiers Python** copiés depuis ce répertoire (`/backend/etl/`)

---

## 🚀 ÉTAPES D'EXÉCUTION

### ÉTAPE 1: Créer un notebook Colab

1. Aller sur [Google Colab](https://colab.research.google.com)
2. Créer un nouveau notebook
3. Renommer: `BI_ETL_Hotel_Transformation`

---

### ÉTAPE 2: Installation des dépendances

**Copier dans la première cellule et exécuter:**

```python
# Installation des packages
!pip install pymongo pandas numpy openpyxl

print("✅ Packages installés")
```

---

### ÉTAPE 3: Configuration

**Copier dans la 2ème cellule:**

```python
import pandas as pd
import numpy as np
import pymongo
from pymongo import MongoClient
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Configuration MongoDB Atlas
MONGODB_ATLAS_URI = "mongodb+srv://Raef:YOUR_PASSWORD@cluster0.v6scg.mongodb.net/gestion-hoteliere?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "gestion-hoteliere"

# Test de connexion
try:
    client = MongoClient(MONGODB_ATLAS_URI)
    db = client[DATABASE_NAME]
    db.command('ping')
    print("✅ Connecté à MongoDB Atlas!")
    print(f"Collections: {db.list_collection_names()}")
except Exception as e:
    print(f"❌ Erreur: {e}")
```

---

### ÉTAPE 4: Extraction des données

**Copier dans la 3ème cellule:**

```python
print("📥 EXTRACTION DES DONNÉES...")

# Charger toutes les collections
reservations = pd.DataFrame(list(db['reservations'].find()))
paiements = pd.DataFrame(list(db['paiements'].find()))
factures = pd.DataFrame(list(db['factures'].find()))
chambres = pd.DataFrame(list(db['chambres'].find()))
hotels = pd.DataFrame(list(db['hotels'].find()))
users = pd.DataFrame(list(db['users'].find()))
services = pd.DataFrame(list(db['services'].find()))

# Afficher les statistiques
print(f"✅ Réservations: {len(reservations)} documents")
print(f"✅ Paiements: {len(paiements)} documents")
print(f"✅ Factures: {len(factures)} documents")
print(f"✅ Chambres: {len(chambres)} documents")
print(f"✅ Hotels: {len(hotels)} documents")
print(f"✅ Users: {len(users)} documents")
print(f"✅ Services: {len(services)} documents")
```

---

### ÉTAPE 5: Exploration des données (TP - PART 1)

**Copier dans la 4ème cellule:**

```python
print("\n" + "="*80)
print("🔍 EXPLORATION RÉSERVATIONS - TP PART 1")
print("="*80)

# 1. Premières lignes
print("\n1️⃣ PREMIÈRES LIGNES:")
print(reservations.head(10))

# 2. Informations générales
print("\n2️⃣ INFORMATIONS GÉNÉRALES:")
reservations.info()

# 3. Statistiques descriptives
print("\n3️⃣ STATISTIQUES DESCRIPTIVES:")
print(reservations[['montant', 'duree_sejour']].describe())

# 4. Valeurs manquantes
print("\n4️⃣ VALEURS MANQUANTES:")
missing = reservations.isnull().sum()
print(missing[missing > 0] if missing.sum() > 0 else "✅ Aucune valeur manquante")

# 5. Doublons
print(f"\n5️⃣ DOUBLONS: {reservations.duplicated().sum()}")

# 6. Distribution statut
print("\n6️⃣ DISTRIBUTION DES STATUTS:")
print(reservations['statut'].value_counts())

# 7. Distribution type chambre
print("\n7️⃣ DISTRIBUTION DES TYPES:")
print(reservations['type'].value_counts() if 'type' in reservations.columns else "N/A")

# 8-10. Visualisations (optionnel)
import matplotlib.pyplot as plt

# Histogramme montants
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
reservations['montant'].hist(bins=50)
plt.title("Distribution des montants")
plt.xlabel("Montant")
plt.ylabel("Fréquence")

# Boxplot
plt.subplot(1, 2, 2)
reservations.boxplot(column='montant')
plt.title("Boxplot des montants")
plt.show()

print("\n✅ Exploration terminée")
```

---

### ÉTAPE 6: Nettoyage ETL (TP - PART 2)

**Copier dans la 5ème cellule:**

```python
print("\n" + "="*80)
print("🔧 TRANSFORMATION ETL - TP PART 2")
print("="*80)

print(f"\nAVANT: {len(reservations)} lignes")

# 11. Supprimer annulées
reservations = reservations[reservations['statut'] != 'annulée']
print(f"✅ Suppression annulées: {len(reservations)} lignes")

# 12. Remplir montants manquants
if 'montant' in reservations.columns:
    montant_mean = reservations['montant'].mean()
    reservations['montant'].fillna(montant_mean, inplace=True)
    print(f"✅ Montants manquants remplis (moyenne: {montant_mean:.2f})")

# 13. Convertir dates
date_cols = ['date_debut', 'date_fin', 'date_creation']
for col in date_cols:
    if col in reservations.columns:
        reservations[col] = pd.to_datetime(reservations[col], errors='coerce')
print(f"✅ Dates converties")

# 14. Montant absolu
reservations['montant_abs'] = reservations['montant'].abs()

# 15-16. Année et mois
if 'date_creation' in reservations.columns:
    reservations['annee'] = reservations['date_creation'].dt.year
    reservations['mois'] = reservations['date_creation'].dt.month
    reservations['jour'] = reservations['date_creation'].dt.day
print(f"✅ Colonnes temporelles créées")

# 17. Normaliser région (ville)
if 'ville' in reservations.columns:
    reservations['ville'] = reservations['ville'].str.upper().str.strip()
print(f"✅ Région normalisée")

# 18. Filtrer transactions > 1000
reservations_filtered = reservations[reservations['montant'] > 1000]
print(f"✅ Filtrage > 1000: {len(reservations_filtered)} lignes")

# 19-20. Colonnes booléennes
reservations['est_depot'] = 1  # Adapter selon votre logique
reservations['est_retrait'] = 0
print(f"✅ Colonnes booléennes créées")

# 21. Détecter outliers (IQR)
Q1 = reservations['montant'].quantile(0.25)
Q3 = reservations['montant'].quantile(0.75)
IQR = Q3 - Q1
reservations['outlier'] = (reservations['montant'] < Q1 - 1.5*IQR) | (reservations['montant'] > Q3 + 1.5*IQR)
outlier_count = reservations['outlier'].sum()
print(f"✅ Outliers détectés: {outlier_count}")

# 22. Remplacer outliers
if outlier_count > 0:
    median_val = reservations[~reservations['outlier']]['montant'].median()
    reservations.loc[reservations['outlier'], 'montant'] = median_val
    print(f"✅ Outliers remplacés par médiane ({median_val:.2f})")

# 23. Catégorie mode paiement
if 'mode_paiement' in reservations.columns:
    reservations['mode_paiement'] = reservations['mode_paiement'].astype('category')
    print(f"✅ Mode paiement en catégorie")

print(f"\nAPRÈS: {len(reservations)} lignes ✅")
```

---

### ÉTAPE 7: Agrégations et Pivot Tables (TP - PART 3)

**Copier dans la 6ème cellule:**

```python
print("\n" + "="*80)
print("📊 AGRÉGATIONS - TP PART 3")
print("="*80)

# 24. Pivot montants par région et type
if 'ville' in reservations.columns and 'type' in reservations.columns:
    pivot_montant = pd.pivot_table(
        reservations,
        values='montant',
        index='ville',
        columns='type',
        aggfunc='sum'
    )
    print("\n✅ Pivot 1: Montants par ville et type")
    print(pivot_montant.fillna(0))

# 25. Pivot réservations par mois et type
if 'mois' in reservations.columns and 'type' in reservations.columns:
    pivot_mois = pd.pivot_table(
        reservations,
        values='montant',
        index='mois',
        columns='type',
        aggfunc='count'
    )
    print("\n✅ Pivot 2: Réservations par mois et type")
    print(pivot_mois.fillna(0))

# 26. Groupby client
if 'client_id' in reservations.columns:
    group_client = reservations.groupby('client_id')['montant'].agg(['sum', 'count', 'mean']).sort_values('sum', ascending=False)
    print("\n✅ Top 10 clients:")
    print(group_client.head(10))

# 27. Groupby région
if 'ville' in reservations.columns:
    group_region = reservations.groupby('ville')['montant'].agg(['sum', 'mean', 'count'])
    print("\n✅ Statistiques par région:")
    print(group_region)

print("\n✅ Agrégations terminées")
```

---

### ÉTAPE 8: Export des fichiers

**Copier dans la 7ème cellule:**

```python
print("\n" + "="*80)
print("💾 EXPORT DES FICHIERS")
print("="*80)

# 28. Exporter CSV
reservations.to_csv('reservations_clean.csv', index=False)
print("✅ reservations_clean.csv")

paiements.to_csv('paiements_clean.csv', index=False)
print("✅ paiements_clean.csv")

factures.to_csv('factures_clean.csv', index=False)
print("✅ factures_clean.csv")

chambres.to_csv('chambres_clean.csv', index=False)
print("✅ chambres_clean.csv")

hotels.to_csv('hotels_clean.csv', index=False)
print("✅ hotels_clean.csv")

users.to_csv('users_clean.csv', index=False)
print("✅ users_clean.csv")

# 29. Exporter pivot tables
try:
    with pd.ExcelWriter('pivot_tables.xlsx', engine='openpyxl') as writer:
        if 'pivot_montant' in locals():
            pivot_montant.to_excel(writer, sheet_name='Montant_Ville_Type')
        if 'pivot_mois' in locals():
            pivot_mois.to_excel(writer, sheet_name='Reservations_Mois_Type')
        if 'group_region' in locals():
            group_region.to_excel(writer, sheet_name='Statistiques_Region')
    print("✅ pivot_tables.xlsx")
except:
    print("⚠️  Excel export non disponible dans ce kernel")

# 30. Graphique final
plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
reservations['montant'].hist(bins=50)
plt.title("Distribution des montants (APRÈS nettoyage)")
plt.xlabel("Montant")

plt.subplot(1, 2, 2)
reservations.groupby('type')['montant'].sum().plot(kind='bar')
plt.title("Montants totaux par type")
plt.ylabel("Montant")
plt.tight_layout()
plt.show()

print("\n✅ Export terminé")
```

---

### ÉTAPE 9: Résumé final

**Copier dans la 8ème cellule:**

```python
print("\n" + "="*80)
print("✅ TRANSFORMATION ETL COMPLÉTÉE")
print("="*80)

print(f"\n📋 RÉSUMÉ:")
print(f"✅ Réservations: {len(reservations)} lignes")
print(f"✅ Paiements: {len(paiements)} lignes")
print(f"✅ Factures: {len(factures)} lignes")
print(f"✅ Chambres: {len(chambres)} lignes")
print(f"✅ Hotels: {len(hotels)} lignes")
print(f"✅ Users: {len(users)} lignes")

print(f"\n📁 FICHIERS À TÉLÉCHARGER (Colab Files):")
print(f"   - reservations_clean.csv")
print(f"   - paiements_clean.csv")
print(f"   - factures_clean.csv")
print(f"   - chambres_clean.csv")
print(f"   - hotels_clean.csv")
print(f"   - users_clean.csv")
print(f"   - pivot_tables.xlsx")

print(f"\n🔗 PROCHAINES ÉTAPES:")
print(f"   1. ✅ Télécharger les fichiers CSV")
print(f"   2. ⏳ Charger dans PostgreSQL/MySQL")
print(f"   3. ⏳ Créer modèle en étoile (Fact + Dimensions)")
print(f"   4. ⏳ Connecter Power BI")
print(f"   5. ⏳ Créer dashboard BI")

print(f"\n{'='*80}\n")

client.close()
```

---

## 📥 Télécharger les fichiers depuis Colab

1. Aller dans le **Files Panel** (gauche)
2. Cliquer sur chaque fichier CSV/Excel
3. Sélectionner **Download**
4. Les fichiers s'enregistreront dans votre `Downloads`

---

## 🔐 Sécurité

- **NE PAS** partager votre URI MongoDB Atlas
- Utiliser une variable d'environnement pour la prod
- Changer le mot de passe périodiquement

---

## ❓ Troubleshooting

### Erreur de connexion MongoDB
```
Vérifier:
- URI correcte dans .env
- Cluster actif sur MongoDB Atlas
- Network Access: 0.0.0.0/0 autorisé
```

### Package manquant
```
!pip install pymongo pandas numpy openpyxl
```

### Fichier non trouvé
```
# Vérifié que le fichier est dans /content/
!ls -la *.csv
```

---

**✅ ETL terminé! Passez à la création du Data Warehouse 📊**
