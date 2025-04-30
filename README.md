ToodooListe
ToodooListe est une application de gestion de tâches avec une interface utilisateur React et une API RESTful Node.js. Elle permet aux utilisateurs de s'inscrire, se connecter, gérer leurs tâches, et récupérer la liste des utilisateurs. L'application utilise PostgreSQL pour le stockage des données et est déployée via Docker.
Fonctionnalités

Inscription et connexion sécurisées avec JWT et CSRF.
Gestion des tâches (création, mise à jour, suppression).
Récupération de la liste des utilisateurs (administrateurs uniquement).
Déploiement via Docker avec images frontend et backend.

Prérequis

Docker et Docker Compose
Node.js (optionnel, pour développement local hors Docker)
Compte Docker Hub pour tirer les images

Installation

Cloner le dépôt :
git clone <url-du-dépôt>
cd toodoo-liste


Configurer les variables d'environnement :

Crée backend/.env avec :DATABASE_URL=postgres://postgres:password123@postgres:5432/todoo_db
JWT_SECRET=ton_secret_ici


Crée frontend/.env (optionnel, si variables spécifiques) :VITE_API_URL=http://localhost:5000




Lancer l'application avec Docker :
docker-compose up --pull


Cela télécharge les images kevinjerome953/todolist-frontend:latest et kevinjerome953/todolist-backend:latest depuis Docker Hub.
L'application est disponible sur :
Frontend : http://localhost:3000
Backend API : http://localhost:5000




Arrêter l'application :
docker-compose down



Structure du projet

frontend/ : Application React (interface utilisateur)
backend/ : API Node.js avec Express
docker-compose.yml : Configuration Docker pour frontend, backend, et PostgreSQL
backend/src/ :
controllers/userController.js : Logique des utilisateurs (inscription, connexion, etc.)
routes/userRoutes.js : Routes API
middleware/auth.js : Authentification JWT



Base de données

Nom : todoo_db
Tables :
users : Stocke les informations des utilisateurs (id, username, email, password, created_at)
tasks : Stocke les tâches (id, user_id, title, description, completed, created_at)


Accès :docker exec -it toodoo-liste-postgres-1 psql -U postgres -d todoo_db

Exemple :\dt
SELECT * FROM users;



API Endpoints
Authentification

POST /api/users/register

Inscription d'un nouvel utilisateur
Body : { "username": "testuser", "email": "test@example.com", "password": "TestPassword123@" }
Réponse : { "user": { "id": 1, "username": "testuser", "email": "test@example.com" }, "message": "Utilisateur créé avec succès." }


POST /api/users/login

Connexion d'un utilisateur
Body : { "email": "test@example.com", "password": "TestPassword123@" }
Réponse : { "token": "<jwt>", "user": { "id": 1, "username": "testuser", "email": "test@example.com" } }



Utilisateurs

GET /api/users
Récupère tous les utilisateurs (nécessite JWT)
Headers : Authorization: Bearer <jwt>
Réponse : [{ "id": 1, "username": "testuser", "email": "test@example.com", "created_at": "..." }, ...]



Développement local (sans Docker)

Frontend :
cd frontend
npm install
npm start


Accessible sur http://localhost:3000


Backend :
cd backend
npm install
npm start


API accessible sur http://localhost:5000


PostgreSQL :

Installe PostgreSQL localement.
Crée la base todoo_db :psql -U postgres
CREATE DATABASE todoo_db;


Configure backend/.env avec DATABASE_URL=postgres://postgres:password123@localhost:5432/todoo_db.



Problèmes courants

Page blanche sur le frontend :

Vérifie que frontend/src/components/Connexion.jsx n'utilise pas reCAPTCHA.
Supprime REACT_APP_RECAPTCHA_SITE_KEY de frontend/.env.


Erreur ECONNRESET sur GET /api/users :

Vérifie backend/src/routes/userRoutes.js pour router.get('/users', authMiddleware, userController.getAllUsers);.
Utilise un token JWT valide.


Base de données vide :

Crée les tables users et tasks :CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





Contribuer

Fork le dépôt.
Crée une branche : git checkout -b feature/nouvelle-fonctionnalité.
Commit tes changements : git commit -m "Ajout de ..."
Push vers la branche : git push origin feature/nouvelle-fonctionnalité.
Ouvre une Pull Request.

Auteurs

Kevin Jerome - Développeur principal

Licence
Ce projet est sous licence MIT.
