const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes publiques
router.post('/register', userController.register);
router.post('/login', userController.login);

// Route protégée (exemple)
router.get('/:id', userController.getUserById);

module.exports = router;