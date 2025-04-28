
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Connexion.css';

const Connexion = () => {
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
        email,
        password,
      };
      console.log('Données envoyées à /login:', payload);
      const response = await axios.post(
        `${API_URL}/api/users/login`,
        payload,
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
      localStorage.setItem('token', response.data.token);
      console.log('Connexion réussie:', response.data);
      navigate('/todo');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la connexion.';
      setError(errorMessage);
      console.error('Erreur connexion:', err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="connexion-container">
      <div className="connexion-content">
        <h2 className="connexion-title">Connexion</h2>
        {error && <p className="connexion-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="connexion-form-group">
            <label className="connexion-label">Email :</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="connexion-input"
            />
          </div>
          <div className="connexion-form-group">
            <label className="connexion-label">Mot de passe :</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="connexion-input"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="connexion-button">
            Se connecter
          </button>
        </form>
        <p className="connexion-footer">
          Pas de compte ? <a href="/inscription" className="inscription-link">S’inscrire</a>
        </p>
      </div>
    </div>
  );
};

export default Connexion;
