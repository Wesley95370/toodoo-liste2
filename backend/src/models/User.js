const pool = require('../config/db');

const Task = {
  // Créer une tâche
  async create({ title, description, user_id }) {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, user_id]
    );
    return result.rows[0];
  },

  // Trouver toutes les tâches d’un utilisateur
  async findByUserId(user_id) {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    return result.rows;
  },

  // Trouver une tâche par ID et user_id
  async findByIdAndUserId(id, user_id) {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, user_id]);
    return result.rows[0];
  },

  // Mettre à jour une tâche
  async update(id, { title, description, is_done }) {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, is_done = $3 WHERE id = $4 RETURNING *',
      [title, description, is_done, id]
    );
    return result.rows[0];
  },

  // Supprimer une tâche
  async delete(id) {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  }
};

module.exports = Task;