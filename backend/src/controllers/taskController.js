const Yup = require('yup');
const pool = require('../config/db');

// Schéma de validation Yup pour une tâche
const taskSchema = Yup.object({
  title: Yup.string().required(),
  description: Yup.string().nullable()
});

const taskController = {
  // Créer une tâche
  async createTask(req, res) {
    try {
      await taskSchema.validate(req.body);

      const { title, description } = req.body;
      const userId = req.user.id; // Récupéré depuis le middleware d'authentification

      const newTask = await pool.query(
        'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, description, userId]
      );

      res.status(201).json({ task: newTask.rows[0], message: 'Tâche créée avec succès.' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Récupérer toutes les tâches d’un utilisateur
  async getTasksByUser(req, res) {
    try {
      const userId = req.user.id;
      const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      res.json(tasks.rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour une tâche
  async updateTask(req, res) {
    try {
      await taskSchema.validate(req.body);

      const { id } = req.params;
      const { title, description, is_done } = req.body;
      const userId = req.user.id;

      const task = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
      if (task.rows.length === 0) {
        return res.status(404).json({ message: 'Tâche non trouvée ou non autorisée.' });
      }

      const updatedTask = await pool.query(
        'UPDATE tasks SET title = $1, description = $2, is_done = $3 WHERE id = $4 RETURNING *',
        [title, description, is_done, id]
      );

      res.json({ task: updatedTask.rows[0], message: 'Tâche mise à jour avec succès.' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Supprimer une tâche
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const task = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
      if (task.rows.length === 0) {
        return res.status(404).json({ message: 'Tâche non trouvée ou non autorisée.' });
      }

      await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      res.json({ message: 'Tâche supprimée avec succès.' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = taskController;