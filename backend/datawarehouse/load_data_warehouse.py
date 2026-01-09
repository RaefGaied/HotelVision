#!/usr/bin/env python3
"""
Script de chargement du Data Warehouse PostgreSQL
Charge les données depuis les CSV nettoyés vers le modèle en étoile
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import numpy as np



DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'gestion_hoteliere_dw',
    'user': 'postgres',
    'password': 'raef123/*'  
}

print(" CHARGEMENT DATA WAREHOUSE POSTGRESQL")
print("="*80 + "\n")



try:
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("✅ Connexion PostgreSQL établie\n")
except Exception as e:
    print(f" Erreur de connexion: {e}")
    exit(1)



print("📥 Lecture des fichiers CSV...\n")

reservations = pd.read_csv('reservations_clean.csv')
chambres = pd.read_csv('chambres_clean.csv')
hotels = pd.read_csv('hotels_clean.csv')
users = pd.read_csv('users_clean.csv')

print(f"{len(reservations)} réservations")
print(f"{len(chambres)} chambres")
print(f"{len(hotels)} hôtels")
print(f"{len(users)} utilisateurs\n")



def charger_dim_temps():
    
    dates_debut = pd.to_datetime(reservations['date_debut'], errors='coerce').dropna()
    dates_fin = pd.to_datetime(reservations['date_fin'], errors='coerce').dropna()
    dates_creation = pd.to_datetime(reservations['date_creation'], errors='coerce').dropna()
    
    toutes_dates = pd.concat([dates_debut, dates_fin, dates_creation]).unique()
    toutes_dates = pd.Series(toutes_dates).sort_values().values
    
    # Créer le DataFrame de dimension temps
    dim_temps_data = []
    
    for date in toutes_dates:
        if pd.isna(date):
            continue
        
        # Convertir numpy.datetime64 en pandas Timestamp
        date = pd.Timestamp(date)
            
        dim_temps_data.append({
            'date_complete': date.date(),
            'annee': date.year,
            'mois': date.month,
            'jour': date.day,
            'trimestre': (date.month - 1) // 3 + 1,
            'nom_mois': date.strftime('%B'),
            'jour_semaine': date.weekday() + 1,
            'nom_jour': date.strftime('%A'),
            'semaine_annee': date.isocalendar()[1],
            'est_weekend': date.weekday() >= 5
        })
    
    df_temps = pd.DataFrame(dim_temps_data).drop_duplicates(subset=['date_complete'])
    
    # Insertion dans PostgreSQL
    insert_query = """
    INSERT INTO dim_temps (date_complete, annee, mois, jour, trimestre, nom_mois, 
                          jour_semaine, nom_jour, semaine_annee, est_weekend)
    VALUES %s
    ON CONFLICT (date_complete) DO NOTHING
    """
    
    values = [tuple(row) for row in df_temps.itertuples(index=False)]
    execute_values(cursor, insert_query, values)
    conn.commit()
    
    print(f"   ✅ {len(df_temps)} dates insérées\n")

# ============================================================================
# FONCTION: CHARGER DIMENSION HOTELS
# ============================================================================

def charger_dim_hotels():
    print("🏨 Chargement DIM_HOTELS...")
    
    # Préparer les données
    hotels_data = hotels[[
        'nom', 'ville', 'adresse', 'etoiles', 'telephone', 'email', 'description'
    ]].copy()
    
    hotels_data['hotel_code'] = hotels.index.astype(str)
    
    # Insertion
    insert_query = """
    INSERT INTO dim_hotels (hotel_code, nom_hotel, ville, adresse, etoiles, telephone, email, description)
    VALUES %s
    ON CONFLICT (hotel_code) DO NOTHING
    RETURNING hotel_id, hotel_code
    """
    
    values = [
        (
            row['hotel_code'],
            row['nom'],
            row['ville'],
            row.get('adresse', None),
            row.get('etoiles', None),
            row.get('telephone', None),
            row.get('email', None),
            row.get('description', None)
        )
        for _, row in hotels_data.iterrows()
    ]
    
    execute_values(cursor, insert_query, values)
    conn.commit()
    
    print(f"   ✅ {len(hotels_data)} hôtels insérés\n")

# ============================================================================
# FONCTION: CHARGER DIMENSION CHAMBRES
# ============================================================================

def charger_dim_chambres():
    print("🛏️  Chargement DIM_CHAMBRES...")
    
    # Préparer les données
    chambres_data = chambres.copy()
    chambres_data['chambre_code'] = chambres.index.astype(str)
    
    # Récupérer les hotel_id depuis PostgreSQL
    cursor.execute("SELECT hotel_id, hotel_code FROM dim_hotels")
    hotel_mapping = {code: id for id, code in cursor.fetchall()}
    
    # Insertion
    insert_query = """
    INSERT INTO dim_chambres (chambre_code, hotel_id, numero_chambre, type_chambre, capacite, prix_base, vue)
    VALUES %s
    ON CONFLICT (chambre_code) DO NOTHING
    """
    
    values = [
        (
            row['chambre_code'],
            hotel_mapping.get(str(idx), 1),  # Mapping hotel_id
            row.get('numero', 'N/A'),
            row.get('type', 'STANDARD'),
            row.get('capacite', 2),
            row.get('prix', 100),
            row.get('vue', 'Standard')
        )
        for idx, row in chambres_data.iterrows()
    ]
    
    execute_values(cursor, insert_query, values)
    conn.commit()
    
    print(f"   ✅ {len(chambres_data)} chambres insérées\n")

# ============================================================================
# FONCTION: CHARGER DIMENSION CLIENTS
# ============================================================================

def charger_dim_clients():
    print("👤 Chargement DIM_CLIENTS...")
    
    # Préparer les données
    clients_data = users.copy()
    clients_data['client_code'] = users.index.astype(str)
    
    # Insertion
    insert_query = """
    INSERT INTO dim_clients (client_code, nom_client, email, role, actif, date_inscription)
    VALUES %s
    ON CONFLICT (client_code) DO NOTHING
    """
    
    values = [
        (
            row['client_code'],
            row.get('nom', 'Anonyme'),
            row.get('email', None),
            row.get('role', 'client'),
            row.get('actif', True),
            pd.to_datetime(row.get('date_creation', datetime.now())).date() if 'date_creation' in row else datetime.now().date()
        )
        for _, row in clients_data.iterrows()
    ]
    
    execute_values(cursor, insert_query, values)
    conn.commit()
    
    print(f"   ✅ {len(clients_data)} clients insérés\n")

# ============================================================================
# FONCTION: CHARGER TABLE DE FAITS
# ============================================================================

def charger_fait_reservations():
    print("📊 Chargement FAIT_RESERVATIONS...")
    
    # Récupérer les mappings des dimensions
    cursor.execute("SELECT temps_id, date_complete FROM dim_temps")
    temps_mapping = {str(date): id for id, date in cursor.fetchall()}
    
    cursor.execute("SELECT hotel_id, hotel_code FROM dim_hotels")
    hotel_mapping = {code: id for id, code in cursor.fetchall()}
    
    cursor.execute("SELECT chambre_id, chambre_code FROM dim_chambres")
    chambre_mapping = {code: id for id, code in cursor.fetchall()}
    
    cursor.execute("SELECT client_id, client_code FROM dim_clients")
    client_mapping = {code: id for id, code in cursor.fetchall()}
    
    cursor.execute("SELECT statut_id, code_statut FROM dim_statut")
    statut_mapping = {code: id for id, code in cursor.fetchall()}
    
    # Préparer les données des faits
    reservations_data = reservations.copy()
    reservations_data['reservation_code'] = reservations.index.astype(str)
    
    # Calculer le nombre de services par réservation
    def compter_services(services_str):
        if pd.isna(services_str) or services_str == '' or services_str == '[]':
            return 0
        # Compter les ObjectId dans la liste
        return services_str.count('ObjectId(')
    
    reservations_data['nb_services'] = reservations_data['services'].apply(compter_services)
    
    # Insertion
    insert_query = """
    INSERT INTO fait_reservations (
        reservation_code, temps_debut_id, temps_fin_id, temps_creation_id,
        hotel_id, chambre_id, client_id, statut_id,
        montant_total, montant_abs, duree_sejour, nombre_services, mode_paiement
    )
    VALUES %s
    """
    
    values = []
    inserted = 0
    
    for idx, row in reservations_data.iterrows():
        try:
            date_debut = pd.to_datetime(row.get('date_debut')).date() if pd.notna(row.get('date_debut')) else None
            date_fin = pd.to_datetime(row.get('date_fin')).date() if pd.notna(row.get('date_fin')) else None
            date_creation = pd.to_datetime(row.get('date_creation')).date() if pd.notna(row.get('date_creation')) else None
            
            temps_debut_id = temps_mapping.get(str(date_debut), 1) if date_debut else 1
            temps_fin_id = temps_mapping.get(str(date_fin), 1) if date_fin else 1
            temps_creation_id = temps_mapping.get(str(date_creation), 1) if date_creation else 1
            
            statut = row.get('statut', 'TERMINEE').upper()
            statut_id = statut_mapping.get(statut, 2)  # Par défaut: TERMINEE
            
            duree = (pd.to_datetime(row.get('date_fin')) - pd.to_datetime(row.get('date_debut'))).days if pd.notna(row.get('date_fin')) and pd.notna(row.get('date_debut')) else 0
            
            values.append((
                row['reservation_code'],
                temps_debut_id,
                temps_fin_id,
                temps_creation_id,
                hotel_mapping.get(str(idx % len(hotel_mapping)), 1),
                chambre_mapping.get(str(idx % len(chambre_mapping)), 1),
                client_mapping.get(str(idx % len(client_mapping)), 1),
                statut_id,
                float(row.get('montant', 0)),
                float(row.get('montant_abs', abs(row.get('montant', 0)))),
                max(0, duree),
                int(row.get('nb_services', 0)),
                row.get('mode_paiement', 'CARTE')
            ))
            inserted += 1
        except Exception as e:
            print(f"   ⚠️ Erreur ligne {idx}: {e}")
            continue
    
    execute_values(cursor, insert_query, values)
    conn.commit()
    
    print(f"   ✅ {inserted} réservations insérées\n")

# ============================================================================
# EXÉCUTION DU CHARGEMENT
# ============================================================================

try:
    charger_dim_temps()
    charger_dim_hotels()
    charger_dim_chambres()
    charger_dim_clients()
    charger_fait_reservations()
    
    # Statistiques finales
    print("="*80)
    print("📊 STATISTIQUES DU DATA WAREHOUSE")
    print("="*80 + "\n")
    
    cursor.execute("SELECT * FROM v_statistiques_dw ORDER BY table_name")
    stats = cursor.fetchall()
    
    for table_name, nb_lignes in stats:
        print(f"   {table_name:30} {nb_lignes:>10} lignes")
    
    print("\n" + "="*80)
    print("✅ CHARGEMENT TERMINÉ AVEC SUCCÈS!")
    print("="*80 + "\n")
    
    print("🎯 PROCHAINES ÉTAPES:")
    print("   1. Vérifier les données: SELECT * FROM v_analyse_reservations LIMIT 10;")
    print("   2. Connecter Power BI à PostgreSQL")
    print("   3. Créer les mesures DAX et le dashboard\n")

except Exception as e:
    print(f"\n❌ ERREUR: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()
    print("✅ Connexion fermée\n")
