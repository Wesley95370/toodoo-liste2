import { useNavigate } from 'react-router-dom';
import './Accueil.css';

// Page d'accueil
const Accueil = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/connexion');
  };

  return (
    <div className="accueil-container">
      <div className="accueil-content">
        <h1 className="accueil-title">Bienvenue sur To-Do List</h1>
        <p className="accueil-description">
          Organisez vos tâches avec simplicité et efficacité.
        </p>
        <button className="accueil-button" onClick={handleStart}>
          Commencer
        </button>
      </div>
    </div>
  );
};

export default Accueil;