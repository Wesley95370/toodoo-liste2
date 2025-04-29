const pool = require('../config/db');

const taskController = {
  async getTasksByUser(req, res) {
    try {
      const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [req.user.id]);
      console.log('Tâches récupérées pour user_id:', req.user.id);
      res.json(tasks.rows);
    } catch (error) {
      console.error('Erreur dans getTasksByUser:', error);
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  },

  async createTask(req, res) {
    try {
      const { title, description } = req.body;
      console.log('Création tâche pour user_id:', req.user.id, { title, description });
      const newTask = await pool.query(
        'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, title, description]
      );
      res.status(201).json(newTask.rows[0]);
    } catch (error) {
      console.error('Erreur dans createTask:', error);
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  },

  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { title, description, is_done } = req.body;
      console.log('Mise à jour tâche ID:', id, 'pour user_id:', req.user.id);
      const updatedTask = await pool.query(
        'UPDATE tasks SET title = $1, description = $2, is_done = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
        [title, description, is_done, id, req.user.id]
      );
      if (updatedTask.rows.length === 0) {
        console.log('Tâche non trouvée pour ID:', id);
        return res.status(404).json({ message: 'Tâche non trouvée.' });
      }
      res.json(updatedTask.rows[0]);
    } catch (error) {
      console.error('Erreur dans updateTask:', error);
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  },

  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      console.log('Suppression tâche ID:', id, 'pour user_id:', req.user.id);
      const deletedTask = await pool.query(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, req.user.id]
      );
      if (deletedTask.rows.length === 0) {
        console.log('Tâche non trouvée pour ID:', id);
        return res.status(404).json({ message: 'Tâche non trouvée.' });
      }
      res.json({ message: 'Tâche supprimée.' });
    } catch (error) {
      console.error('Erreur dans deleteTask:', error);
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  }
};

module.exports = taskController;