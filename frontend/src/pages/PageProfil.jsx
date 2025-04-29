
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageProfil.css';

const Profil = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    axios.get(`${API_URL}/api/csrf-token`, { withCredentials: true })
      .then((response) => {
        setCsrfToken(response.data.csrfToken);
        console.log('Jeton CSRF récupéré:', response.data.csrfToken);
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération du jeton CSRF:', err);
        setError('Impossible de récupérer le jeton CSRF. Vérifiez votre connexion.');
      });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!csrfToken) {
      setError('Jeton CSRF manquant. Veuillez réessayer.');
      return;
    }
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {};
      if (email) payload.email = email;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        setError('Veuillez fournir au moins un champ à modifier.');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/users/update`,
        payload,
        {
          headers: {
            'X-CSRF-Token': csrfToken,
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        }
      );
      console.log('Mise à jour réussie:', response.data);
      setSuccess('Informations mises à jour avec succès.');
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour.';
      setError(errorMessage);
      console.error('Erreur mise à jour:', err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return;
    }
    if (!csrfToken) {
      setError('Jeton CSRF manquant. Veuillez réessayer.');
      return;
    }
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await axios.delete(
        `${API_URL}/api/users/delete`,
        {
          headers: {
            'X-CSRF-Token': csrfToken,
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        }
      );
      console.log('Compte supprimé');
      localStorage.removeItem('token');
      navigate('/connexion');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression.';
      setError(errorMessage);
      console.error('Erreur suppression:', err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profil-container">
      <div className="profil-content">
        <h2 className="profil-title">Mon Profil</h2>
        {error && <p className="profil-error">{error}</p>}
        {success && <p className="profil-success">{success}</p>}
        <form onSubmit={handleUpdate}>
          <div className="profil-form-group">
            <label className="profil-label">Nouvel Email (facultatif) :</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="profil-input"
            />
          </div>
          <div className="profil-form-group">
            <label className="profil-label">Nouveau Mot de passe (facultatif) :</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="profil-input"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="profil-button">
            Mettre à jour
          </button>
        </form>
        <button onClick={handleDelete} disabled={isSubmitting} className="profil-delete-button">
          Supprimer mon compte
        </button>
        <p className="profil-footer">
          Retour à <a href="/todo" className="profil-link">mes tâches</a>
        </p>
      </div>
    </div>
  );
};

export default Profil;
