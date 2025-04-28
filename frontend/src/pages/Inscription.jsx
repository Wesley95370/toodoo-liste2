import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Inscription.css';

const Inscription = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        username,
        email,
        password
      });
      navigate('/connexion');
    } catch (err) {
      setError(err.response?.data.message || 'Erreur lors de l’inscription.');
    }
  };

  return (
    <div className="inscription-container">
      <div className="inscription-content">
        <h2 className="inscription-title">Inscription</h2>
        {error && <p className="inscription-error">{error}</p>}
        <div>
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
          <button onClick={handleSubmit} className="inscription-button">
            S’inscrire
          </button>
        </div>
        <p className="inscription-footer">
          Déjà un compte ? <a href="/connexion" className="inscription-link">Se connecter</a>
        </p>
      </div>
    </div>
  );
};

export default Inscription;