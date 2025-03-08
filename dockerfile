# Étape 1 : Utiliser une image de base pour Node.js
FROM node:16

# Étape 2 : Définir le répertoire de travail
WORKDIR /app

# Étape 3 : Copier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier tout le code source de l'application dans le conteneur
COPY . .

# Étape 6 : Exposer le port sur lequel l'application écoute
EXPOSE 3000

# Étape 7 : Lancer l'application
CMD ["npm", "start"]
