# Connectify - Social Media App (MERN)

Introducing the Connectify App— a meticulously crafted, full-stack MERN-based platform designed to seamlessly foster connections, passionately share cherished memories through photos, and facilitate profound interactions. This innovative application has been thoughtfully and purposefully designed to deliver users an effortlessly gratifying social networking experience

## Live at - https://connectify-social-reactapp.netlify.app/
## Video Demo - https://youtu.be/1hzwcmaf3jw?si=Xr0fS9mV4XWbKdcz

## Features

### User Authentication
- Users can sign up by providing their email address and other required details.
- Email verification is implemented to ensure the security and legitimacy of user accounts.
- Once verified, users can easily log in to the app.

### Social Networking
- Users can create and customize their profiles, adding personal information and profile pictures.
- A responsive web design ensures a smooth experience on both desktop and mobile devices.
- Users can switch between dark and light themes, enhancing user experience.

### Friendship and Interaction
- Connect with friends by sending and receiving friend requests.
- Accept or deny friend requests as per your preferences.
- Stay connected with friends by liking, commenting on, and replying to their posts.

### Media Sharing
- Users can upload and share photos.
- Write and publish posts to keep friends updated with your thoughts and activities.
- Interact with posts through likes and comments, fostering a sense of community.

## Technologies Used
- Frontend: ReactJS, Vite, Redux for state management, TailwindCSS for UI components.
- Backend: Node.js, Express.js, MongoDB for database storage.
- Authentication: JWT (JSON Web Tokens) for secure user authentication, Nodemailer for sending mail for email verification
- Responsive Design: CSS and media queries for responsive web design.

## Modélisation & Relations Clés

| Relation | Type | Description |
| --- | --- | --- |
| User ↔ Profile | 1‑1 | Chaque utilisateur possède un profil détaillé (`Users.profile` ↔ `Profiles.user`). |
| User ↔ Posts | 1‑N | Un utilisateur peut créer plusieurs posts (`Posts.userId`). |
| Post ↔ Comments | 1‑N | Un post agrège plusieurs commentaires et réponses (`Comments.postId`, `Comments.replies`). |
| User ↔ User (Friends) | N‑N | Les amitiés sont gérées via `FriendRequest` puis synchronisées dans `Users.friends`. |
| User ↔ Post (Likes) | N‑N | Les likes d’un post stockent les identifiants utilisateurs (`Posts.likes`). |

Le rapport (voir `rapport.md`) contient un diagramme ER détaillant ces entités et leurs attributs afin de répondre aux exigences du cahier des charges MERN.

## Installation
- Clone the repository.
- Navigate to the project directory.
- Run npm install to install the dependencies.
- Set up environment variables for authentication and database connection.
- Run the app using npm start.
