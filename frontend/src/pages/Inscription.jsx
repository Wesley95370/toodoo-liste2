
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Inscription.css';

const Inscription = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csrfToken) {
      setError('Jeton CSRF manquant. Veuillez réessayer.');
      return;
    }
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        username,
        email,
        password,
      };
      console.log('Données envoyées à /register:', payload);
      const response = await axios.post(
        `${API_URL}/api/users/register`,
        payload,
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log('Inscription réussie:', response.data);
      navigate('/connexion');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l’inscription.';
      setError(errorMessage);
      console.error('Erreur inscription:', err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inscription-container">
      <div className="inscription-content">
        <h2 className="inscription-title">Inscription</h2>
        {error && <p className="inscription-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="inscription-form-group">
            <label className="inscription-label">Nom d’utilisateur :</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="inscription-input"
            />
          </div>
          <div className="inscription-form-group">
            <label className="inscription-label">Email :</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="inscription-input"
            />
          </div>
          <div className="inscription-form-group">
            <label className="inscription-label">Mot de passe :</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="inscription-input"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="inscription-button">
            S’inscrire
          </button>
        </form>
        <p className="inscription-footer">
          Déjà un compte ? <a href="/connexion" className="inscription-link">Se connecter</a>
        </p>
      </div>
    </div>
  );
};

export default Inscription;
