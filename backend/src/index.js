/* eslint-disable */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
require('dotenv').config();

const app = express();

// Configuration des middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // URL de ton frontend
  credentials: true
}));
app.use(helmet()); // Sécurisation des en-têtes HTTP

// Limite de requêtes (100 requêtes par IP toutes les 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Protection CSRF
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// Route pour fournir le jeton CSRF au frontend
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur.' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Serveur démarré sur le port ${PORT}`);
});