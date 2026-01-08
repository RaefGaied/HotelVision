<<<<<<< HEAD

# Connecty - Social Media App (MERN)

Connecty est une application MERN complète (MongoDB, Express, React, Node.js) permettant de créer un réseau social moderne avec gestion des utilisateurs, posts, commentaires, amis, et vérification par email.

## Fonctionnalités principales
- Authentification et vérification email
- Création et gestion de profil utilisateur
- Ajout d'amis, envoi et gestion des demandes
- Création, modification, suppression de posts
- Commentaires et likes sur les posts
- Thème clair/sombre
- Responsive design

## Features avancées
- Users can sign up by providing their email address and other required details.
- Email verification is implemented to ensure the security and legitimacy of user accounts.
- Once verified, users can easily log in to the app.
- Users can create and customize their profiles, adding personal information and profile pictures.
- Responsive web design for desktop and mobile.
- Users can switch between dark and light themes.
- Connect with friends by sending and receiving friend requests.
- Accept or deny friend requests.
- Like, comment, and reply to posts.
- Upload and share photos.
- Write and publish posts.
- Interact with posts through likes and comments.

## Technologies
- Frontend : React, Vite, Redux, TailwindCSS
- Backend : Node.js, Express, MongoDB
- Authentification : JWT, Nodemailer

## Modélisation & Relations Clés
| Relation | Type | Description |
| --- | --- | --- |
| User ↔ Profile | 1–1 | Chaque utilisateur possède un profil détaillé (`Users.profile` ↔ `Profiles.user`). |
| User ↔ Posts | 1–N | Un utilisateur peut créer plusieurs posts (`Posts.userId`). |
| Post ↔ Comments | 1–N | Un post agrège plusieurs commentaires et réponses (`Comments.postId`, `Comments.replies`). |
| User ↔ User (Friends) | N–N | Les amitiés sont gérées via `FriendRequest` puis synchronisées dans `Users.friends`. |
| User ↔ Post (Likes) | N–N | Les likes d’un post stockent les identifiants utilisateurs (`Posts.likes`). |

Le rapport (voir `rapport.md`) contient un diagramme ER détaillant ces entités et leurs attributs afin de répondre aux exigences du cahier des charges MERN.

## Installation
- Clonez le dépôt :
	```bash
	git clone https://github.com/RaefGaied/Connecty.git
	```
- Installez les dépendances dans backend et frontend :
	```bash
	cd backend && npm install
	cd ../frontend && npm install
	```
- Configurez les variables d'environnement dans backend/.env
- Lancez le backend :
	```bash
	npm start
	```
- Lancez le frontend :
	```bash
	npm run dev
	```

## Diagramme ER et rapport
Voir le fichier rapport.md pour le diagramme des entités et relations.

## Liens utiles
- Démo : https://connectify-social-reactapp.netlify.app/
- Vidéo : https://youtu.be/1hzwcmaf3jw?si=Xr0fS9mV4XWbKdcz
