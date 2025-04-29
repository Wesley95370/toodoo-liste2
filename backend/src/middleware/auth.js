const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
      console.log('Aucun token fourni dans la requête:', req.headers);
      return res.status(401).json({ message: 'Token manquant.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token vérifié:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur dans authMiddleware:', error);
    res.status(401).json({ message: 'Token invalide.', error: error.message });
  }
};

module.exports = authMiddleware;