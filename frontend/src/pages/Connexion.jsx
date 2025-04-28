import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Connexion.css';

const Connexion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      navigate('/todo');
    } catch (err) {
      setError(err.response?.data.message || 'Erreur lors de la connexion.');
    }
  };

  return (
    <div className="connexion-container">
      <div className="connexion-content">
        <h2 className="connexion-title">Connexion</h2>
        {error && <p className="connexion-error">{error}</p>}
        <div>
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
          <button onClick={handleSubmit} className="connexion-button">
            Se connecter
          </button>
        </div>
        <p className="connexion-footer">
          Pas de compte ? <a href="/inscription" className="connexion-link">S’inscrire</a>
        </p>
      </div>
    </div>
  );
};

export default Connexion;