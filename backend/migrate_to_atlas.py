#!/usr/bin/env python3
"""
Script de migration MongoDB Compass (Local) → MongoDB Atlas (Cloud)
Usage: python migrate_to_atlas.py
"""

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, OperationFailure
import sys
import os
from dotenv import load_dotenv

load_dotenv()

def migrate_to_atlas():
    """Migre les données de MongoDB local vers MongoDB Atlas"""
    
    LOCAL_URI = "mongodb://localhost:27017"
    LOCAL_DB = "gestion-hoteliere"
    
    ATLAS_URI = os.getenv('MONGODB_ATLAS_URI', 'mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority')
    ATLAS_DB = "gestion-hoteliere"
    
    collections_to_migrate = [
        'hotels',
        'users',
        'chambres',
        'reservations',
        'factures',
        'paiements',
        'services'
    ]
    
    print("=" * 70)
    print("🔄 MIGRATION MONGODB: LOCAL → ATLAS")
    print("=" * 70)
    
    try:
        print("\nConnexion à MongoDB LOCAL (Compass)...")
        client_local = MongoClient(LOCAL_URI, serverSelectionTimeoutMS=5000)
        client_local.admin.command('ping')
        print("Connecté à MongoDB local")
        
        db_local = client_local[LOCAL_DB]
        
        print("\nConnexion à MongoDB ATLAS...")
        client_atlas = MongoClient(ATLAS_URI, serverSelectionTimeoutMS=10000)
        client_atlas.admin.command('ping')
        print("Connecté à MongoDB Atlas")
        
        db_atlas = client_atlas[ATLAS_DB]
        
        # ===== STATISTIQUES AVANT =====
        print("\n📊 AVANT MIGRATION:")
        total_docs_local = 0
        for col_name in collections_to_migrate:
            count = db_local[col_name].count_documents({})
            total_docs_local += count
            if count > 0:
                print(f"  {col_name:15} → {count:4} documents")
        print(f" TOTAL: {total_docs_local} documents")
        
        print("\n MIGRATION EN COURS...\n")
        
        total_migrated = 0
        for col_name in collections_to_migrate:
            try:
                docs = list(db_local[col_name].find())
                
                if docs:
                    result = db_atlas[col_name].insert_many(docs)
                    migrated = len(result.inserted_ids)
                    total_migrated += migrated
                    
                    print(f"  {col_name:15} → {migrated:4} documents insérés dans Atlas")
                else:
                    print(f"  {col_name:15} → Collection vide (non migrée)")
                    
            except OperationFailure as e:
                print(f"  {col_name:15} → Erreur: {e}")
            except Exception as e:
                print(f" {col_name:15} → Erreur: {e}")
        
        print("\n APRÈS MIGRATION (Atlas):")
        total_docs_atlas = 0
        for col_name in collections_to_migrate:
            count = db_atlas[col_name].count_documents({})
            total_docs_atlas += count
            if count > 0:
                print(f" {col_name:15} → {count:4} documents")
        print(f" OTAL: {total_docs_atlas} documents")
        
        print("\n VÉRIFICATION:")
        if total_docs_local == total_docs_atlas:
            print(f"  Migration réussie! {total_docs_atlas} documents transférés")
            print("\nMIGRATION COMPLÈTE!")
            success = True
        else:
            print(f"   ⚠️  Mismatch: Local={total_docs_local}, Atlas={total_docs_atlas}")
            print("   Vérifiez les logs ci-dessus")
            success = False
        
        # Fermer connexions
        client_local.close()
        client_atlas.close()
        
        return success
        
    except ServerSelectionTimeoutError as e:
        print(f" Erreur de connexion: {e}")
       
        
    except Exception as e:
        print(f"Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = migrate_to_atlas()
    sys.exit(0 if success else 1)
