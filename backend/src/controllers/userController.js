
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Yup = require('yup');
const pool = require('../config/db');

// Schéma de validation Yup pour l'inscription
const registerSchema = Yup.object({
  username: Yup.string().min(3).required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(12).required(),
});

// Schéma de validation Yup pour la connexion
const loginSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(12).required(),
});

// Schéma de validation Yup pour la mise à jour de l'utilisateur
const updateUserSchema = Yup.object({
  email: Yup.string().email().optional(),
  password: Yup.string().min(12).optional(),
});

const userController = {
  async register(req, res) {
    try {
      console.log('Requête reçue pour /register:', {
        body: req.body,
        headers: req.headers,
        cookies: req.cookies
      });
      await registerSchema.validate(req.body, { abortEarly: false });

      const { username, email, password } = req.body;
      console.log('Données validées pour inscription:', { username, email });

      const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      console.log('Vérification email existant:', { email, exists: emailExists.rows.length > 0 });

      if (emailExists.rows.length > 0) {
        console.log('Email déjà utilisé:', email);
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Mot de passe haché pour:', email);

      const newUser = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword]
      );
      console.log('Nouvel utilisateur créé:', newUser.rows[0]);

      res.status(201).json({ user: newUser.rows[0], message: 'Utilisateur créé avec succès.' });
    } catch (error) {
      console.error('Erreur dans register:', error);
      if (error.name === 'ValidationError') {
        console.log('Erreur de validation Yup:', error.errors);
        return res.status(400).json({ message: error.errors.join(', ') });
      }
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  },

  async login(req, res) {
    try {
      console.log('Requête reçue pour /login:', {
        body: req.body,
        headers: req.headers,
        cookies: req.cookies
      });
      await loginSchema.validate(req.body, { abortEarly: false });
      console.log('Données validées pour connexion:', req.body);

      const { email, password } = req.body;
      console.log('Tentative de connexion avec email:', email);

      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      console.log('Résultat de la requête utilisateur:', {
        email,
        found: user.rows.length > 0,
        user: user.rows[0] ? { id: user.rows[0].id, email: user.rows[0].email, username: user.rows[0].username } : null
      });

      if (user.rows.length === 0) {
        console.log('Utilisateur non trouvé pour email:', email);
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      console.log('Validité du mot de passe:', { email, valid: validPassword });

      if (!validPassword) {
        console.log('Mot de passe incorrect pour email:', email);
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const token = jwt.sign(
        { id: user.rows[0].id, email: user.rows[0].email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      console.log('Token JWT généré pour:', { email, token });

      res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
    } catch (error) {
      console.error('Erreur dans login:', error);
      if (error.name === 'ValidationError') {
        console.log('Erreur de validation Yup:', error.errors);
        return res.status(400).json({ message: error.errors.join(', ') });
      }
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      console.log('Requête reçue pour /getUserById:', {
        params: req.params,
        headers: req.headers,
        user: req.user
      });

      const { id } = req.params;
      console.log('Recherche utilisateur avec ID:', id);

      const user = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
      console.log('Résultat de la requête utilisateur:', { id, found: user.rows.length > 0 });

      if (user.rows.length === 0) {
        console.log('Utilisateur non trouvé pour ID:', id);
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      res.json(user.rows[0]);
    } catch (error) {
      console.error('Erreur dans getUserById:', error);
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      console.log('Requête reçue pour /update:', {
        body: req.body,
        headers: req.headers,
        user: req.user,
        cookies: req.cookies
      });
      await updateUserSchema.validate(req.body, { abortEarly: false });
      console.log('Données validées pour mise à jour:', req.body);

      const { email, password } = req.body;
      const userId = req.user.id;
      console.log('Mise à jour demandée pour utilisateur ID:', userId);

      const updates = {};
      if (email) updates.email = email;
      if (password) updates.password = await bcrypt.hash(password, 10);
      console.log('Mises à jour à appliquer:', updates);

      if (Object.keys(updates).length === 0) {
        console.log('Aucune modification fournie pour ID:', userId);
        return res.status(400).json({ message: 'Aucune modification fournie.' });
      }

      if (email) {
        const emailExists = await pool.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, userId]);
        console.log('Vérification email existant:', { email, exists: emailExists.rows.length > 0 });
        if (emailExists.rows.length > 0) {
          console.log('Email déjà utilisé:', email);
          return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }
      }

      const query = `
        UPDATE users 
        SET email = COALESCE($1, email), password = COALESCE($2, password)
        WHERE id = $3
        RETURNING id, username, email
      `;
      const values = [updates.email || null, updates.password || null, userId];
      console.log('Exécution de la requête UPDATE pour ID:', userId);

      const updatedUser = await pool.query(query, values);
      console.log('Utilisateur mis à jour:', updatedUser.rows[0]);

      if (updatedUser.rows.length === 0) {
        console.log('Utilisateur non trouvé pour ID:', userId);
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      res.json({ user: updatedUser.rows[0], message: 'Informations mises à jour avec succès.' });
    } catch (error) {
      console.error('Erreur dans updateUser:', error);
      if (error.name === 'ValidationError') {
        console.log('Erreur de validation Yup:', error.errors);
        return res.status(400).json({ message: error.errors.join(', ') });
      }
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      console.log('Requête reçue pour /delete:', {
        headers: req.headers,
        user: req.user,
        cookies: req.cookies
      });

      const userId = req.user.id;
      console.log('Suppression demandée pour utilisateur ID:', userId);

      console.log('Suppression des tâches associées pour ID:', userId);
      await pool.query('DELETE FROM tasks WHERE user_id = $1', [userId]);

      console.log('Suppression de l’utilisateur ID:', userId);
      const deletedUser = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

      if (deletedUser.rows.length === 0) {
        console.log('Utilisateur non trouvé pour ID:', userId);
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      console.log('Utilisateur supprimé avec succès:', userId);
      res.json({ message: 'Compte supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur dans deleteUser:', error);
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  },
};

module.exports = userController;