# Mon Vieux Grimoire - Back-end d'un site de notation de livres

Projet réalisé dans le cadre de la formation Développeur Web d'OpenClassrooms : développement du back-end (API REST) d'un site de référencement et de notation de livres.

## Technologies
Node.js, Express, MongoDB

## Lancer le projet en local

1. Démarrez le front-end :

        cd .\frontend\
        npm install
        npm start

2. Démarrez le back-end :

        cd .\backend\
        npm install
        nodemon server

## Variables d'environnement :
- accès données base de données
- token d'authentification
   
Créez un fichier `.env` dans `backend/` :

    MONGODB_URI=valeur-uri-mongodb
    JWT_SECRET=valeur-secret-jwt  
