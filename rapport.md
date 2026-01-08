# Rapport Technique – Modélisation MERN

## Diagramme ER

```mermaid
erDiagram
    USERS ||--|| PROFILES : "possède"
    USERS ||--o{ POSTS : "crée"
    POSTS ||--o{ COMMENTS : "contient"
    USERS ||--o{ COMMENTS : "écrit"
    USERS ||--o{ FRIENDREQUESTS : "émet/reçoit"
    USERS }o--o{ USERS : "amis (via FriendRequest)"
    USERS }o--o{ POSTS : "aime"
    POSTS ||--o{ COMMENTS : "reçoit"

    USERS {
        ObjectId _id PK
        String firstName
        String lastName
        String email
        String password
        ObjectId profile FK
        ObjectId[] friends
        Boolean verified
    }

    PROFILES {
        ObjectId _id PK
        ObjectId user FK
        String displayName
        String bio
        String avatar
        String profession
        String location
        String[] skills
        String[] interests
    }

    POSTS {
        ObjectId _id PK
        ObjectId userId FK
        String description
        String image
        String[] likes
        ObjectId[] comments
    }

    COMMENTS {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId postId FK
        String comment
        String[] likes
        Reply[] replies
    }

    FRIENDREQUESTS {
        ObjectId _id PK
        ObjectId requestFrom FK
        ObjectId requestTo FK
        String requestStatus
    }
```

### Relations clés
1. **User ↔ Profile (1‑1)** : garantit qu’un seul profil est associé à chaque utilisateur (contrainte `unique: true` dans `Users.profile` et `Profiles.user`).  
2. **User ↔ Posts (1‑N)** : un utilisateur peut créer plusieurs publications (`Posts.userId`).  
3. **Post ↔ Comments (1‑N)** : chaque post agrège plusieurs commentaires (`Comments.postId`).  
4. **User ↔ User (N‑N)** : les relations d’amitié sont matérialisées via `FriendRequest` puis stockées dans `Users.friends`.  
5. **User ↔ Post (N‑N)** : les likes utilisent un tableau d’identifiants utilisateurs pour chaque post (`Posts.likes`).  

> Export suggéré : convertir ce rapport Markdown en PDF (via pandoc, typst ou export VSCode) afin de respecter la consigne « mini rapport PDF ».
