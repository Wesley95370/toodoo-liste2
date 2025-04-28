
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Yup = require('yup');
const pool = require('../config/db');

// Schéma de validation Yup pour l'inscription
const registerSchema = Yup.object({
  username: Yup.string().min(3).required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
});

// Schéma de validation Yup pour la connexion
const loginSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

const userController = {
  async register(req, res) {
    try {
      console.log('Requête reçue pour /register:', req.body);
      await registerSchema.validate(req.body, { abortEarly: false });

      const { username, email, password } = req.body;

      const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword]
      );

      res.status(201).json({ user: newUser.rows[0], message: 'Utilisateur créé avec succès.' });
    } catch (error) {
      console.error('Erreur dans register:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.errors.join(', ') });
      }
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  async login(req, res) {
    try {
      console.log('Requête reçue pour /login:', req.body);
      await loginSchema.validate(req.body, { abortEarly: false });

      const { email, password } = req.body;

      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const token = jwt.sign(
        { id: user.rows[0].id, email: user.rows[0].email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
    } catch (error) {
      console.error('Erreur dans login:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.errors.join(', ') });
      }
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      res.json(user.rows[0]);
    } catch (error) {
      console.error('Erreur dans getUserById:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
};

module.exports = userController;
