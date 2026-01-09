<div align="center">

# 🏨 HotelVision

**Système Intégré de Gestion Hôtelière avec IA et Business Intelligence**

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Power BI](https://img.shields.io/badge/Power_BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)](https://powerbi.microsoft.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

# Table des matières

- [Description](#-description)
- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Couche Business Intelligence](#-couche-business-intelligence)
- [Structure du projet](#-structure-du-projet)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## 🚀 À propos du Projet

**HotelVision** est une solution complète de gestion hôtelière nouvelle génération, alliant la puissance du MERN Stack (MongoDB, Express, React, Node.js) à des fonctionnalités avancées d'IA et de Business Intelligence.

### 🌟 Points Forts

- **Full-Stack Moderne** : Architecture MERN performante et évolutive
- **IA Intégrée** : Gemini AI pour les recommandations et génération de contenu
- **Business Intelligence** : Data Warehouse PostgreSQL + Tableaux de bord Power BI
- **Interface Utilisateur** : Design réactif avec Tailwind CSS
- **Sécurité** : Authentification JWT et gestion des rôles

### 🎯 Objectifs du Projet

Développé dans le cadre du module **Data Analytics & Business Intelligence** (5ème année Ingénierie Informatique), ce projet vise à :

- **Automatiser** la gestion hôtelière avec des workflows intelligents
- **Augmenter** le chiffre d'affaires grâce à des recommandations IA personnalisées
- **Optimiser** la prise de décision avec des tableaux de bord temps réel
- **Améliorer** l'expérience client avec un chatbot intelligent 24/7
- **Générer** du contenu marketing optimisé avec l'IA

---

##  Architecture

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  - Interface utilisateur (Clients & Admins)                 │
│  - Dashboard Power BI embarqué                              │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                │
│  - API RESTful                                              │
│  - Authentification JWT                                      │
│  - Gestion métier                                           │
└────────┬──────────────────────────────────┬────────────────┘
         │                                   │
         ▼                                   ▼
┌──────────────────┐              ┌──────────────────────────┐
│  MongoDB Atlas   │              │  Couche BI (PostgreSQL)  │
│  (OLTP - 1295    │              │  - Data Warehouse        │
│   documents)     │              │  - Modèle en étoile      │
└────────┬─────────┘              │  - 5 dimensions + 1 fait │
         │                        └──────────┬───────────────┘
         │ ETL Python                        │
         │ (Extraction, Transform, Load)     │
         └───────────────────────────────────▼
                              ┌─────────────────────┐
                              │    Power BI         │
                              │  - 3 pages          │
                              │  - 13 mesures DAX   │
                              │  - 14 visualisations│
                              └─────────────────────┘
```

### Architecture BI Détaillée

```
MongoDB (Source) → ETL Python → PostgreSQL DW → Power BI → React Frontend
    1295 docs        Pandas      983 rows      Dashboard    Embed iframe
                   transformations  5 dim + 1 fact  13 DAX    /bi-dashboard
```

---

## ✨ Fonctionnalités Avancées

### 🏠 Côté Client

#### 🔐 Authentification & Profil
- Inscription et connexion sécurisées (JWT)
- Gestion complète du profil utilisateur
- Historique des réservations et factures

#### 🏨 Recherche & Réservation
- Catalogue interactif d'hôtels et chambres
- Moteur de recherche avancé avec filtres
- Système de réservation en temps réel
- Gestion des services additionnels

#### 🤖 Expérience IA
- **Recommandations personnalisées** basées sur l'historique
- **Chatbot intelligent 24/7** pour l'assistance client
- **Notifications proactives** pour les offres spéciales
- **Contenu dynamique** généré par IA

### 👨‍💻 Côté Administration

#### 🎯 Gestion du Contenu
- Tableau de bord administrateur complet
- Gestion des hôtels avec prévisualisation en direct
- Gestion des chambres, tarifs et disponibilités
- Catalogue de services personnalisables

#### 📊 Business Intelligence
- **Tableaux de bord temps réel**
- **Analyse prédictive** des tendances
- **Rapports personnalisables**
- **Export des données** (PDF, Excel, CSV)

#### ⚙️ Administration Avancée
- Gestion des utilisateurs et permissions
- Paramètres système personnalisables
- Journal d'activité complet
- Sauvegardes automatisées

###  Couche Business Intelligence
- ✅ **ETL complet** : Extraction MongoDB → Transformation Python → Chargement PostgreSQL
- ✅ **Data Warehouse** : Modèle en étoile (5 dimensions + 1 table de faits)
- ✅ **Dashboard Power BI** : 3 pages interactives avec storytelling
- ✅ **Intégration React** : Dashboard embarqué via iframe sécurisé
- ✅ **Insights actionnables** : 5 insights clés identifiant +77K € CA potentiel

### 🤖 Intelligence Artificielle (Gemini API)
- ✅ **Recommandations personnalisées** : Analyse de l'historique et suggestions de chambres adaptées
- ✅ **Chatbot intelligent 24/7** : Assistant virtuel pour aide client et support technique
- ✅ **Génération automatique de descriptions** : Création de contenu marketing pour les chambres
- ✅ **Analyse des préférences** : Identification des patterns de réservation et services fréquents
- ✅ **Conseils intelligents** : Recommandations basées sur les données et meilleures pratiques

### 🤖 Fonctionnalités IA

### Intelligence Artificielle Intégrée

Le système intègre **Google Gemini API** pour offrir des fonctionnalités intelligentes avancées :

#### 🎯 **Recommandations Personnalisées**
- ✅ **Analyse comportementale** : Étude des historiques de réservation
- ✅ **Préférences automatiques** : Identification des types de chambres, budgets, services fréquents
- ✅ **Suggestion contextuelle** : Recommandations basées sur les disponibilités et profil utilisateur
- ✅ **Scoring intelligent** : Note de compatibilité pour chaque recommandation

#### 🤖 **Chatbot Intelligent 24/7**
- ✅ **Réponses contextuelles** : Adaptation selon le profil client et historique
- ✅ **Assistance multi-domaines** : Réservations, services, informations générales
- ✅ **Suggestions proactives** : Actions recommandées basées sur la conversation
- ✅ **Support multilingue** : Réponses en français avec ton professionnel

#### ✍️ **Génération Automatique de Contenu**
- ✅ **Descriptions IA pour chambres** : Création de contenu marketing attractif
- ✅ **Descriptions IA pour hôtels** : Génération automatique lors de la création
- ✅ **Contenu optimisé SEO** : Mots-clés et structure pour meilleur référencement
- ✅ **Personnalisation par étoiles** : Adaptation du ton selon catégorie d'hôtel

#### 📊 **Modèle IA Avancé**
- ✅ **Gemini 2.5 Flash** : Ultra-rapide et haute performance
- ✅ **Configuration optimisée** : Temperature 0.7, tokens max 4096
- ✅ **Fallback robuste** : Fonctions de secours si l'IA indisponible
- ✅ **Gestion d'erreurs** : Parsing intelligent et messages informatifs

#### 🛠️ **Administration IA**
- ✅ **Création augmentée** : Génération automatique de descriptions d'hôtels
- ✅ **Mise à jour IA** : Amélioration de contenu existant avec IA
- ✅ **Validation intelligente** : Vérification cohérence et qualité
- ✅ **Logging détaillé** : Traçabilité des opérations IA

---

## 🛠️ Stack Technologique

### 🌐 Frontend

#### Frameworks & Bibliothèques
- **React 18+** - Bibliothèque UI moderne
- **Redux Toolkit** - Gestion d'état avancée
- **React Router v6** - Navigation fluide
- **Axios** - Client HTTP intelligent
- **React Query** - Gestion des données côté client

#### Styling & UI
- **Tailwind CSS** - Framework CSS utilitaire
- **Headless UI** - Composants accessibles
- **Lucide Icons** - Bibliothèque d'icônes moderne
- **Framer Motion** - Animations fluides

### ⚙️ Backend

#### Core
- **Node.js 20+** - Runtime JavaScript
- **Express.js 4.x** - Framework web
- **MongoDB Atlas** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification sécurisée
- **Socket.IO** - Communication en temps réel

#### Sécurité & Performance
- **Helmet** - Sécurité HTTP
- **Rate Limiting** - Protection contre les attaques
- **Compression** - Optimisation des performances
- **Winston** - Journalisation avancée

### 🤖 Intelligence Artificielle
- **Google Gemini 2.5 Flash** - Modèle IA avancé
- **@google/generative-ai** - SDK officiel
- **Traitement du Langage Naturel** pour le chatbot
- **Génération de contenu** automatisée

### 📊 Business Intelligence
- **Python 3.11+** - Scripts ETL
- **Pandas & NumPy** - Traitement des données
- **PostgreSQL 18+** - Data Warehouse
- **Power BI** - Visualisation des données
- **DAX** - Formules avancées
- **Power Query** - Transformation des données

---

## 🚀 Installation Rapide

### 📋 Prérequis Système

- **Node.js** 18+ (LTS recommandé)
- **MongoDB Atlas** (ou local)
- **PostgreSQL** 16+
- **Python** 3.11+ (pour ETL)
- **Git**
- **Compte Google Cloud** (pour Gemini AI)

### 🛠️ Configuration Initiale

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/RaefGaied/HotelVision.git
   cd HotelVision
   ```

2. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Configurer les variables d'environnement
   npm install
   ```

3. **Frontend**
   ```bash
   cd ../frontend
   cp .env.example .env
   npm install
   ```

4. **Configuration IA**
   - Créer un projet sur [Google AI Studio](https://aistudio.google.com/)
   - Générer une clé API
   - Ajouter la clé dans `.env` du backend

### ⚙️ Configuration des Variables d'Environnement

**Backend (`.env`)**
```env
# MongoDB
MONGO_URI=votre_uri_mongodb

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=30d

# Google Gemini
GEMINI_API_KEY=votre_cle_api_gemini

# Serveur
PORT=5000
NODE_ENV=development
```

**Frontend (`.env`)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

### 🐳 Docker (Optionnel)

```bash
docker-compose up -d
```

> **Note** : Assurez-vous d'avoir Docker et Docker Compose installés

---

## 🚀 Démarrage de l'Application

### 1. Lancer le Serveur Backend

```bash
cd backend
npm run dev
```

### 2. Démarrer le Frontend

```bash
cd ../frontend
npm run dev
```

### 3. Initialiser le Data Warehouse (Optionnel)

```bash
cd backend/datawarehouse
python load_data_warehouse.py
```

### 4. Accès aux Interfaces

- **Application** : http://localhost:5173
- **API** : http://localhost:5000/api
- **Documentation API** : http://localhost:5000/api-docs
- **Admin** : http://localhost:5173/admin
- **Dashboard BI** : http://localhost:5173/dashboard

## 🔄 Workflow de Développement avec IA

### 🌳 Structure des Branches

```
master                    # Branche de production
├── develop             # Branche d'intégration
├── feature/*           # Nouvelles fonctionnalités
│   ├── feature/ai-*    # Fonctionnalités IA
│   ├── feature/bi-*    # Business Intelligence
│   └── feature/ui-*    # Interface utilisateur
├── bugfix/*            # Corrections de bugs
└── hotfix/*            # Correctifs urgents
```

### 🤖 Workflow IA Intégré

#### 1. **Développement de Fonctionnalités IA**
```bash
# Créer une branche pour une nouvelle fonctionnalité IA
git checkout -b feature/ai-recommendations

# Développer et tester localement
npm run dev:ai          # Lancer avec mode IA activé
npm test:ai            # Tests spécifiques IA

# Valider les réponses IA
npm run validate:ai    # Validation des prompts et réponses
```

#### 2. **Pipeline CI/CD avec IA**
```yaml
# .github/workflows/ai-integration.yml
name: AI Integration Tests
on: [push, pull_request]
jobs:
  ai-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run AI Model Tests
        run: npm run test:ai
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      - name: Validate AI Responses
        run: npm run validate:ai
```

#### 3. **Monitoring des Performances IA**
```bash
# Tests de performance des modèles IA
npm run benchmark:ai

# Analyse des coûts d'utilisation
npm run analyze:ai-costs

# Validation de la qualité des réponses
npm run quality:ai-check
```

### 🛠️ Commandes Utiles

#### Développement Standard
```bash
# Lancer les tests
npm test

# Lancer le linter
npm run lint

# Builder pour la production
npm run build

# Analyser le bundle
npm run analyze
```

#### Commandes IA Spécifiques
```bash
# Tester les fonctionnalités IA
npm run test:ai

# Valider les prompts Gemini
npm run validate:prompts

# Générer des données de test IA
npm run generate:mock-data

# Monitorer les performances IA
npm run monitor:ai

# Nettoyer le cache IA
npm run clean:ai-cache
```

### 🔄 Intégration Continue Avancée

Le projet utilise GitHub Actions pour :

#### 🤖 Tests Automatisés IA
- Validation des réponses Gemini
- Tests de cohérence des prompts
- Vérification des limites d'utilisation
- Analyse de la qualité du contenu généré

#### 📊 Monitoring et Qualité
- Tests de performance des modèles
- Analyse des coûts d'API
- Validation de la cohérence des réponses
- Détection d'anomalies dans les outputs IA

#### 🔒 Sécurité et Conformité
- Validation des clés API
- Tests de rate limiting
- Vérification des permissions IA
- Audit des accès aux services IA

### 📈 Workflow de Déploiement

#### 1. **Développement Local**
```bash
# Mode développement avec IA
npm run dev:ai

# Tests complets
npm run test:full

# Validation avant commit
npm run pre-commit
```

#### 2. **Intégration Continue**
- Tests unitaires et IA
- Validation des prompts
- Analyse de performance
- Sécurité et conformité

#### 3. **Déploiement en Production**
- Validation finale IA
- Monitoring activé
- Alertes configurées
- Rollback automatique en cas d'anomalie

### 🎯 Bonnes Pratiques IA

#### 📝 Gestion des Prompts
- Versionner tous les prompts dans `/prompts/`
- Tester les variations de prompts
- Documenter les performances par version
- Maintenir un registre des changements

#### 🔄 Gestion des Erreurs IA
- Implémenter des fallbacks robustes
- Logger toutes les erreurs IA
- Monitorer les taux d'échec
- Alerter en cas de dégradation

#### 💡 Optimisation des Coûts
- Monitorer la consommation d'API
- Implémenter du caching intelligent
- Optimiser la taille des prompts
- Utiliser des modèles adaptés aux cas d'usage

---

##  Utilisation

### Démarrage rapide

**Terminal 1 - Backend :**
```bash
cd backend
npm start
# Serveur démarré sur http://localhost:5000
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
# Application disponible sur http://localhost:5173
```

### Accès à l'application

- **Page d'accueil** : http://localhost:5173
- **Connexion** : http://localhost:5173/login
- **Inscription** : http://localhost:5173/register
- **Dashboard BI (Admin)** : http://localhost:5173/bi-dashboard

### Comptes de test

**Admin :**
- Email : `admin@hotelvision.com`
- Mot de passe : `Admin123!`

**Client :**
- Email : `client@hotelvision.com`
- Mot de passe : `Client123!`

---

## Couche Business Intelligence

### Architecture ETL

```
EXTRACTION (MongoDB)
   ├── 1295 documents extraits
   ├── 7 collections : réservations, clients, hotels, chambres, etc.
   └── Export JSON

TRANSFORMATION (Python Pandas)
   ├── Nettoyage : Détection outliers (IQR), remplacement médiane
   ├── Enrichissement : Ajout dimensions (ville, type, durée)
   ├── Parsing : Services JSON → Comptage ObjectId
   └── 7 CSV générés + 3 pivots Excel + 4 visualisations

CHARGEMENT (PostgreSQL)
   ├── 983 rows insérées
   ├── Modèle en étoile : 5 dimensions + 1 fait
   └── 15 indexes pour performance
```

### Data Warehouse : Modèle en Étoile

**Dimensions (5) :**
- `dim_temps` (137 dates) - Calendrier
- `dim_hotels` (20 hôtels) - Établissements avec étoiles 3-5
- `dim_chambres` (610 chambres) - 4 types (SIMPLE, DOUBLE, SUITE, DELUXE)
- `dim_clients` (101 clients) - Base clients
- `dim_statut` (5 statuts) - États des réservations

**Faits (1) :**
- `fait_reservations` (142 réservations) - Transactions avec métriques

**Vues analytiques (2) :**
- `v_analyse_reservations` - Vue dénormalisée pour Power BI
- `v_statistiques_dw` - KPIs agrégés

### Dashboard Power BI

**3 Pages avec storytelling narratif :**

**Page 1 - Dashboard Overview (État des lieux)**
- 7 KPIs principaux : 256K € CA, 142 réservations, 1802 € moyenne
- Line Chart : Saisonnalité sur 6 mois
- Bar Chart : Performance géographique (14 villes)

**Page 2 - Detailed Analysis (Analyse approfondie)**
- 4 Slicers interactifs : étoiles, année, ville, type
- Pie Chart : Répartition CA par type de chambre
- Matrix : 20 hôtels × 4 types
- Clustered Column Chart : Volume vs Valeur

**Page 3 - Executive Summary (Synthèse stratégique)**
- 4 Cards + 3 Gauges avec targets
- Table enrichie : ville, CA, contribution %, ranking, rating, badge
- 13 mesures DAX avancées (RANKX, SWITCH, DIVIDE, ALL)

### 5 Insights Clés

1. **Lyon 17%** : Ville leader (43K €), autant que les 5 dernières villes réunies
2. **DOUBLE 34%** : Produit star avec 87K € (2069 € moy. vs 1802 € global)
3. **30% sans services** : 42 clients = 76K € CA potentiel perdu
4. **Octobre -36%** : Creux saisonnier avec 18K € perdus
5. **Top 3 = 42%** : Concentration Lyon + Megève + Nice (108K €)

### Accès au Dashboard

Le dashboard Power BI est intégré dans l'application React et accessible uniquement aux **administrateurs** via :
```
http://localhost:5173/bi-dashboard
```

## Structure du projet

```
HotelVision/
├── backend/
│   ├── config/
│   │   └── db.js                      # Connexion MongoDB
│   ├── controllers/
│   │   ├── adminController.js         # Stats admin
│   │   ├── chambreController.js       # Gestion chambres
│   │   ├── factureController.js       # Factures
│   │   ├── reservationController.js   # Réservations
│   │   └── userController.js          # Authentification
│   ├── middleware/
│   │   ├── admin.js                   # Vérification rôle admin
│   │   └── auth.js                    # Vérification JWT
│   ├── models/
│   │   ├── Chambre.js                 # Schéma MongoDB
│   │   ├── Facture.js
│   │   ├── Reservation.js
│   │   ├── Service.js
│   │   └── User.js
│   ├── routes/
│   │   ├── chambreRoutes.js           # Routes API
│   │   ├── factureRoutes.js
│   │   ├── reservationRoutes.js
│   │   └── userRoutes.js
│   ├── datawarehouse/                 # COUCHE BI
│   │   ├── schema_star.sql            # Schéma PostgreSQL
│   │   ├── load_data_warehouse.py     # ETL complet
│   │   ├── reload_facts.py            # Rechargement faits
│   │   ├── fix_encoding.py            # Fix UTF-8
│   │   └── STORYTELLING_DASHBOARD.md  # Documentation
│   ├── .env                           # Variables environnement
│   ├── package.json
│   └── server.js                      # Point d'entrée
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── PowerBIDashboard.jsx    #  Dashboard BI
│   │   │   │   └── PowerBIDashboard.css
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Loading.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ChambresPage.jsx
│   │   │   ├── HotelsPage.jsx
│   │   │   ├── ReservationsPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   └── ClientDashboard.jsx
│   │   ├── services/
│   │   │   ├── apiClient.js           # Axios + intercepteurs
│   │   │   ├── userService.js
│   │   │   ├── chambreService.js
│   │   │   └── reservationService.js
│   │   ├── store/
│   │   │   ├── store.js               # Redux store
│   │   │   └── authSlice.js           # Auth state
│   │   ├── routes/
│   │   │   └── PrivateRoute.jsx       # Route protégée
│   │   ├── App.jsx                    # Routing principal
│   │   └── main.jsx                   # Point d'entrée
│   ├── .env                           # Variables environnement
│   ├── package.json
│   └── vite.config.js
│
├── GUIDE_SOUTENANCE_5MIN.md           # Guide présentation
├── INTEGRATION_POWERBI_GUIDE.md       #  Guide intégration
├── Gestion_Hoteliere_Dashboard.pbix   #  Fichier Power BI
└── README.md                          #  Ce fichier
```

---

## 🌐 API Documentation

### 🔐 Authentification

```http
POST   /api/auth/register          # Créer un compte
POST   /api/auth/login             # Se connecter
GET    /api/auth/me                # Profil utilisateur
PUT    /api/auth/update-profile    # Mettre à jour le profil
POST   /api/auth/refresh-token     # Rafraîchir le token
POST   /api/auth/logout            # Se déconnecter
```

### 🏨 Hôtels

```http
GET    /api/hotels                 # Liste des hôtels
POST   /api/hotels                 # Créer un hôtel (Admin)
GET    /api/hotels/:id             # Détails d'un hôtel
PUT    /api/hotels/:id             # Mettre à jour un hôtel (Admin)
DELETE /api/hotels/:id             # Supprimer un hôtel (Admin)
POST   /api/hotels/:id/generate-description  # Générer description IA (Admin)
```

### 🛏️ Chambres

```http
GET    /api/rooms                  # Liste des chambres
POST   /api/rooms                  # Créer une chambre (Admin)
GET    /api/rooms/:id              # Détails d'une chambre
PUT    /api/rooms/:id              # Mettre à jour une chambre (Admin)
DELETE /api/rooms/:id              # Supprimer une chambre (Admin)
GET    /api/rooms/available        # Chambres disponibles
```

### 📅 Réservations

```http
GET    /api/bookings               # Mes réservations
POST   /api/bookings               # Créer une réservation
GET    /api/bookings/:id           # Détails d'une réservation
PUT    /api/bookings/:id/cancel    # Annuler une réservation
GET    /api/admin/bookings         # Toutes les réservations (Admin)
```

### 🤖 IA & Recommandations

```http
POST   /api/ai/chat                # Chatbot IA
GET    /api/ai/recommendations     # Recommandations personnalisées
POST   /api/ai/generate-content    # Génération de contenu IA
```

### 📊 Statistiques (Admin)

```http
GET    /api/stats/overview         # Aperçu général
GET    /api/stats/revenue          # Chiffre d'affaires
GET    /api/stats/occupancy        # Taux d'occupation
GET    /api/stats/customers        # Statistiques clients
```

> **Note** : Toutes les routes nécessitent une authentification sauf indication contraire. Les routes marquées (Admin) nécessitent des privilèges d'administrateur.

### 🔄 Réponses API

#### Succès (200)
```json
{
  "success": true,
  "data": {},
  "message": "Opération réussie"
}
```

#### Erreur (400-500)
```json
{
  "success": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "Identifiants invalides",
    "details": {}
  }
}
```

---

##  Screenshots

### Page d'accueil
![Homepage](screenshots/homepage.png)

### Dashboard Admin
![Admin Dashboard](screenshots/admin-dashboard.png)

### Dashboard Business Intelligence
![Power BI Dashboard](screenshots/powerbi-dashboard.png)

---

##  Contribuer

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créez** votre branche (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request
### Règles de contribution

- Suivre les conventions de code existantes
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation si nécessaire
- Respecter le code de conduite du projet



##  Auteur

**Raef Gaied**
- GitHub : [@raefgaied](https://github.com/RaefGaied/)
- Email : raefghanem18@gmail.com

---

