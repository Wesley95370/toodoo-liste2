import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageTodoList.css';

const PageTodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Récupérer les tâches au chargement de la page
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/connexion');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des tâches.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/connexion');
        }
      }
    };
    fetchTasks();
  }, [navigate]);

  // Ajouter une tâche
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/tasks',
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, response.data.task]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Erreur lors de l’ajout de la tâche.');
    }
  };

  // Marquer une tâche comme terminée
  const handleToggleDone = async (task) => {
    try {
      const token = localStorage.getItem('token');
      const updatedTask = await axios.put(
        `http://localhost:5000/api/tasks/${task.id}`,
        { title: task.title, description: task.description, is_done: !task.is_done },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask.data.task : t)));
    } catch (err) {
      setError('Erreur lors de la mise à jour de la tâche.');
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression de la tâche.');
    }
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/connexion');
  };

  return (
    <div className="todo-container">
      <div className="todo-content">
        <div className="todo-header">
          <h2 className="todo-title">Liste de Tâches</h2>
          <button className="todo-logout-button" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        {/* Formulaire pour ajouter une tâche */}
        <div className="todo-form">
          <div className="todo-form-group">
            <label className="todo-label">Titre :</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="todo-input"
            />
          </div>
          <div className="todo-form-group">
            <label className="todo-label">Description :</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="todo-textarea"
            />
          </div>
          <button onClick={handleAddTask} className="todo-button">
            Ajouter une tâche
          </button>
        </div>

        {/* Liste des tâches */}
        {error && <p className="todo-error">{error}</p>}
        {tasks.length === 0 ? (
          <p className="todo-empty">Aucune tâche pour le moment. Ajoutez-en une !</p>
        ) : (
          <ul className="todo-list">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`todo-item ${task.is_done ? 'done' : ''}`}
              >
                <div>
                  <h4 className="todo-item-title">{task.title}</h4>
                  <p className="todo-item-description">
                    {task.description || 'Aucune description'}
                  </p>
                </div>
                <div className="todo-item-actions">
                  <button
                    onClick={() => handleToggleDone(task)}
                    className="todo-toggle-button"
                  >
                    {task.is_done ? 'Non terminée' : 'Terminée'}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="todo-delete-button"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PageTodoList;