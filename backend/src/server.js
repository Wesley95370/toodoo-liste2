/* eslint-disable */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
// const csurf = require('csurf');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
require('dotenv').config();

const app = express();

// Middleware pour parser les corps JSON
app.use(express.json());

// Configuration CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://frontend:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Middlewares de sécurité
app.use(helmet());
app.use(cookieParser());

// Middleware pour journaliser les requêtes (APRES express.json())
app.use((req, res, next) => {
  console.log('Requête reçue:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    cookies: req.cookies
  });
  next();
});

// CSRF désactivé
// const csrfProtection = csurf({ cookie: { httpOnly: true, secure: false } });
// app.use(csrfProtection);

// Route pour fournir le jeton CSRF (simulé)
app.get('/api/csrf-token', (req, res) => {
  console.log('Requête reçue pour /api/csrf-token depuis:', req.get('Origin'));
  res.json({ csrfToken: 'disabled' });
});

// Route de santé
app.get('/api/health', (req, res) => {
  console.log('Requête reçue pour /api/health');
  res.json({ message: 'Serveur OK' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  if (err.code === 'EBADCSRFTOKEN') {
    console.log('Erreur CSRF: Jeton invalide pour requête:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
    return res.status(403).json({ message: 'Jeton CSRF invalide.' });
  }
  res.status(500).json({ message: 'Erreur serveur.', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;