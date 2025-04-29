import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Connexion.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le jeton CSRF au chargement
    const fetchCsrfToken = async () => {
      try {
        console.log('Tentative de récupération du jeton CSRF');
        const response = await axios.get(`${API_URL}/api/csrf-token`, {
          withCredentials: true,
        });
        console.log('Jeton CSRF reçu:', response.data.csrfToken);
        setCsrfToken(response.data.csrfToken);
      } catch (err) {
        console.error('Erreur lors de la récupération du jeton CSRF:', err);
        setError('Impossible de récupérer le jeton CSRF. Vérifiez votre connexion.');
      }
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Tentative de connexion avec:', { email, csrfToken });
      const response = await axios.post(
        `${API_URL}/api/users/login`,
        { email, password },
        {
          headers: {
            'X-CSRF-Token': csrfToken, // Réactivé
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      console.log('Connexion réussie:', response.data);

      localStorage.setItem('token', response.data.token);
      navigate('/todo');
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      if (err.response) {
        setError(err.response.data.message || 'Erreur lors de la connexion.');
      } else {
        setError('Erreur réseau. Vérifiez votre connexion.');
      }
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
              className="connexion-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="connexion-form-group">
            <label className="connexion-label">Mot de passe :</label>
            <input
              className="connexion-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="connexion-button" type="submit">
            Se connecter
          </button>
        </form>
        <p className="connexion-footer">
          Pas de compte ?{' '}
          <Link className="connexion-link" to="/inscription">
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
}