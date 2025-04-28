/* eslint-disable */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const app = express();

// Configuration des middlewares
app.use(express.json());
app.use(cookieParser());
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
app.use(helmet());

// Limite de requêtes (désactivée pour tester)
// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// app.use(limiter);

// Route de test
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Serveur OK' });
});

// Initialisation du middleware CSRF
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: false } });

// Route pour fournir le jeton CSRF
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  try {
    console.log('Requête reçue pour /api/csrf-token depuis:', req.get('Origin'));
    const token = req.csrfToken();
    console.log('Jeton CSRF généré:', token);
    res.json({ csrfToken: token });
  } catch (err) {
    console.error('Erreur dans /api/csrf-token:', err);
    res.status(500).json({ message: 'Erreur lors de la génération du jeton CSRF.', error: err.message });
  }
});

// Protection CSRF pour les autres routes
app.use(csrfProtection);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Route racine
app.get('/', (req, res) => {
  res.send('API To-Do List is running');
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Jeton CSRF invalide.' });
  }
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur.', error: err.message });


});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});