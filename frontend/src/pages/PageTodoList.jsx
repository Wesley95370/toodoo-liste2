import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Ajout de Link
import axios from 'axios';
import './PageTodoList.css';

const PageTodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Récupérer le jeton CSRF et les tâches au chargement
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/csrf-token`, { withCredentials: true });
        setCsrfToken(response.data.csrfToken);
      } catch (err) {
        setError('Impossible de récupérer le jeton CSRF.');
      }
    };

    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/connexion');
          return;
        }
        const response = await axios.get(`${API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
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

    fetchCsrfToken();
    fetchTasks();
  }, [navigate]);

  // Ajouter une tâche
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!csrfToken) {
      setError('Jeton CSRF manquant.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/tasks`,
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
      setTasks([...tasks, response.data.task]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l’ajout de la tâche.');
    }
  };

  // Marquer une tâche comme terminée
  const handleToggleDone = async (task) => {
    if (!csrfToken) {
      setError('Jeton CSRF manquant.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const updatedTask = await axios.put(
        `${API_URL}/api/tasks/${task.id}`,
        { title: task.title, description: task.description, is_done: !task.is_done },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask.data.task : t)));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de la tâche.');
    }
  };

  // Modifier une tâche
  const handleEditTask = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleUpdateTask = async (taskId) => {
    if (!csrfToken) {
      setError('Jeton CSRF manquant.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const updatedTask = await axios.put(
        `${API_URL}/api/tasks/${taskId}`,
        { title: editTitle, description: editDescription, is_done: tasks.find((t) => t.id === taskId).is_done },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask.data.task : t)));
      setEditingTask(null);
      setEditTitle('');
      setEditDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de la tâche.');
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (id) => {
    if (!csrfToken) {
      setError('Jeton CSRF manquant.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-CSRF-Token': csrfToken,
        },
        withCredentials: true,
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression de la tâche.');
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
          <div>
            <Link to="/profil" className="todo-profile-link">Mon Profil</Link> {/* Modifié */}
            <button className="todo-logout-button" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
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
          <button onClick={handleAddTask} className="todo-button" disabled={!title}>
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
                {editingTask === task.id ? (
                  <div className="todo-edit-form">
                    <div className="todo-form-group">
                      <label className="todo-label">Titre :</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                        className="todo-input"
                      />
                    </div>
                    <div className="todo-form-group">
                      <label className="todo-label">Description :</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="todo-textarea"
                      />
                    </div>
                    <div className="todo-item-actions">
                      <button
                        onClick={() => handleUpdateTask(task.id)}
                        className="todo-button"
                        disabled={!editTitle}
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setEditingTask(null)}
                        className="todo-button todo-cancel-button"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="todo-view">
                    <div>
                      <h4 className="todo-item-title">{task.title}</h4>
                      <p className="todo-item-description">
                        {task.description || 'Aucune description'}
                      </p>
                    </div>
                    <div className="todo-item-actions">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="todo-button"
                      >
                        Modifier
                      </button>
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
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PageTodoList;